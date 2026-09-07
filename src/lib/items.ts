import { getSession, supabase } from "./supabase";

export type ItemKind = "file" | "snippet" | "folder";

export interface StashItem {
  id: string;
  user_id: string;
  parent_id: string | null;
  kind: ItemKind;
  title: string;
  content: string | null;
  storage_path: string | null;
  mime_type: string | null;
  size_bytes: number | null;
  is_public: boolean;
  created_at: string;
}

const TABLE = "stash_items";
const BUCKET = "stash-files";

// Sorting (folders-first) is left to the caller.
export async function listItems(parentId: string | null) {
  let query = supabase.from(TABLE).select("*").order("title");
  query = parentId === null ? query.is("parent_id", null) : query.eq("parent_id", parentId);
  const { data, error } = await query;
  return { items: (data ?? []) as StashItem[], error };
}

export async function createFolder(title: string, parentId: string | null) {
  const { data, error } = await supabase
    .from(TABLE)
    .insert({ kind: "folder", title, parent_id: parentId })
    .select()
    .single();
  return { item: data as StashItem | null, error };
}

export async function createSnippet(title: string, content: string, parentId: string | null) {
  const { data, error } = await supabase
    .from(TABLE)
    .insert({ kind: "snippet", title, content, parent_id: parentId })
    .select()
    .single();
  return { item: data as StashItem | null, error };
}

export async function updateSnippet(id: string, title: string, content: string) {
  const { data, error } = await supabase.from(TABLE).update({ title, content }).eq("id", id).select().single();
  return { item: data as StashItem | null, error };
}

// Path prefix gates public/private access — see 0002_create_stash_files_bucket.sql.
export async function createFile(file: File, title: string, parentId: string | null) {
  const { session } = await getSession();
  if (!session) return { item: null, error: new Error("Not signed in") };

  const storagePath = `${session.user.id}/private/${crypto.randomUUID()}-${file.name}`;
  const { error: uploadError } = await supabase.storage.from(BUCKET).upload(storagePath, file);
  if (uploadError) return { item: null, error: uploadError };

  const { data, error } = await supabase
    .from(TABLE)
    .insert({
      kind: "file",
      title,
      parent_id: parentId,
      storage_path: storagePath,
      mime_type: file.type || null,
      size_bytes: file.size,
    })
    .select()
    .single();
  return { item: data as StashItem | null, error };
}

// Walks the subtree first — DB cascade handles rows, not Storage objects.
export async function deleteItem(item: StashItem): Promise<{ error: Error | null }> {
  if (item.kind === "folder") {
    const { items: children, error } = await listItems(item.id);
    if (error) return { error };
    for (const child of children) {
      const { error: childError } = await deleteItem(child);
      if (childError) return { error: childError };
    }
  } else if (item.kind === "file" && item.storage_path) {
    const { error: storageError } = await supabase.storage.from(BUCKET).remove([item.storage_path]);
    if (storageError) return { error: storageError };
  }
  const { error } = await supabase.from(TABLE).delete().eq("id", item.id);
  return { error };
}

export async function downloadFile(storagePath: string) {
  const { data, error } = await supabase.storage.from(BUCKET).download(storagePath);
  return { blob: data, error };
}
