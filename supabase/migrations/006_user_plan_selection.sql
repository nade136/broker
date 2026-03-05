-- ============================================
-- User plan selection: which plan the user picked on the dashboard
-- ============================================

create table if not exists public.user_plan_selection (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  plan_id uuid not null references public.plans(id) on delete cascade,
  selected_at timestamptz not null default now(),
  unique(user_id)
);

create index if not exists user_plan_selection_user_id_idx on public.user_plan_selection(user_id);
create index if not exists user_plan_selection_plan_id_idx on public.user_plan_selection(plan_id);

alter table public.user_plan_selection enable row level security;

-- Users can read and update their own selection
create policy "Users can read own plan selection"
  on public.user_plan_selection for select
  using (auth.uid() = user_id);

create policy "Users can insert own plan selection"
  on public.user_plan_selection for insert
  with check (auth.uid() = user_id);

create policy "Users can update own plan selection"
  on public.user_plan_selection for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Admins need to read all (via service role)
comment on table public.user_plan_selection is 'Which plan the user selected on dashboard Plans page.';
