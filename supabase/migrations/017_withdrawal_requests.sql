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
