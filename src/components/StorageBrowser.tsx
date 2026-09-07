import { useEffect, useMemo, useState, type SubmitEvent } from "react";
import {
  ChevronRight,
  Copy,
  Download,
  File,
  FileText,
  Folder,
  FolderPlus,
  Home,
  MoreVertical,
  Search,
  Trash2,
  Upload,
  type LucideIcon,
} from "lucide-react";
import { createFile, createFolder, createSnippet, deleteItem, downloadFile, listItems, type StashItem } from "../lib/items";
import { buttonVariantClass } from "../lib/styles";
import ConfirmDialog from "./ConfirmDialog";
import PreviewModal from "./PreviewModal";

const inputClass =
  "min-h-11 w-full rounded-card border border-border bg-surface px-4 text-sm text-fg placeholder:text-fg-muted focus:border-brand-300 focus:outline-none";

type AddMode = "folder" | "file" | "snippet" | null;

const kindIcon: Record<StashItem["kind"], LucideIcon> = {
  folder: Folder,
  file: File,
  snippet: FileText,
};

function formatBytes(bytes: number | null): string {
  if (bytes == null) return "";
  if (bytes < 1024) return `${bytes} B`;
  const units = ["KB", "MB", "GB"];
  let value = bytes / 1024;
  let unitIndex = 0;
  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }
  return `${value.toFixed(1)} ${units[unitIndex]}`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

