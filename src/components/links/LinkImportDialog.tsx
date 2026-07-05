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
  ImportApplyResult,
  ImportFailuresTable,
  ImportPreviewTable,
  type PreviewItem,
} from "./ImportPreviewTable";

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
  const hasParsedItems =
    parseResult !== null && parseResult.summary.totalItems > 0;

  const canConfirmImport = useMemo(
    () => previewItems.length > 0 && !applying && applyResult === null,
    [previewItems.length, applying, applyResult],
  );

  if (!open) return null;

  function resetImportState() {
    setText("");
    setParseResult(null);
    setPreviewItems([]);
    setApplyResult(null);
    setInputError("");
    setParseError("");
    setApplyError("");
  }

  function handleClearText() {
    resetImportState();
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
    if (previewItems.length === 0 || applying || applyResult !== null) return;

    setApplying(true);
    setApplyError("");

    try {
      const result = await applyImportItems({
        items: toParsedItems(previewItems),
        defaults: importDefaultsToInput(defaults),
      });
      setApplyResult(result);
      onComplete(
        result.summary.created > 0
          ? "导入成功，若列表未显示，请检查当前筛选条件。"
          : undefined,
      );
    } catch (error) {
      setApplyError(`导入失败，请稍后重试。${getErrorMessage(error)}`);
    } finally {
      setApplying(false);
    }
  }

  function handleContinueImport() {
    resetImportState();
  }

  function handleClose() {
    if (applying) return;
    resetImportState();
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="flex max-h-[85vh] w-full max-w-[1160px] flex-col overflow-hidden rounded-lg bg-white shadow-xl">
        <div className="flex shrink-0 items-center justify-between border-b border-zinc-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-zinc-900">批量导入</h2>
          <button
            type="button"
            className="text-zinc-500 hover:text-zinc-800 disabled:opacity-50"
            onClick={handleClose}
            disabled={applying}
          >
            关闭
          </button>
        </div>

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-6 py-4">
          <section className="rounded-lg border border-zinc-200 bg-white p-4">
            <label className="mb-2 block text-sm font-medium text-zinc-800">
              粘贴百度 / 夸克分享文本
            </label>
            <textarea
              className="h-36 w-full resize-none overflow-y-auto rounded-md border border-zinc-300 px-3 py-2 text-sm text-zinc-900 outline-none focus:border-blue-500"
              placeholder="可以粘贴单条或多条百度网盘、夸克网盘分享文本。"
              value={text}
              disabled={parsing || applying}
              onChange={(event) => {
                setText(event.target.value);
                if (inputError) setInputError("");
              }}
            />
            <div className="mt-2 flex gap-2">
              <button
                type="button"
                className="rounded-md bg-blue-600 px-4 py-1.5 text-sm text-white hover:bg-blue-700 disabled:opacity-60"
                onClick={() => void handleParse()}
                disabled={parsing || applying}
              >
                {parsing ? "解析中..." : "解析文本"}
              </button>
              <button
                type="button"
                className="rounded-md border border-zinc-300 px-4 py-1.5 text-sm hover:bg-zinc-50 disabled:opacity-60"
                onClick={handleClearText}
                disabled={parsing || applying}
              >
                清空
              </button>
            </div>
            {inputError ? (
              <p className="mt-2 text-sm text-red-600">{inputError}</p>
            ) : null}
            {parseError ? (
              <p className="mt-2 text-sm text-red-600">{parseError}</p>
            ) : null}
          </section>

          {hasPreview ? (
            <section className="rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-2.5">
              {parseResult && parseResult.summary.totalItems > 0 ? (
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-zinc-700">
                  <span>共解析 {parseResult.summary.totalItems} 条</span>
                  <span>百度 {parseResult.summary.baiduCount} 条</span>
                  <span>夸克 {parseResult.summary.quarkCount} 条</span>
                  <span>失败 {parseResult.summary.failureCount} 条</span>
                  <span className="font-medium text-zinc-900">
                    当前待导入 {previewItems.length} 条
                  </span>
                </div>
              ) : (
                <p className="text-sm text-zinc-700">
                  没有识别到可导入的百度或夸克链接，请检查粘贴内容。
                </p>
              )}
            </section>
          ) : null}

          {hasParsedItems ? (
            <div className="grid min-h-0 grid-cols-1 gap-4 lg:grid-cols-[minmax(0,65%)_minmax(0,35%)]">
              <section className="flex min-h-0 flex-col rounded-lg border border-zinc-200 bg-white p-3">
                <h3 className="mb-2 shrink-0 text-sm font-semibold text-zinc-800">
                  预览列表
                </h3>
                <div className="min-h-0 max-h-64 overflow-auto">
                  <ImportPreviewTable
                    items={previewItems}
                    onRemove={handleRemovePreviewItem}
                    disabled={applying || applyResult !== null}
                  />
                </div>
              </section>

              <ImportDefaultsForm
                values={defaults}
                onChange={setDefaults}
                disabled={applying || applyResult !== null}
              />
            </div>
          ) : null}

          {parseResult && parseResult.failures.length > 0 ? (
            <ImportFailuresTable failures={parseResult.failures} />
          ) : null}

          {applyResult ? <ImportApplyResult result={applyResult} /> : null}

          {applyError ? (
            <p className="text-sm text-red-600">{applyError}</p>
          ) : null}
        </div>

        <div className="flex shrink-0 justify-end gap-2 border-t border-zinc-200 px-6 py-4">
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
            className="rounded-md border border-zinc-300 px-4 py-2 text-sm hover:bg-zinc-50 disabled:opacity-60"
            onClick={handleContinueImport}
            disabled={applying}
          >
            继续导入
          </button>
          <button
            type="button"
            className="rounded-md bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:opacity-60"
            onClick={() => void handleConfirmImport()}
            disabled={!canConfirmImport}
          >
            {applying ? "正在导入..." : "确认导入"}
          </button>
        </div>
      </div>
    </div>
  );
}
