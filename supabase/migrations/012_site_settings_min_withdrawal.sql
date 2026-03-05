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
