-- =============================================================================
-- Full database schema for this app (Supabase / Postgres)
-- =============================================================================
-- Run once in: Supabase Dashboard → SQL → New query → paste → Run
--
-- Use a new empty project, OR only if you have NOT already applied these
-- migrations (re-applying can conflict on some objects).
--
-- After running:
-- 1) Storage: create bucket "deposit-screenshots" (and KYC bucket if you use it)
--    as required by your app / storage policy SQL files in supabase/.
-- 2) First admin: Authentication → Users → Add user → then in SQL:
--      update public.profiles set role = 'admin', account_status = 'approved'
--      where id = 'PASTE-USER-UUID';
--
-- Source: concatenation of supabase/migrations/001 … 019 (same order as numbered files).
-- =============================================================================



-- ============================================================================
-- 001_auth_schema.sql
-- ============================================================================

-- ============================================
-- Bitrexify Auth Schema
-- Admin: separate, email + password (no self-register)
-- User: register + login (email + password)
-- ============================================

-- 1. Profiles: one row per auth user (user or admin)
-- id matches auth.users(id). role = 'user' | 'admin'
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  role text not null default 'user' check (role in ('user', 'admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Index for role (admin check)
create index if not exists profiles_role_idx on public.profiles(role);

-- 2. Trigger: create profile on signup (default role = user)
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', ''),
    'user'
  );
  return new;
end;
$$;

-- Drop trigger if exists (idempotent)
drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 3. RLS
alter table public.profiles enable row level security;

-- Users can read and update their own profile
create policy "Users can read own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Admins can read all profiles (for admin dashboard)
create policy "Admins can read all profiles"
  on public.profiles for select
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

-- Only admins can update other profiles (e.g. suspend user)
create policy "Admins can update any profile"
  on public.profiles for update
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

-- 4. Service role can do anything (for backend); anon can only insert via trigger
-- No policy for insert: trigger runs as definer, so profile is created. Users cannot insert profiles directly.

-- 5. updated_at trigger
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_updated_at on public.profiles;
create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- ============================================
-- First admin: create manually
-- ============================================
-- 1. In Supabase Dashboard: Authentication > Users > "Add user" (email + password).
-- 2. Copy the new user's UUID from the table.
-- 3. Run in SQL Editor:
--
--    update public.profiles set role = 'admin' where id = 'PASTE-UUID-HERE';
--
-- That user can now log in to /admin/login. Everyone else who signs up is role = 'user'.
-- ============================================


-- ============================================================================
-- 002_fix_profiles_rls.sql
-- ============================================================================

-- Fix 500 on profiles: avoid RLS recursion by using a security definer function
-- for admin checks. Run this in Supabase SQL Editor after 001_auth_schema.sql.

create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- Drop old admin policies that read from profiles again (causes recursion)
drop policy if exists "Admins can read all profiles" on public.profiles;
drop policy if exists "Admins can update any profile" on public.profiles;

-- Recreate using the function (no recursion)
create policy "Admins can read all profiles"
  on public.profiles for select
  using (public.is_admin());

create policy "Admins can update any profile"
  on public.profiles for update
  using (public.is_admin());

-- Backfill: ensure every auth user has a profile (for users created before the trigger existed)
insert into public.profiles (id, email, full_name, role)
select u.id, u.email, coalesce(u.raw_user_meta_data->>'full_name', u.raw_user_meta_data->>'name', ''), 'user'
from auth.users u
where not exists (select 1 from public.profiles p where p.id = u.id)
on conflict (id) do nothing;


-- ============================================================================
-- 003_disable_profiles_rls.sql
-- ============================================================================

-- Disable RLS on profiles: no row-level restrictions.
-- Run this in Supabase SQL Editor. Anyone with the anon/service key can then read/write profiles.

-- Drop all policies on public.profiles
drop policy if exists "Users can read own profile" on public.profiles;
drop policy if exists "Users can update own profile" on public.profiles;
drop policy if exists "Admins can read all profiles" on public.profiles;
drop policy if exists "Admins can update any profile" on public.profiles;

-- Turn off RLS
alter table public.profiles disable row level security;


-- ============================================================================
-- 004_notifications.sql
-- ============================================================================

-- ============================================
-- Notifications: admin inbox for signup, login, withdrawal, deposit proof, etc.
-- ============================================
--
-- Storage: Create a bucket "deposit-screenshots" in Supabase Dashboard (Storage).
-- - Public bucket (so getPublicUrl() works for admin to open screenshots).
-- - Policy: Allow authenticated users to INSERT (upload) into the bucket.
-- ============================================

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in (
    'new_signup',
    'login',
    'withdrawal_request',
    'deposit_proof',
    'maturity_pending'
  )),
  user_id uuid references public.profiles(id) on delete set null,
  title text not null,
  message text,
  metadata jsonb default '{}',
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists notifications_created_at_idx on public.notifications(created_at desc);
create index if not exists notifications_read_at_idx on public.notifications(read_at) where read_at is null;
create index if not exists notifications_type_idx on public.notifications(type);

