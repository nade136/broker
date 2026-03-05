-- Disable RLS on profiles: no row-level restrictions.
-- Run this in Supabase SQL Editor. Anyone with the anon/service key can then read/write profiles.

-- Drop all policies on public.profiles
drop policy if exists "Users can read own profile" on public.profiles;
drop policy if exists "Users can update own profile" on public.profiles;
drop policy if exists "Admins can read all profiles" on public.profiles;
drop policy if exists "Admins can update any profile" on public.profiles;

-- Turn off RLS
alter table public.profiles disable row level security;
