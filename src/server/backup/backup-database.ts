import fs from "node:fs";
import path from "node:path";
import { getLinkLibraryWorkspaceDir } from "@/server/config/workspace-path";
import { getLinkDatabase, getLinkDatabasePath } from "@/server/db/link-db";

function formatTimestamp(date = new Date()): string {
  const pad = (value: number) => String(value).padStart(2, "0");
  return (
    `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}-` +
    `${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}`
  );
}

export function getBackupDirectory(): string {
  return path.join(getLinkLibraryWorkspaceDir(), "backups");
}

export function getBackupRelativePath(fileName: string): string {
  return path.posix.join("_workspace/link-library/backups", fileName);
}

export type BackupDatabaseResult = {
  backupPath: string;
  relativePath: string;
  fileName: string;
  createdAt: string;
};

export function backupLinkDatabase(): BackupDatabaseResult {
  const db = getLinkDatabase();
  db.pragma("wal_checkpoint(FULL)");

  const createdAt = new Date().toISOString();
  const fileName = `link-library-backup-${formatTimestamp(new Date(createdAt))}.db`;
  const backupDir = getBackupDirectory();

  fs.mkdirSync(backupDir, { recursive: true });

  const backupPath = path.join(backupDir, fileName);
  fs.copyFileSync(getLinkDatabasePath(), backupPath);

  return {
    backupPath,
    relativePath: getBackupRelativePath(fileName),
    fileName,
    createdAt,
  };
}
