-- Run this in Supabase Dashboard → SQL Editor to create deposit_method_config and user_crypto_addresses.
-- (Combined from migrations 011 and 013.)

-- 1) deposit_method_config
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
create unique index if not exists deposit_method_config_global_method on public.deposit_method_config (method_id) where scope = 'global';
create unique index if not exists deposit_method_config_user_method on public.deposit_method_config (scope_id, method_id) where scope = 'user';
create index if not exists deposit_method_config_scope_id on public.deposit_method_config (scope, scope_id);
alter table public.deposit_method_config enable row level security;
drop policy if exists "Users can read global and own deposit method config" on public.deposit_method_config;
create policy "Users can read global and own deposit method config"
  on public.deposit_method_config for select
  using (scope = 'global' or (scope = 'user' and scope_id = auth.uid()));
comment on table public.deposit_method_config is 'Which deposit methods are shown on user Deposit page: global default or per-user override.';
insert into public.deposit_method_config (scope, scope_id, method_id, enabled)
select 'global', null, 'crypto', true where not exists (select 1 from public.deposit_method_config where scope = 'global' and method_id = 'crypto');

-- 2) user_crypto_addresses
create table if not exists public.user_crypto_addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  coin text not null,
  address text not null,
  created_at timestamptz not null default now()
);
create index if not exists user_crypto_addresses_user_id on public.user_crypto_addresses(user_id);
alter table public.user_crypto_addresses enable row level security;
drop policy if exists "Users can read own crypto addresses" on public.user_crypto_addresses;
create policy "Users can read own crypto addresses"
  on public.user_crypto_addresses for select
  using (auth.uid() = user_id);
comment on table public.user_crypto_addresses is 'Wallet addresses per user; admin manages, user sees on Deposit page.';
