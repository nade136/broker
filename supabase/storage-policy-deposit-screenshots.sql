-- Allow logged-in users to upload to the deposit-screenshots bucket.
-- Run this in Supabase Dashboard → SQL Editor if your project allows it.
-- If you get "permission denied" or "must be owner", add the policy manually:
--   Dashboard → Storage → deposit-screenshots → Policies → New policy
--   → "For full customization" → name: "Allow authenticated uploads"
--   → Operation: INSERT, Role: authenticated, WITH CHECK: bucket_id = 'deposit-screenshots'

drop policy if exists "Allow authenticated uploads to deposit-screenshots" on storage.objects;
create policy "Allow authenticated uploads to deposit-screenshots"
  on storage.objects
  for insert
  to authenticated
  with check (bucket_id = 'deposit-screenshots');
