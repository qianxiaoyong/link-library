"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import type { StatsToastVariant } from "../use-stats-toast";
import {
  getErrorMessage,
  listLinks,
} from "@/shared/api/links-client";
import type { MatrixCellLinksListParams } from "@/shared/library/deep-link-filters";
import type { ResourceLink } from "@/shared/types/resource-link";
import {
  copyToClipboard,
  displayValue,
  getCategoryLabel,
  getPlatformTableLabel,
} from "@/components/links/link-ui-utils";

type MatrixCellLinksPopoverProps = {
  open: boolean;
  title: string;
  listParams: MatrixCellLinksListParams | null;
  anchorRect: DOMRect | null;
  onShowToast: (message: string, variant?: StatsToastVariant) => void;
  onClose: () => void;
};

const PANEL_WIDTH = 560;
const PANEL_MARGIN = 8;
const PANEL_GAP = 4;
const PAGE_SIZE = 10;
const DEFAULT_ESTIMATED_HEIGHT = 280;

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function getPanelPlacement(
  anchorRect: DOMRect,
  panelHeight: number,
): { top: number; left: number; maxHeight: number } {
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  const spaceBelow =
    viewportHeight - anchorRect.bottom - PANEL_MARGIN - PANEL_GAP;
  const spaceAbove = anchorRect.top - PANEL_MARGIN - PANEL_GAP;
  const placeBelow =
    spaceBelow >= Math.min(200, panelHeight) || spaceBelow >= spaceAbove;

  const available = Math.max(160, placeBelow ? spaceBelow : spaceAbove);
  const maxHeight = Math.min(420, available);
  const height = Math.min(panelHeight, maxHeight);

  let top: number;
  if (placeBelow) {
    top = anchorRect.bottom + PANEL_GAP;
    if (top + height > viewportHeight - PANEL_MARGIN) {
      top = Math.max(PANEL_MARGIN, viewportHeight - PANEL_MARGIN - height);
    }
  } else {
    top = anchorRect.top - PANEL_GAP - height;
    if (top < PANEL_MARGIN) {
      top = PANEL_MARGIN;
    }
  }

  // 水平方向尽量贴近格子中心，仅在溢出时微调
  const preferredLeft =
    anchorRect.left + anchorRect.width / 2 - PANEL_WIDTH / 2;
  const left = clamp(
    preferredLeft,
    PANEL_MARGIN,
    Math.max(PANEL_MARGIN, viewportWidth - PANEL_WIDTH - PANEL_MARGIN),
  );

  return { top, left, maxHeight };
}

