-- Allow logged-in users to upload to the kyc-documents bucket (path: {user_id}/...).
-- Run in Supabase Dashboard → SQL Editor.
-- Or add manually: Storage → kyc-documents → Policies → INSERT for authenticated.

drop policy if exists "Allow authenticated uploads to kyc-documents" on storage.objects;
create policy "Allow authenticated uploads to kyc-documents"
  on storage.objects
  for insert
  to authenticated
  with check (bucket_id = 'kyc-documents');

-- Allow users to read their own files (for viewing submitted docs)
drop policy if exists "Users can read own kyc documents" on storage.objects;
create policy "Users can read own kyc documents"
  on storage.objects
  for select
  to authenticated
  using (bucket_id = 'kyc-documents');
