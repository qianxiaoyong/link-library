import type { ReactNode } from "react";
import {
  LibraryViewToggle,
  type LibraryView,
} from "./LibraryViewToggle";
import { LibraryWorkspaceSubtitle } from "./LibraryWorkspaceSubtitle";

type LibraryShellProps = {
  activeView: LibraryView;
  subtitleOverride?: string;
  actions?: ReactNode;
  children: ReactNode;
};

export function LibraryShell({
  activeView,
  subtitleOverride,
  actions,
  children,
}: LibraryShellProps) {
  return (
    <div className="flex h-screen flex-col overflow-hidden bg-zinc-100">
      <header className="shrink-0 border-b border-zinc-200 bg-white">
        <div className="flex h-14 items-center justify-between gap-4 px-4">
          <div className="min-w-0 shrink">
            <h1 className="truncate text-lg font-semibold text-zinc-900">
              网盘链接库
            </h1>
            <LibraryWorkspaceSubtitle
              activeView={activeView}
              subtitleOverride={subtitleOverride}
            />
          </div>
          <div className="flex shrink-0 flex-nowrap items-center gap-1.5 overflow-x-auto">
            <LibraryViewToggle />
            {actions}
          </div>
        </div>
      </header>
      {children}
    </div>
  );
}
