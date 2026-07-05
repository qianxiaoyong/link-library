import { NextRequest } from "next/server";
import {
  handleRepositoryError,
  jsonFailure,
  jsonNotFound,
  jsonSuccess,
  jsonValidationError,
} from "@/server/api/route-utils";
import {
  deleteResourceLink,
  getResourceLinkById,
  updateResourceLink,
} from "@/server/repositories/resource-link-repository";
import { updateResourceLinkSchema } from "@/server/validation/resource-link-schemas";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  const item = getResourceLinkById(id);

  if (!item) {
    return jsonNotFound();
  }

  return jsonSuccess({ item });
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const { id } = await context.params;

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return jsonFailure("VALIDATION_ERROR", "请求体必须是合法 JSON", 400);
  }

  const parsed = updateResourceLinkSchema.safeParse(body);

  if (!parsed.success) {
    return jsonValidationError(parsed.error);
  }

  try {
    const item = updateResourceLink(id, parsed.data);

    if (!item) {
      return jsonNotFound();
    }

    return jsonSuccess({ item });
  } catch (error) {
    return handleRepositoryError(error);
  }
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  const deleted = deleteResourceLink(id);

  if (!deleted) {
    return jsonNotFound();
  }

  return jsonSuccess({ deleted: true });
}
