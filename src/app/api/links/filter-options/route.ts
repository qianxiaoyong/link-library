import { jsonSuccess } from "@/server/api/route-utils";
import { listResourceLinkFieldFilterOptions } from "@/server/filters/resource-link-filter-options";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return jsonSuccess(listResourceLinkFieldFilterOptions());
}