-- Only service role / admin backend should write; admins read via dashboard.
-- RLS: allow service role; allow select for admin users (via app using service role for admin routes).
alter table public.notifications enable row level security;

-- Allow all operations for service role (bypasses RLS when using createSupabaseAdmin()).
-- No policy needed for anon: admin dashboard uses server-side with service role.

-- Policy: no direct anon/authenticated access; app uses service role for admin notifications page.
create policy "Service role only"
  on public.notifications
  for all
  using (false)
  with check (false);

-- Drop the restrictive policy so server (service role) can do everything. Service role bypasses RLS.
-- Actually with "using (false)" only service role can bypass. So we need no policies for authenticated users
-- and let service role handle. In Supabase, when you use service_role key, RLS is bypassed. So we need
-- to allow admins to read: but admin dashboard will use createSupabaseAdmin() which uses service_role,
-- so RLS is bypassed. So the policy "using (false)" would block everyone including service role? No -
-- in Postgres/Supabase, the service_role key bypasses RLS. So we're good. But then why add a policy?
-- If we have no policies, no one can access. So we need at least one policy for the role that the app uses.
-- When Next.js server calls createSupabaseAdmin(), it uses service_role which bypasses RLS. So actually
-- we can leave RLS enabled and have no policies - then only service role (bypass) can access. Let me remove
-- the policy and just enable RLS; service role bypasses RLS in Supabase.
drop policy if exists "Service role only" on public.notifications;

-- RLS enabled, no policies: only service_role (used in server) can access. Anon/key cannot.
-- That's correct for admin-only notifications.

comment on table public.notifications is 'Admin notifications: new signup, login, withdrawal, deposit proof, etc.';
comment on column public.notifications.metadata is 'e.g. { "amount": "100", "payment_method": "Buy with USD", "screenshot_path": "..." }';

-- Notify admin when a new user signs up (trigger on profiles insert)
create or replace function public.notify_admin_new_signup()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.notifications (type, user_id, title, message, metadata)
  values (
    'new_signup',
    new.id,
    'New user signed up',
    new.email || ' just created an account.',
    jsonb_build_object('email', new.email, 'full_name', new.full_name)
  );
  return new;
end;
$$;

drop trigger if exists on_profile_created_notify on public.profiles;
create trigger on_profile_created_notify
  after insert on public.profiles
  for each row execute function public.notify_admin_new_signup();


-- ============================================================================
-- 005_plans.sql
-- ============================================================================

-- ============================================
-- Plans: trading and mining plans (admin-created)
-- User dashboard shows visible plans; user can select one.
-- ============================================

create table if not exists public.plans (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('trading', 'mining')),
  title text not null,
  description text,
  visible boolean not null default true,
  profit_percentage numeric(5,2) not null default 0,
  minimum_profit numeric(18,2) not null default 0,
  term_days integer not null default 30,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists plans_visible_idx on public.plans(visible) where visible = true;
