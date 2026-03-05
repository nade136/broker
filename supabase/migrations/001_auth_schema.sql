-- ============================================
-- Bitrexify Auth Schema
-- Admin: separate, email + password (no self-register)
-- User: register + login (email + password)
-- ============================================

-- 1. Profiles: one row per auth user (user or admin)
-- id matches auth.users(id). role = 'user' | 'admin'
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  role text not null default 'user' check (role in ('user', 'admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Index for role (admin check)
create index if not exists profiles_role_idx on public.profiles(role);

-- 2. Trigger: create profile on signup (default role = user)
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', ''),
    'user'
  );
  return new;
end;
$$;

-- Drop trigger if exists (idempotent)
drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 3. RLS
alter table public.profiles enable row level security;

-- Users can read and update their own profile
create policy "Users can read own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Admins can read all profiles (for admin dashboard)
create policy "Admins can read all profiles"
  on public.profiles for select
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

-- Only admins can update other profiles (e.g. suspend user)
create policy "Admins can update any profile"
  on public.profiles for update
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

-- 4. Service role can do anything (for backend); anon can only insert via trigger
-- No policy for insert: trigger runs as definer, so profile is created. Users cannot insert profiles directly.

-- 5. updated_at trigger
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_updated_at on public.profiles;
create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- ============================================
-- First admin: create manually
-- ============================================
-- 1. In Supabase Dashboard: Authentication > Users > "Add user" (email + password).
-- 2. Copy the new user's UUID from the table.
-- 3. Run in SQL Editor:
--
--    update public.profiles set role = 'admin' where id = 'PASTE-UUID-HERE';
--
-- That user can now log in to /admin/login. Everyone else who signs up is role = 'user'.
-- ============================================
