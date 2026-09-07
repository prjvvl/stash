import { buttonVariantClass } from "../lib/styles";

interface Props {
  title: string;
  message: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({ title, message, confirmLabel = "Delete", onConfirm, onCancel }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={onCancel}>
      <div
        className="flex w-full max-w-sm flex-col gap-4 rounded-card border border-border bg-surface p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div>
          <h2 className="text-base font-semibold text-fg">{title}</h2>
          <p className="mt-1 text-sm text-fg-muted">{message}</p>
        </div>
        <div className="flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="min-h-11 rounded-card px-4 text-sm text-fg-muted hover:text-fg"
          >
            Cancel
          </button>
          <button onClick={onConfirm} className={buttonVariantClass.danger}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
