import { useEffect, useState } from "react";
import { Check, Copy, Download, Pencil, X } from "lucide-react";
import { downloadFile, updateSnippet, type StashItem } from "../lib/items";

interface Props {
  item: StashItem;
  onClose: () => void;
  onUpdated?: (item: StashItem) => void;
}

const previewTextClass = "whitespace-pre-wrap rounded-card border border-border bg-bg p-3 font-mono text-xs text-fg";
const iconButtonClass =
  "inline-flex min-h-11 min-w-11 items-center justify-center rounded-card text-fg-muted hover:bg-surface-hover hover:text-fg";
const editInputClass =
  "min-h-11 w-full rounded-card border border-border bg-surface px-3 text-sm text-fg focus:border-brand-300 focus:outline-none";

export default function PreviewModal({ item, onClose, onUpdated }: Props) {
  const [fileBlob, setFileBlob] = useState<Blob | null>(null);
  const [objectUrl, setObjectUrl] = useState<string | null>(null);
  const [textContent, setTextContent] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(item.kind === "file");

  const [editing, setEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(item.title);
  const [editedContent, setEditedContent] = useState(item.content ?? "");
  const [saving, setSaving] = useState(false);

  const mime = item.mime_type ?? "";

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key !== "Escape") return;
      if (editing) setEditing(false);
      else onClose();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [editing, onClose]);

  useEffect(() => {
    if (item.kind !== "file" || !item.storage_path) return;
    let cancelled = false;
    let url: string | null = null;

    downloadFile(item.storage_path).then(({ blob, error }) => {
      if (cancelled) return;
      if (error || !blob) {
        setError(error?.message ?? "Preview failed");
        setLoading(false);
        return;
      }
      setFileBlob(blob);
      if (mime.startsWith("image/") || mime === "application/pdf") {
        url = URL.createObjectURL(blob);
        setObjectUrl(url);
        setLoading(false);
      } else if (mime.startsWith("text/") || mime === "application/json") {
        blob.text().then((text) => {
          if (!cancelled) setTextContent(text);
          setLoading(false);
        });
      } else {
        setLoading(false);
      }
    });

    return () => {
      cancelled = true;
      if (url) URL.revokeObjectURL(url);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item]);

  async function handleDownload() {
    if (!item.storage_path) return;
    // Reuses the blob the preview already fetched instead of re-downloading.
    let blob = fileBlob;
    if (!blob) {
      const { blob: fetched, error } = await downloadFile(item.storage_path);
      if (error || !fetched) return;
      blob = fetched;
    }
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = item.title;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function handleCopy() {
    if (item.content) await navigator.clipboard.writeText(item.content);
  }

  function startEditing() {
    setEditedTitle(item.title);
    setEditedContent(item.content ?? "");
    setError(null);
    setEditing(true);
  }

  async function handleSaveEdit() {
    if (!editedTitle.trim()) return;
    setSaving(true);
    setError(null);
    const { item: updated, error } = await updateSnippet(item.id, editedTitle.trim(), editedContent);
    setSaving(false);
    if (error || !updated) {
      setError(error?.message ?? "Save failed");
      return;
    }
    onUpdated?.(updated);
    setEditing(false);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={editing ? undefined : onClose}>
      <div
        className="flex max-h-[85vh] w-full max-w-2xl flex-col gap-4 overflow-hidden rounded-card border border-border bg-surface p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-4">
          {editing ? (
            <input
              type="text"
              value={editedTitle}
              onChange={(e) => setEditedTitle(e.target.value)}
              className={`${editInputClass} font-semibold`}
              autoFocus
            />
          ) : (
            <h2 className="truncate text-base font-semibold text-fg">{item.title}</h2>
          )}

          <div className="flex shrink-0 items-center gap-1">
            {editing ? (
              <>
                <button
                  onClick={handleSaveEdit}
                  disabled={saving}
                  aria-label="Save"
                  className={iconButtonClass}
                >
                  <Check className="size-5" aria-hidden="true" />
                </button>
                <button onClick={() => setEditing(false)} aria-label="Cancel edit" className={iconButtonClass}>
                  <X className="size-5" aria-hidden="true" />
                </button>
              </>
            ) : (
              <>
                {item.kind === "file" && (
                  <button onClick={handleDownload} aria-label="Download" className={iconButtonClass}>
                    <Download className="size-5" aria-hidden="true" />
                  </button>
                )}
                {item.kind === "snippet" && (
                  <>
                    <button onClick={startEditing} aria-label="Edit" className={iconButtonClass}>
                      <Pencil className="size-5" aria-hidden="true" />
                    </button>
                    <button onClick={handleCopy} aria-label="Copy" className={iconButtonClass}>
                      <Copy className="size-5" aria-hidden="true" />
                    </button>
                  </>
                )}
                <button onClick={onClose} aria-label="Close" className={iconButtonClass}>
                  <X className="size-5" aria-hidden="true" />
                </button>
              </>
            )}
          </div>
        </div>

        {error && <p className="text-sm text-error">{error}</p>}

        <div className="min-h-0 flex-1 overflow-auto">
          {item.kind === "snippet" &&
            (editing ? (
              <textarea
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
                rows={12}
                className={`${previewTextClass} min-h-64 w-full focus:border-brand-300 focus:outline-none`}
              />
            ) : (
              <pre className={previewTextClass}>{item.content}</pre>
            ))}

          {item.kind === "file" && (
            <>
              {loading && <p className="text-sm text-fg-muted">Loading preview…</p>}
              {!loading && !error && mime.startsWith("image/") && objectUrl && (
                <img src={objectUrl} alt={item.title} className="max-h-full w-full object-contain" />
              )}
              {!loading && !error && mime === "application/pdf" && objectUrl && (
                <embed src={objectUrl} type="application/pdf" className="h-[70vh] w-full" />
              )}
              {!loading && !error && textContent !== null && <pre className={previewTextClass}>{textContent}</pre>}
              {!loading && !error && !objectUrl && textContent === null && (
                <p className="text-sm text-fg-muted">No preview available for this file type.</p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
