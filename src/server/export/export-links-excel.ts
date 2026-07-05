import ExcelJS from "exceljs";
import {
  LINK_PLATFORM_LABELS,
  LINK_STATUS_LABELS,
  RESOURCE_CATEGORY_LABELS,
} from "@/shared/constants/link-taxonomy";
import type { ResourceLink } from "@/shared/types/resource-link";

const EXCEL_HEADERS = [
  "序号",
  "标题",
  "平台",
  "资料分类",
  "原始链接",
  "标准链接",
  "提取码",
  "备注",
  "学段",
  "年级",
  "学期",
  "科目",
  "资料年份",
  "教材版本",
  "状态",
  "是否收藏",
  "原始输入片段",
  "创建时间",
  "更新时间",
] as const;

function formatTimestamp(date = new Date()): string {
  const pad = (value: number) => String(value).padStart(2, "0");
  return (
    `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}-` +
    `${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}`
  );
}

function cell(value: string | null | undefined): string {
  if (value === null || value === undefined) return "";
  return value;
}

function toPlatformLabel(platform: ResourceLink["platform"]): string {
  return LINK_PLATFORM_LABELS[platform];
}

function toCategoryLabel(
  category: ResourceLink["resourceCategory"],
): string {
  if (!category) return "空";
  return RESOURCE_CATEGORY_LABELS[category];
}

function toStatusLabel(status: ResourceLink["status"]): string {
  return LINK_STATUS_LABELS[status];
}

function toFavoriteLabel(favorite: boolean): string {
  return favorite ? "是" : "否";
}

function toRowValues(item: ResourceLink, index: number): string[] {
  return [
    String(index + 1),
    cell(item.title),
    toPlatformLabel(item.platform),
    toCategoryLabel(item.resourceCategory),
    cell(item.rawUrl),
    cell(item.url),
    cell(item.accessCode),
    cell(item.description),
    cell(item.schoolStage),
    cell(item.grade),
    cell(item.semester),
    cell(item.subject),
    cell(item.resourceYear),
    cell(item.textbookEdition),
    toStatusLabel(item.status),
    toFavoriteLabel(item.favorite),
    cell(item.sourceText),
    cell(item.createdAt),
    cell(item.updatedAt),
  ];
}

export function buildExportExcelFileName(
  scope: "filtered" | "all",
  date = new Date(),
): string {
  const timestamp = formatTimestamp(date);
  if (scope === "all") {
    return `学习资料链接库-全部资料-${timestamp}.xlsx`;
  }
  return `学习资料链接库-筛选结果-${timestamp}.xlsx`;
}

export async function buildLinksExcelBuffer(
  items: ResourceLink[],
  scope: "filtered" | "all",
): Promise<{ buffer: Buffer; fileName: string }> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "学习资料链接库";
  workbook.created = new Date();

  const sheet = workbook.addWorksheet("资料链接");
  sheet.addRow([...EXCEL_HEADERS]);

  const headerRow = sheet.getRow(1);
  headerRow.font = { bold: true };

  for (let index = 0; index < items.length; index += 1) {
    sheet.addRow(toRowValues(items[index], index));
  }

  sheet.columns = EXCEL_HEADERS.map((header) => ({
    header,
    width: header.includes("链接") || header.includes("片段") ? 40 : 16,
  }));

  const buffer = Buffer.from(await workbook.xlsx.writeBuffer());
  const fileName = buildExportExcelFileName(scope);

  return { buffer, fileName };
}

export { EXCEL_HEADERS };
