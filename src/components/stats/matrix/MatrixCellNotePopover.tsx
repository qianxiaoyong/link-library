"use client";

import { useEffect, useRef, useState } from "react";

type MatrixCellNotePopoverProps = {
  open: boolean;
  title: string;
  initialNote: string;
  saving: boolean;
  anchorRect: DOMRect | null;
  onSave: (note: string) => void;
  onClear: () => void;
  onClose: () => void;
};

const PANEL_WIDTH = 288;
const PANEL_MARGIN = 8;

function getPanelPosition(anchorRect: DOMRect): { top: number; left: number } {
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  const estimatedHeight = 220;

  let left = anchorRect.left;
  if (left + PANEL_WIDTH + PANEL_MARGIN > viewportWidth) {
    left = Math.max(PANEL_MARGIN, viewportWidth - PANEL_WIDTH - PANEL_MARGIN);
  }

  let top = anchorRect.bottom + 4;
  if (top + estimatedHeight + PANEL_MARGIN > viewportHeight) {
    top = Math.max(PANEL_MARGIN, anchorRect.top - estimatedHeight - 4);
  }

  return { top, left };
}

export function MatrixCellNotePopover({
  open,
  title,
  initialNote,
  saving,
  anchorRect,
  onSave,
  onClear,
  onClose,
}: MatrixCellNotePopoverProps) {
  const [draft, setDraft] = useState(initialNote);
  const panelRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!open) {
      return;
    }
    setDraft(initialNote);
    const timer = window.setTimeout(() => {
      textareaRef.current?.focus();
      textareaRef.current?.select();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [initialNote, open, title]);

  useEffect(() => {
    if (!open) {
      return;
    }

    function handlePointerDown(event: MouseEvent) {
      if (panelRef.current?.contains(event.target as Node)) {
        return;
      }
      onClose();
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

  if (!open || !anchorRect) {
    return null;
  }

  const position = getPanelPosition(anchorRect);

  return (
    <div
      ref={panelRef}
      className="fixed z-50 w-72 rounded-lg border border-zinc-200 bg-white p-3 shadow-lg"
      style={{ top: position.top, left: position.left }}
      role="dialog"
      aria-label="单元格备注"
    >
      <div className="mb-2 text-xs font-medium text-zinc-800">{title}</div>
      <textarea
        ref={textareaRef}
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        maxLength={500}
        rows={4}
        placeholder="输入备注，例如：缺 3 年级上册"
        className="w-full resize-none rounded border border-zinc-300 px-2 py-1.5 text-xs text-zinc-800 outline-none focus:border-blue-500"
        disabled={saving}
      />
      <div className="mt-1 text-right text-[10px] text-zinc-400">
        {draft.length}/500
      </div>
      <div className="mt-2 flex justify-end gap-2">
        <button
          type="button"
          className="rounded border border-zinc-300 px-2.5 py-1 text-xs text-zinc-700 hover:bg-zinc-50 disabled:opacity-60"
          onClick={onClose}
          disabled={saving}
        >
          取消
        </button>
        <button
          type="button"
          className="rounded border border-zinc-300 px-2.5 py-1 text-xs text-zinc-700 hover:bg-zinc-50 disabled:opacity-60"
          onClick={onClear}
          disabled={saving || !initialNote.trim()}
        >
          清除
        </button>
        <button
          type="button"
          className="rounded bg-blue-600 px-2.5 py-1 text-xs text-white hover:bg-blue-700 disabled:opacity-60"
          onClick={() => onSave(draft)}
          disabled={saving}
        >
          {saving ? "保存中..." : "保存"}
        </button>
      </div>
    </div>
  );
}
