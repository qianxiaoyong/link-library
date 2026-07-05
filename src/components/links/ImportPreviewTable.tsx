"use client";

import type { ParsedLinkItem } from "@/shared/parser/link-parser-types";
import { displayValue, getPlatformLabel } from "./link-ui-utils";

export type PreviewItem = ParsedLinkItem & { key: string };

type ImportPreviewTableProps = {
  items: PreviewItem[];
  onRemove: (key: string) => void;
  disabled?: boolean;
};

export function ImportPreviewTable({
  items,
  onRemove,
  disabled = false,
}: ImportPreviewTableProps) {
  if (items.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-zinc-300 bg-white px-4 py-6 text-center text-sm text-zinc-500">
        预览列表为空，请解析文本或取消移除操作。
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-zinc-200 bg-white">
      <table className="min-w-full divide-y divide-zinc-200 text-sm">
        <thead className="bg-zinc-50">
          <tr>
            {["序号", "平台", "标题", "标准链接", "提取码", "警告", "操作"].map(
              (header) => (
                <th
                  key={header}
                  className="whitespace-nowrap px-3 py-3 text-left font-medium text-zinc-700"
                >
                  {header}
                </th>
              ),
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-100">
          {items.map((item, index) => (
            <tr key={item.key}>
              <td className="px-3 py-3 text-zinc-600">{index + 1}</td>
              <td className="whitespace-nowrap px-3 py-3">
                {getPlatformLabel(item.platform)}
              </td>
              <td className="max-w-xs truncate px-3 py-3 font-medium text-zinc-900">
                {item.title}
              </td>
              <td className="max-w-xs truncate px-3 py-3 text-blue-600">
                {item.url}
              </td>
              <td className="whitespace-nowrap px-3 py-3">
                {displayValue(item.accessCode)}
              </td>
              <td className="max-w-xs truncate px-3 py-3 text-amber-700">
                {item.warnings.length > 0 ? item.warnings.join("；") : "—"}
              </td>
              <td className="whitespace-nowrap px-3 py-3">
                <button
                  type="button"
                  className="text-red-600 hover:underline disabled:opacity-50"
                  disabled={disabled}
                  onClick={() => onRemove(item.key)}
                >
                  移除
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

type ImportFailuresTableProps = {
  failures: Array<{ sourceText: string; reason: string }>;
  title?: string;
};

export function ImportFailuresTable({
  failures,
  title = "解析失败项",
}: ImportFailuresTableProps) {
  if (failures.length === 0) return null;

  return (
    <section className="space-y-2">
      <h3 className="text-sm font-semibold text-zinc-800">{title}</h3>
      <div className="overflow-x-auto rounded-lg border border-red-200 bg-red-50/40">
        <table className="min-w-full divide-y divide-red-100 text-sm">
          <thead className="bg-red-50">
            <tr>
              <th className="px-3 py-2 text-left font-medium text-zinc-700">原因</th>
              <th className="px-3 py-2 text-left font-medium text-zinc-700">
                原始片段
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-red-100">
            {failures.map((failure, index) => (
              <tr key={`${failure.reason}-${index}`}>
                <td className="whitespace-nowrap px-3 py-2 text-red-700">
                  {failure.reason}
                </td>
                <td className="max-w-xl truncate px-3 py-2 text-zinc-700">
                  {failure.sourceText || "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
