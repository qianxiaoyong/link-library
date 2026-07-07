"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export type LibraryView = "links" | "stats";

const baseButtonClassName =
  "whitespace-nowrap rounded px-2.5 py-1.5 text-xs font-medium transition-colors";

function getNormalClassName(): string {
  return `${baseButtonClassName} border border-zinc-300 bg-white text-zinc-800 hover:bg-zinc-50`;
}

function getActiveClassName(): string {
  return `${baseButtonClassName} bg-blue-600 text-white hover:bg-blue-700`;
}

export function LibraryViewToggle() {
  const pathname = usePathname();
  const isMatrixPage = pathname === "/stats/matrix";
  const isStatsSection =
    pathname === "/stats" || pathname.startsWith("/stats/");

  if (isMatrixPage) {
    return (
      <Link
        href="/links"
        className={getNormalClassName()}
        title="返回资料库"
      >
        资料库
      </Link>
    );
  }

  return (
    <Link
      href="/stats/matrix"
      className={getActiveClassName()}
      aria-current={isStatsSection ? "page" : undefined}
      title="打开覆盖矩阵统计表"
    >
      统计表
    </Link>
  );
}
