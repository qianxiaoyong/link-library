import { NextRequest } from "next/server";
import {
  handleRepositoryError,
  jsonFailure,
  jsonSuccess,
  jsonValidationError,
} from "@/server/api/route-utils";
import { toCreateResourceLinkInput } from "@/server/mappers/create-input-mapper";
import {
  createResourceLink,
  listResourceLinks,
} from "@/server/repositories/resource-link-repository";
import {
  createResourceLinkSchema,
  listResourceLinksQuerySchema,
} from "@/server/validation/resource-link-schemas";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const params = Object.fromEntries(request.nextUrl.searchParams.entries());
  const parsed = listResourceLinksQuerySchema.safeParse(params);

  if (!parsed.success) {
    return jsonValidationError(parsed.error);
  }

  const { limit, offset, status, ...filters } = parsed.data;
  const result = listResourceLinks({
    ...filters,
    status,
    limit,
    offset,
  });

  return jsonSuccess({
    items: result.items,
    total: result.total,
    limit,
    offset,
  });
}

export async function POST(request: NextRequest) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return jsonFailure("VALIDATION_ERROR", "请求体必须是合法 JSON", 400);
  }

  const parsed = createResourceLinkSchema.safeParse(body);

  if (!parsed.success) {
    return jsonValidationError(parsed.error);
  }

  try {
    const item = createResourceLink(toCreateResourceLinkInput(parsed.data));
    return jsonSuccess({ item }, 201);
  } catch (error) {
    return handleRepositoryError(error);
  }
}
