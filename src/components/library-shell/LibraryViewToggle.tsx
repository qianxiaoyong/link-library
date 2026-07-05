"use client";

import Link from "next/link";

export type LibraryView = "links" | "stats";

type LibraryViewToggleProps = {
  activeView: LibraryView;
};

const baseButtonClassName =
  "whitespace-nowrap rounded px-2.5 py-1.5 text-xs font-medium transition-colors";

export function LibraryViewToggle({ activeView }: LibraryViewToggleProps) {
  const isStatsView = activeView === "stats";
  const href = isStatsView ? "/links" : "/stats";
  const className = isStatsView
    ? `${baseButtonClassName} bg-blue-600 text-white hover:bg-blue-700`
    : `${baseButtonClassName} border border-zinc-300 bg-white text-zinc-800 hover:bg-zinc-50`;

  return (
    <Link
      href={href}
      className={className}
      aria-current={isStatsView ? "page" : undefined}
      title={isStatsView ? "返回资料库" : "打开统计表"}
    >
      统计表
    </Link>
  );
}
