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
