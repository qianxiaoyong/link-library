import Link from "next/link";
import type { TitleBracketStatsItem } from "@/shared/api/stats-client";
import type { StatsDrillDownFilters } from "@/shared/library/deep-link-filters";
import { buildStatsBookTitleDeepLink } from "@/shared/library/deep-link-filters";

type StatsTableProps = {
  items: TitleBracketStatsItem[];
  loading: boolean;
  drillDownFilters: StatsDrillDownFilters;
};

const CELL_CLASS = "border-b border-zinc-200 px-2 py-2 text-sm";

export function StatsTable({
  items,
  loading,
  drillDownFilters,
}: StatsTableProps) {
  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center rounded-lg border border-zinc-200 bg-white text-sm text-zinc-500">
        加载中...
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center rounded-lg border border-zinc-200 bg-white text-sm text-zinc-500">
        暂无统计数据
      </div>
    );
  }

  return (
    <div className="min-h-0 flex-1 overflow-auto rounded-lg border border-zinc-200 bg-white">
      <table className="w-full min-w-[640px] border-collapse text-left">
        <thead className="sticky top-0 z-10 bg-zinc-50">
          <tr>
            <th className={`${CELL_CLASS} w-[28%] font-medium text-zinc-700`}>
              书名号内容
            </th>
            <th className={`${CELL_CLASS} font-medium text-zinc-700`}>
              涉及年级
            </th>
            <th className={`${CELL_CLASS} w-[88px] font-medium text-zinc-700`}>
              资料条数
            </th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.bookTitle} className="hover:bg-zinc-50">
              <td className={CELL_CLASS}>
                <Link
                  href={buildStatsBookTitleDeepLink(
                    drillDownFilters,
                    item.bookTitle,
                  )}
                  className="font-medium text-blue-600 hover:text-blue-800 hover:underline"
                  title={`查看「${item.bookTitle}」相关资料`}
                >
                  {item.bookTitle}
                </Link>
              </td>
              <td
                className={`${CELL_CLASS} text-zinc-700`}
                title={item.gradeSummary}
              >
                {item.gradeSummary}
              </td>
              <td className={`${CELL_CLASS} text-zinc-700`}>{item.count}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
