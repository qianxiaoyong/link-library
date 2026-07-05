import type { ApiEnvelope } from "@/shared/api/api-envelope";

export type WorkspaceInfo = {
  workspaceDirectory: string;
  databasePath: string;
  backupDirectory: string;
};

export class WorkspaceClientError extends Error {
  code: string;

  constructor(code: string, message: string) {
    super(message);
    this.name = "WorkspaceClientError";
    this.code = code;
  }
}

async function requestWorkspaceApi<T>(path: string): Promise<T> {
  const response = await fetch(path);
  const raw = await response.text();

  if (!raw.trim()) {
    throw new WorkspaceClientError(
      "INTERNAL_ERROR",
      `服务器返回空响应（HTTP ${response.status}）`,
    );
  }

  let envelope: ApiEnvelope<T>;
  try {
    envelope = JSON.parse(raw) as ApiEnvelope<T>;
  } catch {
    throw new WorkspaceClientError(
      "INTERNAL_ERROR",
      `服务器返回非 JSON 响应（HTTP ${response.status}）`,
    );
  }

  if (!envelope.ok) {
    throw new WorkspaceClientError(
      envelope.error.code,
      envelope.error.message,
    );
  }

  return envelope.data;
}

export async function fetchWorkspaceInfo(): Promise<WorkspaceInfo> {
  return requestWorkspaceApi<WorkspaceInfo>("/api/workspace");
}

export async function openBackupDirectory(): Promise<{ backupDirectory: string }> {
  const response = await fetch("/api/workspace/open-backup-dir", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });
  const raw = await response.text();

  if (!raw.trim()) {
    throw new WorkspaceClientError(
      "INTERNAL_ERROR",
      `服务器返回空响应（HTTP ${response.status}）`,
    );
  }

  let envelope: ApiEnvelope<{ backupDirectory: string }>;
  try {
    envelope = JSON.parse(raw) as ApiEnvelope<{ backupDirectory: string }>;
  } catch {
    throw new WorkspaceClientError(
      "INTERNAL_ERROR",
      `服务器返回非 JSON 响应（HTTP ${response.status}）`,
    );
  }

  if (!envelope.ok) {
    throw new WorkspaceClientError(
      envelope.error.code,
      envelope.error.message,
    );
  }

  return envelope.data;
}

export function getWorkspaceErrorMessage(error: unknown): string {
  if (error instanceof WorkspaceClientError) {
    if (error.code === "OPEN_DIRECTORY_FAILED") {
      return "打开备份目录失败";
    }
    return error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return "操作失败，请稍后重试";
}
