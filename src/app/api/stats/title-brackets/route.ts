import { NextRequest } from "next/server";
import {
  jsonSuccess,
  jsonValidationError,
} from "@/server/api/route-utils";
import { getTitleBracketStats } from "@/server/stats/title-bracket-stats-service";
import { titleBracketStatsQuerySchema } from "@/server/validation/title-bracket-stats-schemas";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const params = Object.fromEntries(request.nextUrl.searchParams.entries());
  const parsed = titleBracketStatsQuerySchema.safeParse(params);

  if (!parsed.success) {
    return jsonValidationError(parsed.error);
  }

  const result = getTitleBracketStats(parsed.data);
  return jsonSuccess(result);
}
