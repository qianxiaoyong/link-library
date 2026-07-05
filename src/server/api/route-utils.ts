import { NextResponse } from "next/server";
import { apiFailure, apiSuccess } from "@/shared/api/api-envelope";
import { DuplicateLinkError } from "@/server/repositories/resource-link-repository";
import { ZodError } from "zod";

export function jsonSuccess<T>(data: T, status = 200): NextResponse {
  return NextResponse.json(apiSuccess(data), { status });
}

export function jsonFailure(
  code: string,
  message: string,
  status = 400,
  details?: unknown,
): NextResponse {
  return NextResponse.json(apiFailure(code, message, details), { status });
}

export function jsonValidationError(error: ZodError): NextResponse {
  return jsonFailure("VALIDATION_ERROR", "输入数据不合法", 400, error.flatten());
}

export function jsonDuplicateLink(): NextResponse {
  return jsonFailure("DUPLICATE_LINK", "该链接已存在", 409);
}

export function jsonNotFound(message = "资料链接不存在"): NextResponse {
  return jsonFailure("NOT_FOUND", message, 404);
}

export function handleRepositoryError(error: unknown): NextResponse {
  if (error instanceof DuplicateLinkError) {
    return jsonDuplicateLink();
  }

  throw error;
}
