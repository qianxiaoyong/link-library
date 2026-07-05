import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";
import { initLinkDatabase } from "@/server/db/init-link-db";
import { getLinkLibraryWorkspaceDir } from "@/server/config/workspace-path";

const DB_DIR = getLinkLibraryWorkspaceDir();
const DB_PATH = path.join(DB_DIR, "link-library.db");

let dbInstance: Database.Database | null = null;

export function getLinkDatabasePath(): string {
  return DB_PATH;
}

export function getLinkDatabase(): Database.Database {
  if (dbInstance) {
    initLinkDatabase(dbInstance);
    return dbInstance;
  }

  fs.mkdirSync(DB_DIR, { recursive: true });

  const db = new Database(DB_PATH);
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