create index if not exists plans_type_idx on public.plans(type);

-- updated_at trigger
create or replace function public.set_plans_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists plans_updated_at on public.plans;
create trigger plans_updated_at
  before update on public.plans
  for each row execute function public.set_plans_updated_at();

-- RLS: only server (service role) writes; anon/authenticated can read visible plans for user dashboard
alter table public.plans enable row level security;

-- Anyone can read visible plans (for user dashboard Plans page)
create policy "Anyone can read visible plans"
  on public.plans for select
  using (visible = true);

-- Insert/update/delete: no policies = only service role (admin server) can do it.

comment on table public.plans is 'Trading and mining plans. Admin creates/edits via dashboard (service role).';


-- ============================================================================
-- 006_user_plan_selection.sql
-- ============================================================================

-- ============================================
-- User plan selection: which plan the user picked on the dashboard
-- ============================================

create table if not exists public.user_plan_selection (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  plan_id uuid not null references public.plans(id) on delete cascade,
  selected_at timestamptz not null default now(),
  unique(user_id)
);

create index if not exists user_plan_selection_user_id_idx on public.user_plan_selection(user_id);
create index if not exists user_plan_selection_plan_id_idx on public.user_plan_selection(plan_id);

alter table public.user_plan_selection enable row level security;

-- Users can read and update their own selection
create policy "Users can read own plan selection"
  on public.user_plan_selection for select
  using (auth.uid() = user_id);

create policy "Users can insert own plan selection"
  on public.user_plan_selection for insert
  with check (auth.uid() = user_id);

create policy "Users can update own plan selection"
  on public.user_plan_selection for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Admins need to read all (via service role)
comment on table public.user_plan_selection is 'Which plan the user selected on dashboard Plans page.';


-- ============================================================================
-- 007_profiles_balances.sql
-- ============================================================================

-- ============================================
-- Extend profiles (My Info) + account_balances (four accounts per user)
-- ============================================

-- 1. Add columns to profiles for admin "My Info" (firstname, lastname, address, status)
alter table public.profiles
  add column if not exists firstname text,
  add column if not exists lastname text,
  add column if not exists address text,
  add column if not exists status text default 'Active' check (status in ('Active', 'Suspended', 'Deleted'));

-- Backfill firstname/lastname from full_name for existing rows (optional)
update public.profiles
set
  firstname = case when firstname is null and full_name is not null then trim(split_part(full_name, ' ', 1)) else firstname end,
  lastname = case when lastname is null and full_name is not null and position(' ' in full_name) > 0 then trim(substring(full_name from position(' ' in full_name) + 1)) else lastname end
where full_name is not null and (firstname is null or lastname is null);

-- 2. account_balances: one row per (user_id, account_type)
create table if not exists public.account_balances (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  account_type text not null check (account_type in ('spot', 'profit', 'initial_deposit', 'mining')),
  balance numeric(18,2) not null default 0,
  updated_at timestamptz not null default now(),
  unique(user_id, account_type)
);

create index if not exists account_balances_user_id_idx on public.account_balances(user_id);

-- updated_at trigger
create or replace function public.set_account_balances_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists account_balances_updated_at on public.account_balances;
create trigger account_balances_updated_at
  before update on public.account_balances
  for each row execute function public.set_account_balances_updated_at();

alter table public.account_balances enable row level security;

-- Users can read own balances (dashboard home)
create policy "Users can read own balances"
  on public.account_balances for select
  using (auth.uid() = user_id);

-- No insert/update for anon/authenticated; admin uses service role to manage
comment on table public.account_balances is 'Spot, Profit, Initial Deposit, Mining per user. Admin edits on user detail.';


-- ============================================================================
-- 008_maturity.sql
-- ============================================================================

-- ============================================
-- Maturity: when plan term is reached, create event and approval (admin email, 5-min auto-approve)
-- ============================================

