import type { ReactNode } from "react";
import {
  LibraryViewToggle,
  type LibraryView,
} from "./LibraryViewToggle";
import { LibraryWorkspaceSubtitle } from "./LibraryWorkspaceSubtitle";

type LibraryShellProps = {
  activeView: LibraryView;
  actions?: ReactNode;
  children: ReactNode;
};

export function LibraryShell({
  activeView,
  actions,
  children,
}: LibraryShellProps) {
  return (
    <div className="flex h-screen flex-col overflow-hidden bg-zinc-100">
      <header className="shrink-0 border-b border-zinc-200 bg-white">
        <div className="flex h-14 items-center justify-between gap-4 px-4">
          <div className="min-w-0 shrink">
            <h1 className="truncate text-lg font-semibold text-zinc-900">
              学习资料链接库
            </h1>
            <LibraryWorkspaceSubtitle activeView={activeView} />
          </div>
          <div className="flex shrink-0 flex-nowrap items-center gap-1.5 overflow-x-auto">
            <LibraryViewToggle activeView={activeView} />
            {actions}
          </div>
        </div>
      </header>
      {children}
    </div>
  );
}
