-- ============================================
-- Admin–user messages: thread per user; admin sends/receives from user page, user from dashboard.
-- ============================================

create table if not exists public.admin_user_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  from_admin boolean not null default true,
  body text not null,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists admin_user_messages_user_id_idx on public.admin_user_messages(user_id);
create index if not exists admin_user_messages_created_at_idx on public.admin_user_messages(created_at);

alter table public.admin_user_messages enable row level security;

-- Users can read and insert their own messages (their thread only)
create policy "Users can read own messages"
  on public.admin_user_messages for select
  using (auth.uid() = user_id);

create policy "Users can insert own messages"
  on public.admin_user_messages for insert
  with check (auth.uid() = user_id and from_admin = false);

-- Users can update read_at on messages sent to them (from_admin = true) so they can mark as read
create policy "Users can update own thread read_at"
  on public.admin_user_messages for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Admin uses service role (bypasses RLS) to read/write any thread
comment on table public.admin_user_messages is 'Messages between admin and a user; admin from user page, user from dashboard.';
