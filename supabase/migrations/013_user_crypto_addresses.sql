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
