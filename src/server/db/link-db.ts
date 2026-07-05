import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";

const DB_DIR = path.join(process.cwd(), "_workspace", "link-library");
const DB_PATH = path.join(DB_DIR, "link-library.db");

let dbInstance: Database.Database | null = null;

export function getLinkDatabasePath(): string {
  return DB_PATH;
}

export function getLinkDatabase(): Database.Database {
  if (dbInstance) {
    return dbInstance;
  }

  fs.mkdirSync(DB_DIR, { recursive: true });

  const db = new Database(DB_PATH);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");

  dbInstance = db;
  return db;
}

export function closeLinkDatabase(): void {
  if (dbInstance) {
    dbInstance.close();
    dbInstance = null;
  }
}
