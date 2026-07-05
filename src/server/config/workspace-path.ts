import path from "node:path";

function isStandaloneBundleCwd(cwd: string): boolean {
  const normalized = cwd.replace(/\\/g, "/").toLowerCase();
  return (
    normalized.endsWith("/resources/standalone") ||
    normalized.endsWith("/standalone")
  );
}

export function getLinkLibraryWorkspaceDir(): string {
  const dataDir = process.env.LINK_LIBRARY_DATA_DIR?.trim();
  if (dataDir) {
    return path.resolve(dataDir);
  }

  const fallback = path.resolve(process.cwd(), "_workspace", "link-library");
  if (isStandaloneBundleCwd(process.cwd())) {
    console.warn(
      "[link-library] LINK_LIBRARY_DATA_DIR 未设置，打包环境不应在 standalone 目录内写入 _workspace。",
    );
  }
  return fallback;
}
