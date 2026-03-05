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