create table if not exists public.maturity_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  plan_id uuid not null references public.plans(id) on delete cascade,
  base_amount numeric(18,2) not null,
  profit_percentage numeric(5,2) not null,
  term_days integer not null,
  maturity_amount numeric(18,2) not null,
  maturity_reached_at timestamptz not null default now(),
  status text not null default 'pending_admin' check (status in ('pending_admin', 'approved', 'rejected', 'auto_approved')),
  applied_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists maturity_events_user_id_idx on public.maturity_events(user_id);
create index if not exists maturity_events_status_idx on public.maturity_events(status);

create table if not exists public.maturity_approvals (
  id uuid primary key default gen_random_uuid(),
  maturity_event_id uuid not null references public.maturity_events(id) on delete cascade unique,
  admin_email text,
  notification_sent_at timestamptz,
  expires_at timestamptz,
  resolution text check (resolution in ('approved', 'rejected', 'auto_approved')),
  resolved_at timestamptz,
  resolved_by uuid references public.profiles(id) on delete set null,
  admin_note text,
  edited_amount numeric(18,2),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists maturity_approvals_expires_idx on public.maturity_approvals(expires_at) where resolution is null;

alter table public.maturity_events enable row level security;
alter table public.maturity_approvals enable row level security;

-- No policies: only service role (cron, admin actions) accesses these tables.
comment on table public.maturity_events is 'Profit maturity reached; admin approve/reject or auto after 5 min.';
comment on table public.maturity_approvals is 'Pending admin action; expires_at triggers auto-approve.';


-- ============================================================================
-- 009_admin_user_messages.sql
-- ============================================================================

-- ============================================
-- Admin–user messages: thread per user; admin sends/receives from user page, user from dashboard.
-- ============================================

create table if not exists public.admin_user_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  from_admin boolean not null default true,
  body text not null,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists admin_user_messages_user_id_idx on public.admin_user_messages(user_id);
create index if not exists admin_user_messages_created_at_idx on public.admin_user_messages(created_at);

alter table public.admin_user_messages enable row level security;

-- Users can read and insert their own messages (their thread only)
create policy "Users can read own messages"
  on public.admin_user_messages for select
  using (auth.uid() = user_id);

create policy "Users can insert own messages"
  on public.admin_user_messages for insert
  with check (auth.uid() = user_id and from_admin = false);

-- Users can update read_at on messages sent to them (from_admin = true) so they can mark as read
create policy "Users can update own thread read_at"
  on public.admin_user_messages for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Admin uses service role (bypasses RLS) to read/write any thread
comment on table public.admin_user_messages is 'Messages between admin and a user; admin from user page, user from dashboard.';


-- ============================================================================
-- 010_bonus_deposit_submissions_transfer_history.sql
-- ============================================================================

-- ============================================
-- Bonus balance, deposit submissions (accept/decline), transfer history
-- ============================================

-- 1. Add 'bonus' to account_balances (admin-editable; user sees on Dashboard → Bonus)
alter table public.account_balances drop constraint if exists account_balances_account_type_check;
alter table public.account_balances add constraint account_balances_account_type_check
  check (account_type in ('spot', 'profit', 'initial_deposit', 'mining', 'bonus'));

-- 2. Deposit submissions: one row per user deposit proof; admin accepts or declines
create table if not exists public.deposit_submissions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  notification_id uuid references public.notifications(id) on delete set null,
  amount numeric(18,2),
  payment_method text,
  screenshot_path text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  reviewed_at timestamptz,
  admin_note text,
  created_at timestamptz not null default now()
);

create index if not exists deposit_submissions_user_id_idx on public.deposit_submissions(user_id);
create index if not exists deposit_submissions_status_idx on public.deposit_submissions(status);

alter table public.deposit_submissions enable row level security;
-- No policies: admin uses service role. Users could be allowed to select own rows for read-only history.

comment on table public.deposit_submissions is 'User deposit proof submissions; admin accept/decline updates status and user balance.';