export function MatrixCellLinksPopover({
  open,
  title,
  listParams,
  anchorRect,
  onShowToast,
  onClose,
}: MatrixCellLinksPopoverProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const [items, setItems] = useState<ResourceLink[]>([]);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(false);
  const [placement, setPlacement] = useState({
    top: PANEL_MARGIN,
    left: PANEL_MARGIN,
    maxHeight: 420,
  });

  const loadPage = useCallback(
    async (nextOffset: number) => {
      if (!listParams) {
        return;
      }

      setLoading(true);
      try {
        const result = await listLinks({
          ...listParams,
          status: "normal",
          limit: PAGE_SIZE,
          offset: nextOffset,
        });
        setItems(result.items);
        setTotal(result.total);
        setOffset(nextOffset);
      } catch (error) {
        onShowToast(getErrorMessage(error), "error");
      } finally {
        setLoading(false);
      }
    },
    [listParams, onShowToast],
  );

  useEffect(() => {
    if (!open || !listParams) {
      return;
    }
    setItems([]);
    setTotal(0);
    setOffset(0);
    void loadPage(0);
  }, [open, listParams, loadPage]);

  useLayoutEffect(() => {
    if (!open || !anchorRect) {
      return;
    }

    const measuredHeight =
      panelRef.current?.getBoundingClientRect().height ||
      DEFAULT_ESTIMATED_HEIGHT;
    setPlacement(getPanelPlacement(anchorRect, measuredHeight));
  }, [open, anchorRect, items, loading, total]);

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

  async function handleCopy(item: ResourceLink) {
    if (!item.sourceText?.trim()) {
      onShowToast("当前资料没有原始输入内容。", "warning");
      return;
    }

    try {
      await copyToClipboard(item.sourceText);
      onShowToast("已复制原始输入信息。", "success");
    } catch {
      onShowToast("复制失败，请手动复制。", "error");
    }
  }

  if (!open || !anchorRect) {
    return null;
  }

  const totalPages = total === 0 ? 0 : Math.max(1, Math.ceil(total / PAGE_SIZE));
  const currentPage = totalPages === 0 ? 0 : Math.floor(offset / PAGE_SIZE) + 1;
  const rangeStart = total === 0 ? 0 : offset + 1;
  const rangeEnd = Math.min(offset + PAGE_SIZE, total);

  return (
    <div
      ref={panelRef}
      className="fixed z-50 flex w-[560px] flex-col overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-lg"
      style={{
        top: placement.top,
        left: placement.left,
        maxHeight: placement.maxHeight,
      }}
      role="dialog"
      aria-label="单元格资料列表"
    >
      <div className="shrink-0 border-b border-zinc-100 px-3 py-2">
        <div className="text-xs font-medium text-zinc-800">{title}</div>
        <div className="mt-0.5 text-[11px] text-zinc-500">
          共 {total} 条
          {total > 0 ? `，显示 ${rangeStart}-${rangeEnd}` : ""}
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-auto">
        {loading && items.length === 0 ? (
          <div className="px-3 py-8 text-center text-xs text-zinc-500">
            加载中...
          </div>
        ) : items.length === 0 ? (
          <div className="px-3 py-8 text-center text-xs text-zinc-500">
            暂无匹配资料
          </div>
        ) : (
          <table className="w-full border-collapse text-left text-xs">
            <thead className="sticky top-0 bg-zinc-50 text-zinc-600">
              <tr>
                <th className="px-2 py-1.5 font-medium">标题</th>
                <th className="w-10 px-1 py-1.5 font-medium">年级</th>
                <th className="w-12 px-1 py-1.5 font-medium">科目</th>
                <th className="w-14 px-1 py-1.5 font-medium">版本</th>
                <th className="w-12 px-1 py-1.5 font-medium">分类</th>
                <th className="w-12 px-1 py-1.5 font-medium">平台</th>
                <th className="w-12 px-1 py-1.5 font-medium">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-zinc-50">
                  <td className="max-w-[180px] px-2 py-1.5">
                    <a
                      href={item.rawUrl}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="block truncate text-blue-600 hover:underline"
                      title={item.title}
                    >
                      {item.title}
                    </a>
                  </td>
                  <td className="px-1 py-1.5 text-zinc-700">
                    {displayValue(item.grade)}
                  </td>
                  <td className="px-1 py-1.5 text-zinc-700">
                    {displayValue(item.subject)}
                  </td>
                  <td className="px-1 py-1.5 text-zinc-700">
                    {displayValue(item.textbookEdition)}
                  </td>
                  <td className="px-1 py-1.5 text-zinc-700">
                    {getCategoryLabel(item.resourceCategory)}
                  </td>
                  <td className="px-1 py-1.5 text-zinc-700">
                    {getPlatformTableLabel(item.platform)}
                  </td>
                  <td className="px-1 py-1.5">
                    <button
                      type="button"
                      className="text-blue-600 hover:underline"
                      onClick={() => void handleCopy(item)}
                    >
                      复制
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {totalPages > 1 ? (
        <div className="flex shrink-0 items-center justify-between gap-2 border-t border-zinc-100 px-3 py-1.5 text-[11px] text-zinc-600">
          <span>
            第 {currentPage} / {totalPages} 页
          </span>
          <div className="flex gap-1">
            <button
              type="button"
              className="rounded border border-zinc-300 px-2 py-0.5 hover:bg-zinc-50 disabled:opacity-50"
              disabled={loading || currentPage <= 1}
              onClick={() => void loadPage(Math.max(0, offset - PAGE_SIZE))}
            >
              上一页
            </button>
            <button
              type="button"
              className="rounded border border-zinc-300 px-2 py-0.5 hover:bg-zinc-50 disabled:opacity-50"
              disabled={loading || currentPage >= totalPages}
              onClick={() => void loadPage(offset + PAGE_SIZE)}
            >
              下一页
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
