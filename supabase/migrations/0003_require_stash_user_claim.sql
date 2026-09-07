-- Anchor's OTP sign-in lets anyone self-register in the same shared
-- auth.users pool, so a real token could otherwise pass plain own-row RLS.
-- Requires a claim set only by scripts/manage-user.mjs. Public-read
-- policies are untouched — meant to stay open to anyone.
drop policy "Owner has full access" on stash_items;

create policy "Owner has full access"
  on stash_items for all
  using (auth.uid() = user_id and (auth.jwt() -> 'app_metadata' ->> 'stash_user')::boolean = true)
  with check (auth.uid() = user_id and (auth.jwt() -> 'app_metadata' ->> 'stash_user')::boolean = true);

drop policy "Owner has full access to own files" on storage.objects;

create policy "Owner has full access to own files"
  on storage.objects for all
  using (
    bucket_id = 'stash-files'
    and (storage.foldername(name))[1] = auth.uid()::text
    and (auth.jwt() -> 'app_metadata' ->> 'stash_user')::boolean = true
  )
  with check (
    bucket_id = 'stash-files'
    and (storage.foldername(name))[1] = auth.uid()::text
    and (auth.jwt() -> 'app_metadata' ->> 'stash_user')::boolean = true
  );
