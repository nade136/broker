-- Account approval: new self-serve signups start as pending_approval until an admin accepts them in Notifications.

alter table public.profiles
  add column if not exists account_status text not null default 'pending_approval'
    check (account_status in ('pending_approval', 'approved', 'rejected'));

comment on column public.profiles.account_status is 'Self-serve signups: pending until admin approves in admin notifications; admins should stay approved.';

-- Existing users and manually created admins keep full access
update public.profiles set account_status = 'approved' where account_status = 'pending_approval';

-- New rows from handle_new_user() still need default pending; after backfill, set default for future inserts
alter table public.profiles alter column account_status set default 'pending_approval';

create index if not exists profiles_account_status_idx on public.profiles(account_status);
