"use client";

type ConfirmDialogProps = {
  open: boolean;
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  confirming?: boolean;
  variant?: "danger" | "default";
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmDialog({
  open,
  title = "请确认",
  message,
  confirmLabel = "确定",
  cancelLabel = "取消",
  confirming = false,
  variant = "default",
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!open) return null;

  const confirmClassName =
    variant === "danger"
      ? "rounded bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700 disabled:opacity-60"
      : "rounded bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:opacity-60";

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4">
      <div
        className="w-full max-w-md rounded-lg bg-white shadow-xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
      >
        <div className="border-b border-zinc-200 px-5 py-4">
          <h2
            id="confirm-dialog-title"
            className="text-base font-semibold text-zinc-900"
          >
            {title}
          </h2>
        </div>
        <div className="px-5 py-4">
          <p className="text-sm leading-relaxed text-zinc-700">{message}</p>
        </div>
        <div className="flex justify-end gap-2 border-t border-zinc-200 px-5 py-4">
          <button
            type="button"
            className="rounded border border-zinc-300 px-4 py-2 text-sm hover:bg-zinc-50 disabled:opacity-60"
            onClick={onCancel}
            disabled={confirming}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            className={confirmClassName}
            onClick={onConfirm}
            disabled={confirming}
          >
            {confirming ? "处理中..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
