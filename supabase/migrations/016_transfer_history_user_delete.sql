-- Allow users to delete their own transfer history (for "Clear history" on dashboard → Transactions).
create policy "Users can delete own transfer history"
  on public.transfer_history for delete
  using (auth.uid() = user_id);
