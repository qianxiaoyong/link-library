"use client";

import { useEffect, useState } from "react";
import { fetchWorkspaceInfo } from "@/shared/api/workspace-client";
import type { LibraryView } from "./LibraryViewToggle";

type LibraryWorkspaceSubtitleProps = {
  activeView: LibraryView;
  subtitleOverride?: string;
};

const STATS_SUBTITLE = "按标题《》内容汇总各年级分布（仅统计正常资料）";

export function LibraryWorkspaceSubtitle({
  activeView,
  subtitleOverride,
}: LibraryWorkspaceSubtitleProps) {
  const [databasePath, setDatabasePath] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    void fetchWorkspaceInfo()
      .then((result) => {
        if (active) {
          setDatabasePath(result.databasePath);
        }
      })
      .catch(() => {
        if (active) {
          setDatabasePath(null);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  if (activeView === "stats") {
    return (
      <p className="truncate text-xs text-zinc-600">
        {subtitleOverride ?? STATS_SUBTITLE}
      </p>
    );
  }

  const subtitle = databasePath
    ? `当前数据库：${databasePath}`
    : "正在读取数据库路径...";

  return (
    <p
      className="truncate font-mono text-xs text-zinc-600"
      title={databasePath ?? undefined}
    >
      {subtitle}
    </p>
  );
}
