"use client";

import type { ResourceLink } from "@/shared/types/resource-link";
import { LinkStatusBadge } from "./LinkStatusBadge";
import {
  formatDateTime,
  formatResourceInfo,
  getPlatformLabel,
} from "./link-ui-utils";

type LinkTableProps = {
  items: ResourceLink[];
  offset: number;
  selectedId: string | null;
  selectedRowIds: Set<string>;
  onSelect: (item: ResourceLink) => void;
  onToggleRow: (id: string, checked: boolean) => void;
  onToggleAll: (checked: boolean) => void;
  onEdit: (item: ResourceLink) => void;
  onDelete: (item: ResourceLink) => void;
};

const ROW_CLASS = "h-11 max-h-11";
const CELL_CLASS = "overflow-hidden text-ellipsis whitespace-nowrap px-2 py-0 align-middle";

export function LinkTable({
  items,
  offset,
  selectedId,
  selectedRowIds,
  onSelect,
  onToggleRow,
  onToggleAll,
  onEdit,
  onDelete,
}: LinkTableProps) {
  const allPageSelected =
    items.length > 0 && items.every((item) => selectedRowIds.has(item.id));
  const somePageSelected = items.some((item) => selectedRowIds.has(item.id));

  if (items.length === 0) {
    return (
      <div className="flex h-full min-h-[120px] items-center justify-center text-sm text-zinc-500">
        暂无资料
      </div>
    );
  }

  return (
    <table className="w-full table-fixed border-collapse text-sm">
      <thead className="sticky top-0 z-10 bg-zinc-50 shadow-[0_1px_0_#e4e4e7]">
        <tr className={`${ROW_CLASS} text-left text-xs font-medium text-zinc-700`}>
          <th className="w-10 px-2">
            <input
              type="checkbox"
              aria-label="全选当前页"
              checked={allPageSelected}
              ref={(element) => {
                if (element) {
                  element.indeterminate = somePageSelected && !allPageSelected;
                }
              }}
              onChange={(event) => onToggleAll(event.target.checked)}
            />
          </th>
          <th className={`${CELL_CLASS} w-12`}>序号</th>
          <th className={`${CELL_CLASS} w-[16%]`}>标题</th>
          <th className={`${CELL_CLASS} w-[22%]`}>原始链接</th>
          <th className={`${CELL_CLASS} w-[18%]`}>资料信息</th>
          <th className={`${CELL_CLASS} w-20`}>平台</th>
          <th className={`${CELL_CLASS} w-16`}>状态</th>
          <th className={`${CELL_CLASS} w-12`}>收藏</th>
          <th className={`${CELL_CLASS} w-28`}>创建时间</th>
          <th className={`${CELL_CLASS} w-28`}>操作</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-zinc-100">
        {items.map((item, index) => {
          const isSelected = item.id === selectedId;
          const isChecked = selectedRowIds.has(item.id);

          return (
            <tr
              key={item.id}
              className={`${ROW_CLASS} cursor-pointer hover:bg-zinc-50 ${isSelected ? "bg-blue-50" : ""}`}
              onClick={() => onSelect(item)}
            >
              <td className="px-2 align-middle">
                <input
                  type="checkbox"
                  checked={isChecked}
                  onClick={(event) => event.stopPropagation()}
                  onChange={(event) =>
                    onToggleRow(item.id, event.target.checked)
                  }
                />
              </td>
              <td className={`${CELL_CLASS} text-zinc-600`}>
                {offset + index + 1}
              </td>
              <td className={`${CELL_CLASS} font-medium text-zinc-900`} title={item.title}>
                {item.title}
              </td>
              <td className={CELL_CLASS}>
                <a
                  href={item.rawUrl}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="block overflow-hidden text-ellipsis whitespace-nowrap text-blue-600 hover:underline"
                  title={item.rawUrl}
                  onClick={(event) => event.stopPropagation()}
                >
                  {item.rawUrl}
                </a>
              </td>
              <td className={`${CELL_CLASS} text-zinc-700`} title={formatResourceInfo(item)}>
                {formatResourceInfo(item)}
              </td>
              <td className={`${CELL_CLASS} text-zinc-700`}>
                {getPlatformLabel(item.platform)}
              </td>
              <td className={CELL_CLASS}>
                <LinkStatusBadge status={item.status} />
              </td>
              <td className={`${CELL_CLASS} text-center`}>
                {item.favorite ? "★" : "—"}
              </td>
              <td className={`${CELL_CLASS} text-zinc-600`}>
                {formatDateTime(item.createdAt)}
              </td>
              <td className={CELL_CLASS}>
                <div className="flex gap-1">
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
  );
}
