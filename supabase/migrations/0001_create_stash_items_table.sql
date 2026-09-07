-- One table for files/snippets/folders (kind column). Owner-only RLS via
-- auth.uid(), not an email literal, so multiple accounts can exist later.
create table stash_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  parent_id uuid references stash_items (id) on delete cascade,
  kind text not null check (kind in ('file', 'snippet', 'folder')),
  title text not null,
  content text,
  storage_path text,
  mime_type text,
  size_bytes bigint,
  is_public boolean not null default false,
  created_at timestamptz not null default now()
);

create index stash_items_user_id_parent_id_idx on stash_items (user_id, parent_id);

alter table stash_items enable row level security;

create policy "Owner has full access"
  on stash_items for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Additive: Postgres OR's same-command policies, so this doesn't weaken
-- the owner-only policy above.
create policy "Public items are readable by anyone"
  on stash_items for select
  using (is_public = true);
