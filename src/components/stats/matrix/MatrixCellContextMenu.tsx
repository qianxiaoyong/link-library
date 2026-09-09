"use client";

import { useEffect, useRef } from "react";

type MatrixCellContextMenuProps = {
  open: boolean;
  position: { x: number; y: number } | null;
  onEditNote: () => void;
  onClose: () => void;
};

const MENU_WIDTH = 128;
const MENU_MARGIN = 8;

function getMenuPosition(point: { x: number; y: number }): {
  top: number;
  left: number;
} {
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  const estimatedHeight = 40;

  let left = point.x;
  if (left + MENU_WIDTH + MENU_MARGIN > viewportWidth) {
    left = Math.max(MENU_MARGIN, viewportWidth - MENU_WIDTH - MENU_MARGIN);
  }

  let top = point.y;
  if (top + estimatedHeight + MENU_MARGIN > viewportHeight) {
    top = Math.max(MENU_MARGIN, viewportHeight - estimatedHeight - MENU_MARGIN);
  }

  return { top, left };
}

export function MatrixCellContextMenu({
  open,
  position,
  onEditNote,
  onClose,
}: MatrixCellContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    function handlePointerDown(event: MouseEvent) {
      if (menuRef.current?.contains(event.target as Node)) {
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

  if (!open || !position) {
    return null;
  }

  const style = getMenuPosition(position);

  return (
    <div
      ref={menuRef}
      className="fixed z-50 min-w-[128px] rounded border border-zinc-200 bg-white py-1 shadow-lg"
      style={{ top: style.top, left: style.left }}
      role="menu"
      aria-label="单元格菜单"
    >
      <button
        type="button"
        role="menuitem"
        className="block w-full px-3 py-1.5 text-left text-xs text-zinc-800 hover:bg-zinc-100"
        onClick={onEditNote}
      >
        编辑备注
      </button>
    </div>
  );
}