-- 3. Transfer history: recorded for both admin and user (deposits, withdrawals, credits)
create table if not exists public.transfer_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  type text not null check (type in ('deposit', 'withdrawal', 'credit', 'debit', 'bonus')),
  amount numeric(18,2) not null,
  status text not null default 'completed' check (status in ('pending', 'completed', 'rejected', 'cancelled')),
  reference_type text,
  reference_id uuid,
  note text,
  created_at timestamptz not null default now()
);

create index if not exists transfer_history_user_id_idx on public.transfer_history(user_id);
create index if not exists transfer_history_created_at_idx on public.transfer_history(created_at desc);

alter table public.transfer_history enable row level security;

create policy "Users can read own transfer history"
  on public.transfer_history for select
  using (auth.uid() = user_id);

comment on table public.transfer_history is 'Deposit/withdrawal/credit history for admin and user views.';


-- ============================================================================
-- 011_deposit_method_config.sql
-- ============================================================================

-- Global and per-user deposit method visibility (user dashboard → Deposit shows only enabled methods)
create table if not exists public.deposit_method_config (
  id uuid primary key default gen_random_uuid(),
  scope text not null check (scope in ('global', 'user')),
  scope_id uuid references public.profiles(id) on delete cascade,
  method_id text not null,
  enabled boolean not null default true,
  created_at timestamptz not null default now(),
  constraint scope_global_no_user check (scope != 'global' or scope_id is null),
  constraint scope_user_has_id check (scope != 'user' or scope_id is not null)
);

create unique index deposit_method_config_global_method on public.deposit_method_config (method_id) where scope = 'global';
create unique index deposit_method_config_user_method on public.deposit_method_config (scope_id, method_id) where scope = 'user';

create index deposit_method_config_scope_id on public.deposit_method_config (scope, scope_id);

alter table public.deposit_method_config enable row level security;

-- Users can read global config and their own user overrides (to see which deposit methods are enabled)
create policy "Users can read global and own deposit method config"
  on public.deposit_method_config for select
  using (scope = 'global' or (scope = 'user' and scope_id = auth.uid()));

comment on table public.deposit_method_config is 'Which deposit methods are shown on user Deposit page: global default or per-user override.';

-- Seed global default: crypto and usd enabled for all users
insert into public.deposit_method_config (scope, scope_id, method_id, enabled)
select 'global', null, 'crypto', true where not exists (select 1 from public.deposit_method_config where scope = 'global' and method_id = 'crypto');
insert into public.deposit_method_config (scope, scope_id, method_id, enabled)
select 'global', null, 'usd', true where not exists (select 1 from public.deposit_method_config where scope = 'global' and method_id = 'usd');


-- ============================================================================
-- 012_site_settings_min_withdrawal.sql
-- ============================================================================

-- Site-wide settings (admin-editable); e.g. minimum withdrawal for user dashboard
create table if not exists public.site_settings (
  key text primary key,
  value text not null default '',
  updated_at timestamptz not null default now()
);

comment on table public.site_settings is 'Key-value settings for the platform (e.g. min_withdrawal_usd).';

-- Seed default minimum withdrawal (USD)
insert into public.site_settings (key, value)
values ('min_withdrawal_usd', '0')
on conflict (key) do nothing;

alter table public.site_settings enable row level security;

-- Allow authenticated users to read (e.g. for withdraw page min amount)
create policy "Anyone can read site_settings"
  on public.site_settings for select
  to authenticated
  using (true);

-- Only service role can write (admin actions use createSupabaseAdmin())


-- ============================================================================
-- 013_user_crypto_addresses.sql
-- ============================================================================

-- Wallet addresses per user (admin adds in user detail → Payment & withdrawal). User sees these on Deposit page to copy and pay.
create table if not exists public.user_crypto_addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  coin text not null,
  address text not null,
  created_at timestamptz not null default now()
);

create index if not exists user_crypto_addresses_user_id on public.user_crypto_addresses(user_id);

alter table public.user_crypto_addresses enable row level security;

create policy "Users can read own crypto addresses"
  on public.user_crypto_addresses for select
  using (auth.uid() = user_id);

