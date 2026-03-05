-- Fix 500 on profiles: avoid RLS recursion by using a security definer function
-- for admin checks. Run this in Supabase SQL Editor after 001_auth_schema.sql.

create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- Drop old admin policies that read from profiles again (causes recursion)
drop policy if exists "Admins can read all profiles" on public.profiles;
drop policy if exists "Admins can update any profile" on public.profiles;

-- Recreate using the function (no recursion)
create policy "Admins can read all profiles"
  on public.profiles for select
  using (public.is_admin());

create policy "Admins can update any profile"
  on public.profiles for update
  using (public.is_admin());

-- Backfill: ensure every auth user has a profile (for users created before the trigger existed)
insert into public.profiles (id, email, full_name, role)
select u.id, u.email, coalesce(u.raw_user_meta_data->>'full_name', u.raw_user_meta_data->>'name', ''), 'user'
from auth.users u
where not exists (select 1 from public.profiles p where p.id = u.id)
on conflict (id) do nothing;
