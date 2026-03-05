# Supabase Auth Setup

## Schema overview

- **Admin**: Separate from users. One (or more) admin accounts with email + password. No self-registration; you create the first admin in the dashboard and set `role = 'admin'` in `profiles`.
- **User**: Register and login via your app. Sign up creates a row in `profiles` with `role = 'user'`.

## 1. Run the migration

1. Open [Supabase Dashboard](https://supabase.com/dashboard) → your project.
2. Go to **SQL Editor**.
3. Copy the contents of `migrations/001_auth_schema.sql` and run it.

This creates:

- `public.profiles` – `id` (same as `auth.users.id`), `email`, `full_name`, `role` (`user` | `admin`), `created_at`, `updated_at`.
- A trigger so every new sign-up gets a `profiles` row with `role = 'user'`.
- RLS so users see only their profile; admins can read/update all profiles.

## 2. Create the first admin

1. In Supabase: **Authentication** → **Users** → **Add user**.
2. Enter admin **email** and **password** → Create user.
3. Copy the new user’s **UUID** from the users table.
4. In **SQL Editor** run:

```sql
update public.profiles set role = 'admin' where id = 'PASTE-THE-UUID-HERE';
```

That account can log in at `/admin/login`. Any other account that signs up through your app will have `role = 'user'` and can only use the user dashboard.

## 3. Optional: disable public sign-up for admins

Supabase Auth does not have a separate “admin” sign-up. You only create admin users manually (step 2 above). User sign-up stays as normal (your app calls `supabase.auth.signUp()` for the login/register flow).

## Summary

| Type  | How they get an account      | Where they log in   |
|-------|------------------------------|----------------------|
| Admin | You create in Auth + set role | `/admin/login`       |
| User  | Register on your site         | `/login`             |
