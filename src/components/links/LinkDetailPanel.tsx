"use client";

import type { ResourceLink } from "@/shared/types/resource-link";
import { LinkStatusBadge } from "./LinkStatusBadge";
import type { PageToastVariant } from "./use-page-toast";
import {
  copyToClipboard,
  displayValue,
  formatDateTime,
  getCategoryLabel,
  getPlatformLabel,
} from "./link-ui-utils";

type LinkDetailPanelProps = {
  item: ResourceLink | null;
  onEdit: (item: ResourceLink) => void;
  onDelete: (item: ResourceLink) => void;
  onToggleFavorite: (item: ResourceLink) => void;
  onToggleStatus: (item: ResourceLink) => void;
  onShowToast: (message: string, variant?: PageToastVariant) => void;
};

function DetailRow({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-[88px_1fr] gap-2 border-b border-zinc-100 py-2 text-sm">
      <div className="font-medium text-zinc-600">{label}</div>
      <div className="break-all text-zinc-900">{value}</div>
    </div>
  );
}

export function LinkDetailPanel({
  item,
  onEdit,
  onDelete,
  onToggleFavorite,
  onToggleStatus,
  onShowToast,
}: LinkDetailPanelProps) {
  if (!item) {
    return (
      <aside className="flex h-full items-center justify-center rounded-lg border border-dashed border-zinc-300 bg-white p-4 text-sm text-zinc-500">
        请选择一条资料查看详情
      </aside>
    );
  }

  async function handleCopyInfo(current: ResourceLink) {
    if (!current.sourceText?.trim()) {
      onShowToast("当前资料没有原始输入内容。", "warning");
      return;
    }

    try {
      await copyToClipboard(current.sourceText);
      onShowToast("已复制原始输入内容。", "success");
    } catch {
      onShowToast("复制失败，请稍后重试。", "error");
    }
  }

  return (
    <aside className="flex h-full min-h-0 flex-col overflow-hidden rounded-lg border border-zinc-200 bg-white">
      <div className="shrink-0 border-b border-zinc-100 p-3">
        <h2 className="line-clamp-2 text-base font-semibold text-zinc-900">
          {item.title}
        </h2>
        <div className="mt-2 flex flex-wrap gap-2">
          <LinkStatusBadge status={item.status} />
          {item.favorite ? (
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-800">
              已收藏
            </span>
          ) : null}
        </div>

        <div className="mt-3 flex flex-wrap gap-1.5">
          <button
            type="button"
            className="rounded border border-zinc-300 px-2 py-1 text-xs hover:bg-zinc-50"
            onClick={() => void handleCopyInfo(item)}
          >
            复制信息
          </button>
          <button
            type="button"
            className="rounded border border-zinc-300 px-2 py-1 text-xs hover:bg-zinc-50"
            onClick={() => onEdit(item)}
          >
            编辑
          </button>
          <button
            type="button"
            className="rounded border border-red-300 px-2 py-1 text-xs text-red-700 hover:bg-red-50"
            onClick={() => onDelete(item)}
          >
            删除
          </button>
          <button
            type="button"
            className="rounded border border-zinc-300 px-2 py-1 text-xs hover:bg-zinc-50"
            onClick={() => onToggleFavorite(item)}
          >
            {item.favorite ? "取消收藏" : "收藏"}
          </button>
          <button
            type="button"
            className="rounded border border-zinc-300 px-2 py-1 text-xs hover:bg-zinc-50"
            onClick={() => onToggleStatus(item)}
          >
            {item.status === "normal" ? "标记已失效" : "标记正常"}
          </button>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-3">
        <DetailRow label="平台" value={getPlatformLabel(item.platform)} />
        <DetailRow
          label="原始链接"
          value={
            <a
              href={item.rawUrl}
              target="_blank"
              rel="noreferrer noopener"
              className="text-blue-600 hover:underline"
            >
              {item.rawUrl}
            </a>
          }
        />
        <DetailRow
          label="标准链接"
          value={
            <a
              href={item.url}
              target="_blank"
              rel="noreferrer noopener"
              className="text-blue-600 hover:underline"
            >
              {item.url}
            </a>
          }
        />
        <DetailRow
          label="提取码"
          value={item.accessCode ? item.accessCode : "无"}
        />
        <DetailRow
          label="资料分类"
          value={getCategoryLabel(item.resourceCategory)}
        />
        <DetailRow label="备注" value={displayValue(item.description)} />
        <DetailRow label="学段" value={displayValue(item.schoolStage)} />
        <DetailRow label="年级" value={displayValue(item.grade)} />
        <DetailRow label="学期" value={displayValue(item.semester)} />
        <DetailRow label="科目" value={displayValue(item.subject)} />
        <DetailRow label="资料年份" value={displayValue(item.resourceYear)} />
        <DetailRow label="状态" value={<LinkStatusBadge status={item.status} />} />
        <DetailRow label="是否收藏" value={item.favorite ? "是" : "否"} />
        <DetailRow label="原始输入" value={displayValue(item.sourceText)} />
        <DetailRow label="创建时间" value={formatDateTime(item.createdAt)} />
        <DetailRow label="更新时间" value={formatDateTime(item.updatedAt)} />
      </div>
    </aside>
  );
}
