import path from "node:path";

export function getLinkLibraryWorkspaceDir(): string {
  const dataDir = process.env.LINK_LIBRARY_DATA_DIR?.trim();
  if (dataDir) {
    return dataDir;
  }

  return path.join(process.cwd(), "_workspace", "link-library");
}
