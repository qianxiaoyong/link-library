"use client";

import { useState } from "react";
import type { ApplyImportResponse } from "@/shared/api/links-client";
import type { ParsedLinkItem } from "@/shared/parser/link-parser-types";
import { displayValue, getPlatformLabel } from "./link-ui-utils";

export type PreviewItem = ParsedLinkItem & { key: string };

type ImportPreviewTableProps = {
  items: PreviewItem[];
  onRemove: (key: string) => void;
  disabled?: boolean;
};

const rowClassName = "h-11 whitespace-nowrap";

export function ImportPreviewTable({
  items,
  onRemove,
  disabled = false,
}: ImportPreviewTableProps) {
  if (items.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-zinc-300 bg-white px-4 py-8 text-center text-sm text-zinc-500">
        预览列表为空，请解析文本或取消移除操作。
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white">
      <table className="w-full table-fixed divide-y divide-zinc-200 text-sm">
        <thead className="sticky top-0 z-10 bg-zinc-50">
          <tr>
            {["序号", "平台", "标题", "标准链接", "提取码", "警告", "操作"].map(
              (header) => (
                <th
                  key={header}
                  className="overflow-hidden text-ellipsis px-2 py-2 text-left text-xs font-medium text-zinc-700"
                >
                  {header}
                </th>
              ),
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-100">
          {items.map((item, index) => (
            <tr key={item.key} className={rowClassName}>
              <td className="overflow-hidden text-ellipsis px-2 text-zinc-600">
                {index + 1}
              </td>
              <td className="overflow-hidden text-ellipsis px-2">
                {getPlatformLabel(item.platform)}
              </td>
              <td
                className="overflow-hidden text-ellipsis px-2 font-medium text-zinc-900"
                title={item.title}
              >
                {item.title}
              </td>
              <td
                className="overflow-hidden text-ellipsis px-2 text-blue-600"
                title={item.rawUrl !== item.url ? `${item.url}\n${item.rawUrl}` : item.url}
              >
                {item.url}
              </td>
              <td className="overflow-hidden text-ellipsis px-2">
                {displayValue(item.accessCode)}
              </td>
              <td
                className="overflow-hidden text-ellipsis px-2 text-amber-700"
                title={
                  item.warnings.length > 0 ? item.warnings.join("；") : undefined
                }
              >
                {item.warnings.length > 0 ? item.warnings.join("；") : "—"}
              </td>
              <td className="overflow-hidden text-ellipsis px-2">
                <button
                  type="button"
                  className="text-xs text-red-600 hover:underline disabled:opacity-50"
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
  const [expanded, setExpanded] = useState(failures.length <= 3);

  if (failures.length === 0) return null;

  return (
    <section className="rounded-lg border border-red-200 bg-red-50/40">
      <button
        type="button"
        className="flex w-full items-center justify-between px-3 py-2 text-left"
        onClick={() => setExpanded((current) => !current)}
      >
        <h3 className="text-sm font-semibold text-zinc-800">
          {title}（{failures.length}）
        </h3>
        <span className="text-xs text-zinc-600">
          {expanded ? "收起" : "展开"}
        </span>
      </button>

      {expanded ? (
        <div className="max-h-40 overflow-auto border-t border-red-100">
          <table className="w-full table-fixed divide-y divide-red-100 text-sm">
            <thead className="sticky top-0 bg-red-50">
              <tr>
                <th className="w-32 px-2 py-1.5 text-left text-xs font-medium text-zinc-700">
                  原因
                </th>
                <th className="px-2 py-1.5 text-left text-xs font-medium text-zinc-700">
                  原始片段
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-red-100">
              {failures.map((failure, index) => (
                <tr key={`${failure.reason}-${index}`} className="h-10">
                  <td className="overflow-hidden text-ellipsis whitespace-nowrap px-2 text-red-700">
                    {failure.reason}
                  </td>
                  <td
                    className="overflow-hidden text-ellipsis whitespace-nowrap px-2 text-zinc-700"
                    title={failure.sourceText || undefined}
                  >
                    {failure.sourceText || "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </section>
  );
}

type ImportApplyResultProps = {
  result: ApplyImportResponse;
};

export function ImportApplyResult({ result }: ImportApplyResultProps) {
  const [duplicatesExpanded, setDuplicatesExpanded] = useState(
    result.skippedDuplicates.length <= 3,
  );
  const [failuresExpanded, setFailuresExpanded] = useState(
    result.failures.length <= 3,
  );

  return (
    <section className="space-y-3">
      <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3">
        <h3 className="text-sm font-semibold text-emerald-900">导入完成</h3>
        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-emerald-800">
          <span>成功导入：{result.summary.created} 条</span>
          <span>跳过重复：{result.summary.skippedDuplicates} 条</span>
          <span>失败：{result.summary.failures} 条</span>
        </div>
      </div>

      {result.skippedDuplicates.length > 0 ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50/50">
          <button
            type="button"
            className="flex w-full items-center justify-between px-3 py-2 text-left"
            onClick={() => setDuplicatesExpanded((current) => !current)}
          >
            <h3 className="text-sm font-semibold text-zinc-800">
              跳过的重复链接（{result.skippedDuplicates.length}）
            </h3>
            <span className="text-xs text-zinc-600">
              {duplicatesExpanded ? "收起" : "展开"}
            </span>
          </button>
          {duplicatesExpanded ? (
            <div className="max-h-40 overflow-auto border-t border-amber-100">
              <table className="w-full table-fixed divide-y divide-amber-100 text-sm">
                <thead className="sticky top-0 bg-amber-50">
                  <tr>
                    {["平台", "标题", "标准链接"].map((header) => (
                      <th
                        key={header}
                        className="px-2 py-1.5 text-left text-xs font-medium text-zinc-700"
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-amber-100">
                  {result.skippedDuplicates.map((item) => (
                    <tr key={`${item.platform}-${item.url}`} className="h-10">
                      <td className="overflow-hidden text-ellipsis whitespace-nowrap px-2">
                        {getPlatformLabel(item.platform)}
                      </td>
                      <td
                        className="overflow-hidden text-ellipsis whitespace-nowrap px-2"
                        title={item.title}
                      >
                        {item.title}
                      </td>
                      <td
                        className="overflow-hidden text-ellipsis whitespace-nowrap px-2 text-blue-600"
                        title={item.url}
                      >
                        {item.url}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}
        </div>
      ) : null}

      {result.failures.length > 0 ? (
        <div className="rounded-lg border border-red-200 bg-red-50/40">
          <button
            type="button"
            className="flex w-full items-center justify-between px-3 py-2 text-left"
            onClick={() => setFailuresExpanded((current) => !current)}
          >
            <h3 className="text-sm font-semibold text-zinc-800">
              导入失败项（{result.failures.length}）
            </h3>
            <span className="text-xs text-zinc-600">
              {failuresExpanded ? "收起" : "展开"}
            </span>
          </button>
          {failuresExpanded ? (
            <div className="max-h-40 overflow-auto border-t border-red-100">
              <table className="w-full table-fixed divide-y divide-red-100 text-sm">
                <thead className="sticky top-0 bg-red-50">
                  <tr>
                    <th className="w-40 px-2 py-1.5 text-left text-xs font-medium text-zinc-700">
                      标题
                    </th>
                    <th className="px-2 py-1.5 text-left text-xs font-medium text-zinc-700">
                      原因
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-red-100">
                  {result.failures.map((failure, index) => (
                    <tr key={`${failure.title ?? "item"}-${index}`} className="h-10">
                      <td className="overflow-hidden text-ellipsis whitespace-nowrap px-2">
                        {failure.title ?? "—"}
                      </td>
                      <td className="overflow-hidden text-ellipsis whitespace-nowrap px-2 text-red-700">
                        {failure.reason}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
