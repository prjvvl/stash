-- Private bucket. Path prefix (<user_id>/private|public/<filename>) gates
-- access since storage.objects RLS can't join stash_items.is_public.
insert into storage.buckets (id, name, public)
values ('stash-files', 'stash-files', false);

create policy "Owner has full access to own files"
  on storage.objects for all
  using (bucket_id = 'stash-files' and (storage.foldername(name))[1] = auth.uid()::text)
  with check (bucket_id = 'stash-files' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "Public files are readable by anyone"
  on storage.objects for select
  using (bucket_id = 'stash-files' and (storage.foldername(name))[2] = 'public');
