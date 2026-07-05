import { jsonFailure, jsonSuccess } from "@/server/api/route-utils";
import { backupLinkDatabase } from "@/server/backup/backup-database";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  try {
    const result = backupLinkDatabase();

    return jsonSuccess({
      backupPath: result.relativePath,
      fileName: result.fileName,
      createdAt: result.createdAt,
    });
  } catch (error) {
    return jsonFailure(
      "BACKUP_FAILED",
      "数据库备份失败",
      500,
      error instanceof Error ? error.message : error,
    );
  }
}