comment on table public.user_crypto_addresses is 'Wallet addresses per user; admin manages, user sees on Deposit page.';


-- ============================================================================
-- 014_withdrawal_method_config_and_options.sql
-- ============================================================================

-- Withdrawal methods: which are enabled per user (or global), and multiple options per method (like crypto addresses).
-- User dashboard Withdraw shows only enabled methods; each method can have multiple options (e.g. multiple bank accounts).

-- 1) Which withdrawal methods are enabled (global or per-user)
create table if not exists public.withdrawal_method_config (
  id uuid primary key default gen_random_uuid(),
  scope text not null check (scope in ('global', 'user')),
  scope_id uuid references public.profiles(id) on delete cascade,
  method_id text not null check (method_id in ('bank', 'crypto', 'paypal', 'cashapp')),
  enabled boolean not null default true,
  created_at timestamptz not null default now(),
  constraint wmc_scope_global_no_user check (scope != 'global' or scope_id is null),
  constraint wmc_scope_user_has_id check (scope != 'user' or scope_id is not null)
);
create unique index if not exists wmc_global_method on public.withdrawal_method_config (method_id) where scope = 'global';
create unique index if not exists wmc_user_method on public.withdrawal_method_config (scope_id, method_id) where scope = 'user';
create index if not exists wmc_scope_id on public.withdrawal_method_config (scope, scope_id);
alter table public.withdrawal_method_config enable row level security;
drop policy if exists "Users read own withdrawal method config" on public.withdrawal_method_config;
create policy "Users read own withdrawal method config"
  on public.withdrawal_method_config for select
  using (scope = 'global' or (scope = 'user' and scope_id = auth.uid()));

-- Seed global: all four enabled
insert into public.withdrawal_method_config (scope, scope_id, method_id, enabled)
select 'global', null, 'bank', true where not exists (select 1 from public.withdrawal_method_config where scope = 'global' and method_id = 'bank');
insert into public.withdrawal_method_config (scope, scope_id, method_id, enabled)
select 'global', null, 'crypto', true where not exists (select 1 from public.withdrawal_method_config where scope = 'global' and method_id = 'crypto');
insert into public.withdrawal_method_config (scope, scope_id, method_id, enabled)
select 'global', null, 'paypal', true where not exists (select 1 from public.withdrawal_method_config where scope = 'global' and method_id = 'paypal');
insert into public.withdrawal_method_config (scope, scope_id, method_id, enabled)
select 'global', null, 'cashapp', true where not exists (select 1 from public.withdrawal_method_config where scope = 'global' and method_id = 'cashapp');

-- 2) Multiple withdrawal options per user for bank, paypal, cashapp (crypto uses user_crypto_addresses)
create table if not exists public.user_withdrawal_options (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  method_id text not null check (method_id in ('bank', 'paypal', 'cashapp')),
  detail text not null default '',
  created_at timestamptz not null default now()
);
create index if not exists uwo_user_id on public.user_withdrawal_options(user_id);
create index if not exists uwo_user_method on public.user_withdrawal_options(user_id, method_id);
alter table public.user_withdrawal_options enable row level security;
drop policy if exists "Users read own withdrawal options" on public.user_withdrawal_options;
create policy "Users read own withdrawal options"
  on public.user_withdrawal_options for select
  using (auth.uid() = user_id);

comment on table public.withdrawal_method_config is 'Which withdrawal methods are shown on user Withdraw page: global or per-user.';
comment on table public.user_withdrawal_options is 'Multiple options per user for bank/paypal/cashapp (e.g. multiple bank accounts). Crypto uses user_crypto_addresses.';


-- ============================================================================
-- 015_plans_deposit_amount_and_deposit_submission_plan.sql
-- ============================================================================

-- Plan deposit amount: each plan has a set amount the user must deposit; when they pay and send screenshot, that amount is recorded and (when admin accepts) credited on the user dashboard.
-- Also link deposit_submissions to the plan so we know which plan the deposit was for.

