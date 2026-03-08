-- ============================================
-- KYC (document verification) submissions
-- User submits ID (and optional selfie); admin approves or rejects
-- ============================================

create table if not exists public.kyc_submissions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  id_document_url text,
  selfie_url text,
  submitted_at timestamptz not null default now(),
  reviewed_at timestamptz,
  reviewed_by uuid references public.profiles(id) on delete set null,
  rejection_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id)
);

create index if not exists kyc_submissions_user_id_idx on public.kyc_submissions(user_id);
create index if not exists kyc_submissions_status_idx on public.kyc_submissions(status);

alter table public.kyc_submissions enable row level security;

-- Users can read their own submission
create policy "Users can read own kyc"
  on public.kyc_submissions for select
  using (auth.uid() = user_id);

-- Users can insert their own (first submission)
create policy "Users can insert own kyc"
  on public.kyc_submissions for insert
  with check (auth.uid() = user_id);

-- Users can update their own (resubmit: set new docs and status = pending)
create policy "Users can update own kyc"
  on public.kyc_submissions for update
  using (auth.uid() = user_id);

-- Admin actions (approve/reject) use service role; no policy needed for that

drop trigger if exists kyc_submissions_updated_at on public.kyc_submissions;
create trigger kyc_submissions_updated_at
  before update on public.kyc_submissions
  for each row execute function public.set_updated_at();

comment on table public.kyc_submissions is 'KYC document verification: one row per user; admin approves or rejects.';
