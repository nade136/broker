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
