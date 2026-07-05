import { jsonFailure, jsonSuccess } from "@/server/api/route-utils";
import { openBackupDirectory } from "@/server/workspace/open-backup-directory";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  try {
    const backupDirectory = openBackupDirectory();
    return jsonSuccess({ backupDirectory });
  } catch (error) {
    return jsonFailure(
      "OPEN_DIRECTORY_FAILED",
      "打开备份目录失败",
      500,
      error instanceof Error ? error.message : error,
    );
  }
}
