import { getBackupDirectory } from "@/server/backup/backup-database";
import { openDirectoryInFileManager } from "@/server/workspace/open-directory";

export function openBackupDirectory(): string {
  const backupDirectory = getBackupDirectory();
  openDirectoryInFileManager(backupDirectory);
  return backupDirectory;
}
