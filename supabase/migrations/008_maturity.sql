-- ============================================
-- Maturity: when plan term is reached, create event and approval (admin email, 5-min auto-approve)
-- ============================================

create table if not exists public.maturity_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  plan_id uuid not null references public.plans(id) on delete cascade,
  base_amount numeric(18,2) not null,
  profit_percentage numeric(5,2) not null,
  term_days integer not null,
  maturity_amount numeric(18,2) not null,
  maturity_reached_at timestamptz not null default now(),
  status text not null default 'pending_admin' check (status in ('pending_admin', 'approved', 'rejected', 'auto_approved')),
  applied_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists maturity_events_user_id_idx on public.maturity_events(user_id);
create index if not exists maturity_events_status_idx on public.maturity_events(status);

create table if not exists public.maturity_approvals (
  id uuid primary key default gen_random_uuid(),
  maturity_event_id uuid not null references public.maturity_events(id) on delete cascade unique,
  admin_email text,
  notification_sent_at timestamptz,
  expires_at timestamptz,
  resolution text check (resolution in ('approved', 'rejected', 'auto_approved')),
  resolved_at timestamptz,
  resolved_by uuid references public.profiles(id) on delete set null,
  admin_note text,
  edited_amount numeric(18,2),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists maturity_approvals_expires_idx on public.maturity_approvals(expires_at) where resolution is null;

alter table public.maturity_events enable row level security;
alter table public.maturity_approvals enable row level security;

-- No policies: only service role (cron, admin actions) accesses these tables.
comment on table public.maturity_events is 'Profit maturity reached; admin approve/reject or auto after 5 min.';
comment on table public.maturity_approvals is 'Pending admin action; expires_at triggers auto-approve.';
