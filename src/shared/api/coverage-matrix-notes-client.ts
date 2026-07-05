import type { ApiEnvelope } from "@/shared/api/api-envelope";
import type { MatrixCellNoteIdentity } from "@/shared/stats/coverage-matrix/cell-note-key";
import { getCoverageMatrixErrorMessage } from "@/shared/api/coverage-matrix-client";

export class CoverageMatrixNotesClientError extends Error {
  code: string;
  details?: unknown;

  constructor(code: string, message: string, details?: unknown) {
    super(message);
    this.name = "CoverageMatrixNotesClientError";
    this.code = code;
    this.details = details;
  }
}

export type CoverageMatrixNotesResponse = {
  notes: Record<string, string>;
};

export type UpsertCoverageMatrixNoteResponse = {
  key: string;
  note: string;
  deleted: boolean;
};

async function requestCoverageMatrixNotesApi<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const response = await fetch(path, init);
  const raw = await response.text();

  if (!raw.trim()) {
    throw new CoverageMatrixNotesClientError(
      "INTERNAL_ERROR",
      `服务器返回空响应（HTTP ${response.status}）`,
    );
  }

  let envelope: ApiEnvelope<T>;
  try {
    envelope = JSON.parse(raw) as ApiEnvelope<T>;
  } catch {
    throw new CoverageMatrixNotesClientError(
      "INTERNAL_ERROR",
      `服务器返回非 JSON 响应（HTTP ${response.status}）`,
    );
  }

  if (!envelope.ok) {
    throw new CoverageMatrixNotesClientError(
      envelope.error.code,
      envelope.error.message,
      envelope.error.details,
    );
  }

  return envelope.data;
}

export function getCoverageMatrixNotesErrorMessage(error: unknown): string {
  if (error instanceof CoverageMatrixNotesClientError) {
    return error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return "备注请求失败，请稍后重试";
}

export async function fetchCoverageMatrixNotes(): Promise<CoverageMatrixNotesResponse> {
  return requestCoverageMatrixNotesApi<CoverageMatrixNotesResponse>(
    "/api/stats/coverage-matrix/notes",
  );
}

export async function upsertCoverageMatrixNote(
  identity: MatrixCellNoteIdentity,
  note: string,
): Promise<UpsertCoverageMatrixNoteResponse> {
  return requestCoverageMatrixNotesApi<UpsertCoverageMatrixNoteResponse>(
    "/api/stats/coverage-matrix/notes",
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...identity,
        note,
      }),
    },
  );
}

export { getCoverageMatrixErrorMessage };
