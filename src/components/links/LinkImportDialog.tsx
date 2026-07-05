"use client";

import { useMemo, useState } from "react";
import {
  applyImportItems,
  getErrorMessage,
  parseImportText,
  type ApplyImportResponse,
} from "@/shared/api/links-client";
import type { ParseLinkTextResult } from "@/shared/parser/link-parser-types";
import {
  defaultImportDefaultsValues,
  ImportDefaultsForm,
  importDefaultsToInput,
  type ImportDefaultsValues,
} from "./ImportDefaultsForm";
import {
  ImportFailuresTable,
  ImportPreviewTable,
  type PreviewItem,
} from "./ImportPreviewTable";
import { getPlatformLabel } from "./link-ui-utils";

type LinkImportDialogProps = {
  open: boolean;
  onClose: () => void;
  onComplete: (hint?: string) => void;
};

function toPreviewItems(
  items: ParseLinkTextResult["items"],
): PreviewItem[] {
  return items.map((item, index) => ({
    ...item,
    key: `${item.platform}-${item.url}-${index}`,
  }));
}

function toParsedItems(items: PreviewItem[]) {
  return items.map(({ key, ...item }) => {
    void key;
    return item;
  });
}

export function LinkImportDialog({
  open,
  onClose,
  onComplete,
}: LinkImportDialogProps) {
  const [text, setText] = useState("");
  const [defaults, setDefaults] = useState<ImportDefaultsValues>(
    defaultImportDefaultsValues,
  );
  const [parseResult, setParseResult] = useState<ParseLinkTextResult | null>(
    null,
  );
  const [previewItems, setPreviewItems] = useState<PreviewItem[]>([]);
  const [applyResult, setApplyResult] = useState<ApplyImportResponse | null>(
    null,
  );
  const [parsing, setParsing] = useState(false);
  const [applying, setApplying] = useState(false);
  const [inputError, setInputError] = useState("");
  const [parseError, setParseError] = useState("");
  const [applyError, setApplyError] = useState("");

  const hasPreview = parseResult !== null;
  const showResult = applyResult !== null;

  const canConfirmImport = useMemo(
    () => previewItems.length > 0 && !applying && !showResult,
    [previewItems.length, applying, showResult],
  );

  if (!open) return null;

  function handleClearText() {
    setText("");
    setInputError("");
    setParseError("");
  }

  async function handleParse() {
    if (!text.trim()) {
      setInputError("请先粘贴分享文本。");
      return;
    }

    setInputError("");
    setParseError("");
    setApplyError("");
    setApplyResult(null);
    setParsing(true);

    try {
      const result = await parseImportText(text);
      setParseResult(result);
      setPreviewItems(toPreviewItems(result.items));
    } catch (error) {
      setParseError(`解析失败，请稍后重试。${getErrorMessage(error)}`);
      setParseResult(null);
      setPreviewItems([]);
    } finally {
      setParsing(false);
    }
  }

  function handleRemovePreviewItem(key: string) {
    setPreviewItems((current) => current.filter((item) => item.key !== key));
  }

  async function handleConfirmImport() {
    if (previewItems.length === 0) return;

    setApplying(true);
    setApplyError("");

    try {
      const result = await applyImportItems({
        items: toParsedItems(previewItems),
        defaults: importDefaultsToInput(defaults),
      });
      setApplyResult(result);
    } catch (error) {
      setApplyError(`导入失败，请稍后重试。${getErrorMessage(error)}`);
    } finally {
      setApplying(false);
    }
  }

  function handleContinueImport() {
    setText("");
    setParseResult(null);
    setPreviewItems([]);
    setApplyResult(null);
    setInputError("");
    setParseError("");
    setApplyError("");
  }

  function handleFinish() {
    onComplete(
      applyResult && applyResult.summary.created > 0
        ? "导入成功，若列表未显示，请检查当前筛选条件。"
        : undefined,
    );
    handleContinueImport();
    onClose();
  }

  function handleClose() {
    if (applying) return;
    handleContinueImport();
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="flex max-h-[92vh] w-full max-w-5xl flex-col rounded-lg bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-zinc-200 px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold text-zinc-900">批量导入</h2>
            <p className="mt-1 text-sm text-zinc-600">
              粘贴百度 / 夸克分享文本，解析后确认导入
            </p>
          </div>
          <button
            type="button"
            className="text-zinc-500 hover:text-zinc-800 disabled:opacity-50"
            onClick={handleClose}
            disabled={applying}
          >
            关闭
          </button>
        </div>

        <div className="space-y-4 overflow-y-auto px-6 py-4">
          {!showResult ? (
            <>
              <section className="space-y-2">
                <label className="block text-sm font-medium text-zinc-800">
                  粘贴百度 / 夸克分享文本
                </label>
                <textarea
                  className="min-h-40 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm text-zinc-900 outline-none focus:border-blue-500"
                  placeholder="可以粘贴单条或多条百度网盘、夸克网盘分享文本。"
                  value={text}
                  disabled={parsing || applying}
                  onChange={(event) => {
                    setText(event.target.value);
                    if (inputError) setInputError("");
                  }}
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    className="rounded-md bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:opacity-60"
                    onClick={() => void handleParse()}
                    disabled={parsing || applying}
                  >
                    {parsing ? "解析中..." : "解析文本"}
                  </button>
                  <button
                    type="button"
                    className="rounded-md border border-zinc-300 px-4 py-2 text-sm hover:bg-zinc-50 disabled:opacity-60"
                    onClick={handleClearText}
                    disabled={parsing || applying}
                  >
                    清空
                  </button>
                </div>
                {inputError ? (
                  <p className="text-sm text-red-600">{inputError}</p>
                ) : null}
                {parseError ? (
                  <p className="text-sm text-red-600">{parseError}</p>
                ) : null}
              </section>

              {hasPreview ? (
                <>
                  <section className="rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-700">
                    {parseResult && parseResult.summary.totalItems > 0 ? (
                      <p>
                        共解析出 {parseResult.summary.totalItems} 条，百度{" "}
                        {parseResult.summary.baiduCount} 条，夸克{" "}
                        {parseResult.summary.quarkCount} 条，失败{" "}
                        {parseResult.summary.failureCount} 条
                      </p>
                    ) : (
                      <p>
                        没有识别到可导入的百度或夸克链接，请检查粘贴内容。
                      </p>
                    )}
                    <p className="mt-1 text-zinc-600">
                      当前待导入 {previewItems.length} 条
                    </p>
                  </section>

                  {parseResult && parseResult.summary.totalItems > 0 ? (
                    <>
                      <section className="space-y-2">
                        <h3 className="text-sm font-semibold text-zinc-800">
                          预览列表
                        </h3>
                        <ImportPreviewTable
                          items={previewItems}
                          onRemove={handleRemovePreviewItem}
                          disabled={applying}
                        />
                      </section>

                      {parseResult.failures.length > 0 ? (
                        <ImportFailuresTable failures={parseResult.failures} />
                      ) : null}

                      <ImportDefaultsForm
                        values={defaults}
                        onChange={setDefaults}
                        disabled={applying}
                      />

                      {applyError ? (
                        <p className="text-sm text-red-600">{applyError}</p>
                      ) : null}
                    </>
                  ) : null}
                </>
              ) : null}
            </>
          ) : (
            <section className="space-y-4">
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3">
                <h3 className="text-base font-semibold text-emerald-900">
                  导入完成
                </h3>
                <p className="mt-2 text-sm text-emerald-800">
                  成功导入：{applyResult.summary.created} 条
                </p>
                <p className="text-sm text-emerald-800">
                  跳过重复：{applyResult.summary.skippedDuplicates} 条
                </p>
                <p className="text-sm text-emerald-800">
                  失败：{applyResult.summary.failures} 条
                </p>
              </div>

              {applyResult.skippedDuplicates.length > 0 ? (
                <section className="space-y-2">
                  <h3 className="text-sm font-semibold text-zinc-800">
                    跳过的重复链接
                  </h3>
                  <div className="overflow-x-auto rounded-lg border border-zinc-200">
                    <table className="min-w-full divide-y divide-zinc-200 text-sm">
                      <thead className="bg-zinc-50">
                        <tr>
                          {["平台", "标题", "标准链接"].map((header) => (
                            <th
                              key={header}
                              className="px-3 py-2 text-left font-medium text-zinc-700"
                            >
                              {header}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-100">
                        {applyResult.skippedDuplicates.map((item) => (
                          <tr key={`${item.platform}-${item.url}`}>
                            <td className="px-3 py-2">
                              {getPlatformLabel(item.platform)}
                            </td>
                            <td className="max-w-xs truncate px-3 py-2">
                              {item.title}
                            </td>
                            <td className="max-w-xs truncate px-3 py-2 text-blue-600">
                              {item.url}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>
              ) : null}

              {applyResult.failures.length > 0 ? (
                <section className="space-y-2">
                  <h3 className="text-sm font-semibold text-zinc-800">
                    导入失败项
                  </h3>
                  <div className="overflow-x-auto rounded-lg border border-red-200">
                    <table className="min-w-full divide-y divide-red-100 text-sm">
                      <thead className="bg-red-50">
                        <tr>
                          <th className="px-3 py-2 text-left font-medium text-zinc-700">
                            标题
                          </th>
                          <th className="px-3 py-2 text-left font-medium text-zinc-700">
                            原因
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-red-100">
                        {applyResult.failures.map((failure, index) => (
                          <tr key={`${failure.title ?? "item"}-${index}`}>
                            <td className="px-3 py-2">
                              {failure.title ?? "—"}
                            </td>
                            <td className="px-3 py-2 text-red-700">
                              {failure.reason}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>
              ) : null}
            </section>
          )}
        </div>

        <div className="flex justify-end gap-2 border-t border-zinc-200 px-6 py-4">
          {!showResult ? (
            <>
              <button
                type="button"
                className="rounded-md border border-zinc-300 px-4 py-2 text-sm hover:bg-zinc-50 disabled:opacity-60"
                onClick={handleClose}
                disabled={applying}
              >
                取消
              </button>
              <button
                type="button"
                className="rounded-md bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:opacity-60"
                onClick={() => void handleConfirmImport()}
                disabled={!canConfirmImport}
              >
                {applying ? "正在导入..." : "确认导入"}
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                className="rounded-md border border-zinc-300 px-4 py-2 text-sm hover:bg-zinc-50"
                onClick={handleContinueImport}
              >
                继续导入
              </button>
              <button
                type="button"
                className="rounded-md bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
                onClick={handleFinish}
              >
                完成
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
