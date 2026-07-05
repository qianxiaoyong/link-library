"use client";

import type { ResourceLink } from "@/shared/types/resource-link";
import { LinkStatusBadge } from "./LinkStatusBadge";
import {
  displayValue,
  getCategoryLabel,
  getPlatformLabel,
  getPlatformTableLabel,
} from "./link-ui-utils";

type LinkTableProps = {
  items: ResourceLink[];
  offset: number;
  selectedId: string | null;
  selectedRowIds: Set<string>;
  onSelect: (item: ResourceLink) => void;
  onToggleRow: (id: string, checked: boolean) => void;
  onToggleAll: (checked: boolean) => void;
  onCopyInfo: (item: ResourceLink) => void;
  onEdit: (item: ResourceLink) => void;
  onDelete: (item: ResourceLink) => void;
};

const ROW_CLASS = "h-11 max-h-11";
const CELL_CLASS =
  "overflow-hidden text-ellipsis whitespace-nowrap px-2 py-0 align-middle";

export function LinkTable({
  items,
  offset,
  selectedId,
  selectedRowIds,
  onSelect,
  onToggleRow,
  onToggleAll,
  onCopyInfo,
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
          <th className={`${CELL_CLASS} w-9`}>序号</th>
          <th className={`${CELL_CLASS} w-[52px]`}>年份</th>
          <th className={`${CELL_CLASS} w-[28%]`}>标题</th>
          <th className={`${CELL_CLASS} w-[72px]`}>科目</th>
          <th className={`${CELL_CLASS} w-[72px]`}>年级</th>
          <th className={`${CELL_CLASS} w-[48px]`}>分类</th>
          <th className={`${CELL_CLASS} w-[56px]`}>平台</th>
          <th className={`${CELL_CLASS} w-[11%]`}>链接</th>
          <th className={`${CELL_CLASS} w-[56px]`}>状态</th>
          <th className={`${CELL_CLASS} w-[40px]`}>收藏</th>
          <th className={`${CELL_CLASS} w-[10%]`}>备注</th>
          <th className={`${CELL_CLASS} w-[96px]`}>操作</th>
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
              <td
                className={`${CELL_CLASS} text-zinc-700`}
                title={item.resourceYear ?? undefined}
              >
                {displayValue(item.resourceYear)}
              </td>
              <td
                className={`${CELL_CLASS} font-medium text-zinc-900`}
                title={item.title}
              >
                {item.title}
              </td>
              <td
                className={`${CELL_CLASS} text-zinc-700`}
                title={item.subject ?? undefined}
              >
                {displayValue(item.subject)}
              </td>
              <td
                className={`${CELL_CLASS} text-zinc-700`}
                title={item.grade ?? undefined}
              >
                {displayValue(item.grade)}
              </td>
              <td className={`${CELL_CLASS} text-zinc-700`}>
                {getCategoryLabel(item.resourceCategory)}
              </td>
              <td
                className={`${CELL_CLASS} text-zinc-700`}
                title={getPlatformLabel(item.platform)}
              >
                {getPlatformTableLabel(item.platform)}
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
              <td className={CELL_CLASS}>
                <LinkStatusBadge status={item.status} />
              </td>
              <td className={`${CELL_CLASS} text-center`}>
                {item.favorite ? "是" : "—"}
              </td>
              <td
                className={`${CELL_CLASS} text-zinc-700`}
                title={item.description ?? undefined}
              >
                {displayValue(item.description)}
              </td>
              <td className={CELL_CLASS}>
                <div className="flex gap-1 text-xs">
                  <button
                    type="button"
                    className="text-blue-600 hover:underline"
                    onClick={(event) => {
                      event.stopPropagation();
                      onCopyInfo(item);
                    }}
                  >
                    复制
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
