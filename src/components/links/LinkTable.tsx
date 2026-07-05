"use client";

import type { ResourceLink } from "@/shared/types/resource-link";
import { LinkStatusBadge } from "./LinkStatusBadge";
import {
  displayValue,
  formatDateTime,
  getCategoryLabel,
  getPlatformLabel,
} from "./link-ui-utils";

type LinkTableProps = {
  items: ResourceLink[];
  selectedId: string | null;
  onSelect: (item: ResourceLink) => void;
  onEdit: (item: ResourceLink) => void;
  onDelete: (item: ResourceLink) => void;
};

export function LinkTable({
  items,
  selectedId,
  onSelect,
  onEdit,
  onDelete,
}: LinkTableProps) {
  if (items.length === 0) {
    return (
      <div className="flex min-h-64 items-center justify-center rounded-lg border border-dashed border-zinc-300 bg-white text-zinc-500">
        暂无资料
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-zinc-200 bg-white">
      <table className="min-w-full divide-y divide-zinc-200 text-sm">
        <thead className="bg-zinc-50">
          <tr>
            {[
              "标题",
              "平台",
              "资料分类",
              "学段",
              "年级",
              "学期",
              "科目",
              "资料年份",
              "收藏",
              "状态",
              "创建时间",
              "操作",
            ].map((header) => (
              <th
                key={header}
                className="whitespace-nowrap px-3 py-3 text-left font-medium text-zinc-700"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-100">
          {items.map((item) => {
            const isSelected = item.id === selectedId;

            return (
              <tr
                key={item.id}
                className={`cursor-pointer hover:bg-zinc-50 ${isSelected ? "bg-blue-50" : ""}`}
                onClick={() => onSelect(item)}
              >
                <td className="max-w-xs truncate px-3 py-3 font-medium text-zinc-900">
                  {item.title}
                </td>
                <td className="whitespace-nowrap px-3 py-3">
                  {getPlatformLabel(item.platform)}
                </td>
                <td className="whitespace-nowrap px-3 py-3">
                  {getCategoryLabel(item.resourceCategory)}
                </td>
                <td className="whitespace-nowrap px-3 py-3">
                  {displayValue(item.schoolStage)}
                </td>
                <td className="whitespace-nowrap px-3 py-3">
                  {displayValue(item.grade)}
                </td>
                <td className="whitespace-nowrap px-3 py-3">
                  {displayValue(item.semester)}
                </td>
                <td className="whitespace-nowrap px-3 py-3">
                  {displayValue(item.subject)}
                </td>
                <td className="whitespace-nowrap px-3 py-3">
                  {displayValue(item.resourceYear)}
                </td>
                <td className="whitespace-nowrap px-3 py-3">
                  {item.favorite ? "★" : "—"}
                </td>
                <td className="whitespace-nowrap px-3 py-3">
                  <LinkStatusBadge status={item.status} />
                </td>
                <td className="whitespace-nowrap px-3 py-3 text-zinc-600">
                  {formatDateTime(item.createdAt)}
                </td>
                <td className="whitespace-nowrap px-3 py-3">
                  <div className="flex gap-2">
                    <button
                      type="button"
                      className="text-blue-600 hover:underline"
                      onClick={(event) => {
                        event.stopPropagation();
                        onSelect(item);
                      }}
                    >
                      查看
                    </button>
                    <button
                      type="button"
                      className="text-blue-600 hover:underline"
                      onClick={(event) => {
                        event.stopPropagation();
                        onEdit(item);
                      }}
                    >
                      编辑
                    </button>
                    <button
                      type="button"
                      className="text-red-600 hover:underline"
                      onClick={(event) => {
                        event.stopPropagation();
                        onDelete(item);
                      }}
                    >
                      删除
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
