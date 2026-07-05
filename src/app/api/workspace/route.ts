import { jsonSuccess } from "@/server/api/route-utils";
import { getWorkspaceInfo } from "@/server/workspace/get-workspace-info";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return jsonSuccess(getWorkspaceInfo());
}
