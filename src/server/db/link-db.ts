import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";
import { initLinkDatabase } from "@/server/db/init-link-db";
import { getLinkLibraryWorkspaceDir } from "@/server/config/workspace-path";

let dbInstance: Database.Database | null = null;

function getDbDir(): string {
  return getLinkLibraryWorkspaceDir();
}

function getDbPath(): string {
  return path.join(getDbDir(), "link-library.db");
}

export function getLinkDatabasePath(): string {
  return getDbPath();
}

export function getLinkDatabase(): Database.Database {
  if (dbInstance) {
    initLinkDatabase(dbInstance);
    return dbInstance;
  }

  const dbDir = getDbDir();
  fs.mkdirSync(dbDir, { recursive: true });

  const db = new Database(getDbPath());
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");
  initLinkDatabase(db);

  dbInstance = db;
  return db;
}

export function closeLinkDatabase(): void {
  if (dbInstance) {
    dbInstance.close();
    dbInstance = null;
  }
}
