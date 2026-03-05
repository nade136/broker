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