alter table public.plans
  add column if not exists deposit_amount numeric(18,2) not null default 0;

comment on column public.plans.deposit_amount is 'Required deposit amount for this plan. Shown on Deposit page; when user sends proof, this amount is submitted and credited on accept.';

alter table public.deposit_submissions
  add column if not exists plan_id uuid references public.plans(id) on delete set null;

create index if not exists deposit_submissions_plan_id_idx on public.deposit_submissions(plan_id);
comment on column public.deposit_submissions.plan_id is 'Plan the user was depositing for (from deposit URL ?plan=).';


-- ============================================================================
-- 016_transfer_history_user_delete.sql
-- ============================================================================

-- Allow users to delete their own transfer history (for "Clear history" on dashboard → Transactions).
create policy "Users can delete own transfer history"
  on public.transfer_history for delete
  using (auth.uid() = user_id);


-- ============================================================================
-- 017_withdrawal_requests.sql
-- ============================================================================

-- Withdrawal requests: user submits their payout details; admin approves or declines.
create table if not exists public.withdrawal_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  notification_id uuid references public.notifications(id) on delete set null,
  method text not null,
  amount numeric(18,2) not null,
  payout_details text not null,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists withdrawal_requests_user_id on public.withdrawal_requests(user_id);
create index if not exists withdrawal_requests_notification_id on public.withdrawal_requests(notification_id);
create index if not exists withdrawal_requests_status on public.withdrawal_requests(status);

alter table public.withdrawal_requests enable row level security;
-- No policies: only admin (service role) reads/writes.

comment on table public.withdrawal_requests is 'User withdrawal requests; admin approve/decline. payout_details = bank/wallet/PayPal/CashApp details user submitted.';


-- ============================================================================
-- 018_kyc_submissions.sql
-- ============================================================================

-- ============================================
-- KYC (document verification) submissions
-- User submits ID (and optional selfie); admin approves or rejects
-- ============================================

create table if not exists public.kyc_submissions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  id_document_url text,
  selfie_url text,
  submitted_at timestamptz not null default now(),
  reviewed_at timestamptz,
  reviewed_by uuid references public.profiles(id) on delete set null,
  rejection_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id)
);

create index if not exists kyc_submissions_user_id_idx on public.kyc_submissions(user_id);
create index if not exists kyc_submissions_status_idx on public.kyc_submissions(status);

alter table public.kyc_submissions enable row level security;

-- Users can read their own submission
create policy "Users can read own kyc"
  on public.kyc_submissions for select
  using (auth.uid() = user_id);

-- Users can insert their own (first submission)
create policy "Users can insert own kyc"
  on public.kyc_submissions for insert
  with check (auth.uid() = user_id);

-- Users can update their own (resubmit: set new docs and status = pending)
create policy "Users can update own kyc"
  on public.kyc_submissions for update
  using (auth.uid() = user_id);

-- Admin actions (approve/reject) use service role; no policy needed for that

drop trigger if exists kyc_submissions_updated_at on public.kyc_submissions;
create trigger kyc_submissions_updated_at
  before update on public.kyc_submissions
  for each row execute function public.set_updated_at();

comment on table public.kyc_submissions is 'KYC document verification: one row per user; admin approves or rejects.';


-- ============================================================================
-- 019_account_approval.sql
-- ============================================================================

-- Account approval: new self-serve signups start as pending_approval until an admin accepts them in Notifications.

alter table public.profiles
  add column if not exists account_status text not null default 'pending_approval'
    check (account_status in ('pending_approval', 'approved', 'rejected'));

comment on column public.profiles.account_status is 'Self-serve signups: pending until admin approves in admin notifications; admins should stay approved.';

-- Existing users and manually created admins keep full access
update public.profiles set account_status = 'approved' where account_status = 'pending_approval';

-- New rows from handle_new_user() still need default pending; after backfill, set default for future inserts
alter table public.profiles alter column account_status set default 'pending_approval';

create index if not exists profiles_account_status_idx on public.profiles(account_status);
