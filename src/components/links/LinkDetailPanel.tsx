"use client";

import { useState } from "react";
import type { ResourceLink } from "@/shared/types/resource-link";
import { LinkStatusBadge } from "./LinkStatusBadge";
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
}: LinkDetailPanelProps) {
  const [copyMessage, setCopyMessage] = useState("");

  if (!item) {
    return (
      <aside className="rounded-lg border border-dashed border-zinc-300 bg-white p-6 text-zinc-500">
        请选择一条资料查看详情
      </aside>
    );
  }

  async function handleCopy(label: string, text: string | null) {
    if (!text) return;
    await copyToClipboard(text);
    setCopyMessage(`已复制${label}`);
    window.setTimeout(() => setCopyMessage(""), 1500);
  }

  return (
    <aside className="rounded-lg border border-zinc-200 bg-white p-4">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-zinc-900">{item.title}</h2>
        <div className="mt-2 flex flex-wrap gap-2">
          <LinkStatusBadge status={item.status} />
          {item.favorite ? (
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-800">
              已收藏
            </span>
          ) : null}
        </div>
      </div>

      {copyMessage ? (
        <div className="mb-3 rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          {copyMessage}
        </div>
      ) : null}

      <div className="mb-4 flex flex-wrap gap-2">
        <button
          type="button"
          className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm hover:bg-zinc-50"
          onClick={() => handleCopy("链接", item.url)}
        >
          复制链接
        </button>
        <button
          type="button"
          className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm hover:bg-zinc-50"
          onClick={() => handleCopy("提取码", item.accessCode)}
          disabled={!item.accessCode}
        >
          复制提取码
        </button>
        <button
          type="button"
          className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm hover:bg-zinc-50"
          onClick={() => onEdit(item)}
        >
          编辑
        </button>
        <button
          type="button"
          className="rounded-md border border-red-300 px-3 py-1.5 text-sm text-red-700 hover:bg-red-50"
          onClick={() => onDelete(item)}
        >
          删除
        </button>
        <button
          type="button"
          className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm hover:bg-zinc-50"
          onClick={() => onToggleFavorite(item)}
        >
          {item.favorite ? "取消收藏" : "收藏"}
        </button>
        <button
          type="button"
          className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm hover:bg-zinc-50"
          onClick={() => onToggleStatus(item)}
        >
          {item.status === "normal" ? "标记已失效" : "标记正常"}
        </button>
      </div>

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
    </aside>
  );
}