export default function StorageBrowser() {
  const [path, setPath] = useState<StashItem[]>([]);
  const [items, setItems] = useState<StashItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState("");
  const [addMode, setAddMode] = useState<AddMode>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<StashItem | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [previewItem, setPreviewItem] = useState<StashItem | null>(null);

  const currentFolderId = path.length ? path[path.length - 1].id : null;

  async function refresh() {
    setLoading(true);
    setError(null);
    const { items: fetched, error } = await listItems(currentFolderId);
    if (error) setError(error.message);
    setItems(fetched);
    setLoading(false);
  }

  useEffect(() => {
    refresh();
    setPendingDelete(null);
    setOpenMenuId(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentFolderId]);

  useEffect(() => {
    if (!openMenuId) return;
    function handleClick(e: MouseEvent) {
      if (!(e.target as HTMLElement).closest("[data-menu-root]")) setOpenMenuId(null);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [openMenuId]);

  const sortedItems = useMemo(() => {
    return [...items]
      .filter((item) => item.title.toLowerCase().includes(filter.toLowerCase()))
      .sort((a, b) => {
        if (a.kind === "folder" && b.kind !== "folder") return -1;
        if (a.kind !== "folder" && b.kind === "folder") return 1;
        return a.title.localeCompare(b.title);
      });
  }, [items, filter]);

  function resetAddForm() {
    setAddMode(null);
    setTitle("");
    setContent("");
    setFile(null);
  }

  async function handleAddSubmit(e: SubmitEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setSubmitting(true);
    setError(null);
    const result =
      addMode === "folder"
        ? await createFolder(title.trim(), currentFolderId)
        : addMode === "snippet"
          ? await createSnippet(title.trim(), content, currentFolderId)
          : file
            ? await createFile(file, title.trim(), currentFolderId)
            : { error: new Error("Choose a file") };
    setSubmitting(false);
    if (result.error) {
      setError(result.error.message);
      return;
    }
    resetAddForm();
    refresh();
  }

  async function handleConfirmDelete() {
    if (!pendingDelete) return;
    const { error } = await deleteItem(pendingDelete);
    setPendingDelete(null);
    if (error) {
      setError(error.message);
      return;
    }
    refresh();
  }

  async function handleDownload(item: StashItem) {
    if (!item.storage_path) return;
    const { blob, error } = await downloadFile(item.storage_path);
    if (error || !blob) {
      setError(error?.message ?? "Download failed");
      return;
    }
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = item.title;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function copySnippet(content: string | null) {
    if (!content) return;
    await navigator.clipboard.writeText(content);
  }

  function handleOpen(item: StashItem) {
    if (item.kind === "folder") {
      setPath([...path, item]);
    } else {
      setPreviewItem(item);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <nav className="flex flex-wrap items-center gap-1 text-sm text-fg-muted">
        <button onClick={() => setPath([])} className="inline-flex items-center gap-1 hover:text-fg">
          <Home className="size-4" aria-hidden="true" />
          Home
        </button>
        {path.map((folder, index) => (
          <span key={folder.id} className="flex items-center gap-1">
            <ChevronRight className="size-3.5" aria-hidden="true" />
            <button onClick={() => setPath(path.slice(0, index + 1))} className="hover:text-fg">
              {folder.title}
            </button>
          </span>
        ))}
      </nav>

      <div className="flex flex-wrap items-center gap-2">
        <button
          className={buttonVariantClass.secondary}
          onClick={() => setAddMode(addMode === "folder" ? null : "folder")}
        >
          <FolderPlus className="size-4" aria-hidden="true" />
          Folder
        </button>
        <button
          className={buttonVariantClass.secondary}
          onClick={() => setAddMode(addMode === "file" ? null : "file")}
        >
          <Upload className="size-4" aria-hidden="true" />
          File
        </button>
        <button
          className={buttonVariantClass.secondary}
          onClick={() => setAddMode(addMode === "snippet" ? null : "snippet")}
        >
          <FileText className="size-4" aria-hidden="true" />
          Snippet
        </button>
        <div className="relative ml-auto max-w-xs flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-fg-muted" aria-hidden="true" />
          <input
            type="search"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Filter by title…"
            className={`${inputClass} pl-10`}
          />
        </div>
      </div>

      {addMode && (
        <form onSubmit={handleAddSubmit} className="flex flex-col gap-3 rounded-card border border-border bg-surface p-4">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title"
            required
            className={inputClass}
          />
          {addMode === "snippet" && (
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Paste code or text…"
              rows={8}
              className={`${inputClass} min-h-32 py-3 font-mono`}
            />
          )}
          {addMode === "file" && (
            <>
              <label
                htmlFor="stash-file-input"
                className={`${inputClass} flex cursor-pointer items-center gap-2 text-fg-muted hover:border-brand-300`}
              >
                <Upload className="size-4 shrink-0" aria-hidden="true" />
                <span className="truncate">{file ? file.name : "Choose a file…"}</span>
              </label>
              <input
                id="stash-file-input"
                type="file"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                required
                className="sr-only"
              />
            </>
          )}
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={resetAddForm}
              className="min-h-11 rounded-card px-4 text-sm text-fg-muted hover:text-fg"
            >
              Cancel
            </button>
            <button type="submit" disabled={submitting} className={buttonVariantClass.primary}>
              {submitting ? "Saving…" : "Save"}
            </button>
          </div>
        </form>
      )}

      {error && <p className="text-sm text-error">{error}</p>}

      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-28 animate-pulse rounded-card border border-border bg-surface" />
          ))}
        </div>
      ) : sortedItems.length === 0 ? (
        <p className="text-sm text-fg-muted">Nothing here yet.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sortedItems.map((item) => {
            const KindIcon = kindIcon[item.kind];
            return (
              <div
                key={item.id}
                role="button"
                tabIndex={0}
                onClick={() => handleOpen(item)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleOpen(item);
                  }
                }}
                className="hover-elevate relative flex cursor-pointer flex-col gap-2 rounded-card border border-border bg-surface p-4"
              >
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium tracking-wide text-fg-muted uppercase">
                    <KindIcon className="size-3.5" aria-hidden="true" />
                    {item.kind}
                  </span>
                  <div data-menu-root className="relative">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenMenuId(openMenuId === item.id ? null : item.id);
                      }}
                      aria-label="Actions"
                      className="rounded-card p-1.5 text-fg-muted hover:bg-surface-hover hover:text-fg"
                    >
                      <MoreVertical className="size-4" aria-hidden="true" />
                    </button>
                    {openMenuId === item.id && (
                      <div className="absolute right-0 z-10 mt-1 flex w-44 flex-col rounded-card border border-border bg-surface p-1 shadow-lg">
                        {item.kind === "file" && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenMenuId(null);
                              handleDownload(item);
                            }}
                            className="flex items-center gap-2 rounded-card px-3 py-2 text-left text-sm text-fg hover:bg-surface-hover"
                          >
                            <Download className="size-4" aria-hidden="true" />
                            Download
                          </button>
                        )}
                        {item.kind === "snippet" && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenMenuId(null);
                              copySnippet(item.content);
                            }}
                            className="flex items-center gap-2 rounded-card px-3 py-2 text-left text-sm text-fg hover:bg-surface-hover"
                          >
                            <Copy className="size-4" aria-hidden="true" />
                            Copy
                          </button>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenMenuId(null);
                            setPendingDelete(item);
                          }}
                          className="flex items-center gap-2 rounded-card px-3 py-2 text-left text-sm text-error hover:bg-surface-hover"
                        >
                          <Trash2 className="size-4" aria-hidden="true" />
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <p className="text-base font-semibold text-fg">{item.title}</p>

                <p className="text-xs text-fg-muted">
                  {formatDate(item.created_at)}
                  {item.kind === "file" && item.size_bytes != null ? ` · ${formatBytes(item.size_bytes)}` : ""}
                </p>
              </div>
            );
          })}
        </div>
      )}

      {previewItem && (
        <PreviewModal
          item={previewItem}
          onClose={() => setPreviewItem(null)}
          onUpdated={(updated) => {
            setItems((prev) => prev.map((i) => (i.id === updated.id ? updated : i)));
            setPreviewItem(updated);
          }}
        />
      )}

      {pendingDelete && (
        <ConfirmDialog
          title={`Delete "${pendingDelete.title}"?`}
          message={
            pendingDelete.kind === "folder"
              ? "This will permanently delete this folder and everything inside it."
              : "This will permanently delete this item."
          }
          onConfirm={handleConfirmDelete}
          onCancel={() => setPendingDelete(null)}
        />
      )}
    </div>
  );
}
