import { getBackupDirectory } from "@/server/backup/backup-database";
import { getLinkDatabasePath } from "@/server/db/link-db";
import { getLinkLibraryWorkspaceDir } from "@/server/config/workspace-path";

export type WorkspaceInfo = {
  workspaceDirectory: string;
  databasePath: string;
  backupDirectory: string;
};

export function getWorkspaceInfo(): WorkspaceInfo {
  return {
    workspaceDirectory: getLinkLibraryWorkspaceDir(),
    databasePath: getLinkDatabasePath(),
    backupDirectory: getBackupDirectory(),
  };
}
