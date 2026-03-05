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
