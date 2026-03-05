-- Run this in Supabase Dashboard → SQL Editor to create withdrawal_method_config and user_withdrawal_options.
-- (From migration 014.) After this, admin can enable/disable Bank, Crypto, Paypal, CashApp per user and add multiple options for each.

-- 1) withdrawal_method_config
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
insert into public.withdrawal_method_config (scope, scope_id, method_id, enabled)
select 'global', null, 'bank', true where not exists (select 1 from public.withdrawal_method_config where scope = 'global' and method_id = 'bank');
insert into public.withdrawal_method_config (scope, scope_id, method_id, enabled)
select 'global', null, 'crypto', true where not exists (select 1 from public.withdrawal_method_config where scope = 'global' and method_id = 'crypto');
insert into public.withdrawal_method_config (scope, scope_id, method_id, enabled)
select 'global', null, 'paypal', true where not exists (select 1 from public.withdrawal_method_config where scope = 'global' and method_id = 'paypal');
insert into public.withdrawal_method_config (scope, scope_id, method_id, enabled)
select 'global', null, 'cashapp', true where not exists (select 1 from public.withdrawal_method_config where scope = 'global' and method_id = 'cashapp');

-- 2) user_withdrawal_options
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
