import type Database from "better-sqlite3";

const CREATE_APP_META_TABLE = `
CREATE TABLE IF NOT EXISTS app_meta (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
`;

const CREATE_RESOURCE_LINKS_TABLE = `
CREATE TABLE IF NOT EXISTS resource_links (
  id TEXT PRIMARY KEY,

  platform TEXT NOT NULL CHECK (platform IN ('baidu', 'quark')),
  title TEXT NOT NULL,

  raw_url TEXT NOT NULL,
  url TEXT NOT NULL,
  access_code TEXT,

  resource_category TEXT CHECK (
    resource_category IS NULL
    OR resource_category IN ('practice', 'paper', 'special')
  ),

  description TEXT,

  school_stage TEXT,
  grade TEXT,
  semester TEXT,
  subject TEXT,
  resource_year TEXT,
  textbook_edition TEXT,

  status TEXT NOT NULL DEFAULT 'normal' CHECK (status IN ('normal', 'invalid')),
  favorite INTEGER NOT NULL DEFAULT 0 CHECK (favorite IN (0, 1)),

  source_text TEXT,

  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
`;

const CREATE_UNIQUE_INDEX = `
CREATE UNIQUE INDEX IF NOT EXISTS idx_resource_links_platform_url
ON resource_links(platform, url);
`;

const CREATE_SEARCH_INDEXES = [
  `CREATE INDEX IF NOT EXISTS idx_resource_links_status ON resource_links(status);`,
  `CREATE INDEX IF NOT EXISTS idx_resource_links_favorite ON resource_links(favorite);`,
  `CREATE INDEX IF NOT EXISTS idx_resource_links_platform ON resource_links(platform);`,
  `CREATE INDEX IF NOT EXISTS idx_resource_links_resource_category ON resource_links(resource_category);`,
  `CREATE INDEX IF NOT EXISTS idx_resource_links_resource_year ON resource_links(resource_year);`,
  `CREATE INDEX IF NOT EXISTS idx_resource_links_subject ON resource_links(subject);`,
  `CREATE INDEX IF NOT EXISTS idx_resource_links_textbook_edition ON resource_links(textbook_edition);`,
  `CREATE INDEX IF NOT EXISTS idx_resource_links_created_at ON resource_links(created_at);`,
];

const CREATE_UPDATED_AT_TRIGGER = `
CREATE TRIGGER IF NOT EXISTS trg_resource_links_updated_at
AFTER UPDATE ON resource_links
FOR EACH ROW
BEGIN
  UPDATE resource_links
  SET updated_at = CURRENT_TIMESTAMP
  WHERE id = OLD.id;
END;
`;

const CREATE_COVERAGE_MATRIX_CELL_NOTES_TABLE = `
CREATE TABLE IF NOT EXISTS coverage_matrix_cell_notes (
  book_title TEXT NOT NULL,
  resource_category TEXT NOT NULL DEFAULT '',
  subject TEXT NOT NULL,
  textbook_edition TEXT NOT NULL,
  note TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (book_title, resource_category, subject, textbook_edition)
);
`;

function migrateSchema(db: Database.Database): void {
  const columns = db
    .prepare(`PRAGMA table_info(resource_links)`)
    .all() as Array<{ name: string }>;

  if (!columns.some((column) => column.name === "textbook_edition")) {
    db.exec(`ALTER TABLE resource_links ADD COLUMN textbook_edition TEXT`);
    db.exec(
      `CREATE INDEX IF NOT EXISTS idx_resource_links_textbook_edition ON resource_links(textbook_edition)`,
    );
  }
}

function seedAppMeta(db: Database.Database): void {
  const upsertMeta = db.prepare(`
    INSERT INTO app_meta (key, value, updated_at)
    VALUES (@key, @value, CURRENT_TIMESTAMP)
    ON CONFLICT(key) DO UPDATE SET
      value = excluded.value,
      updated_at = CURRENT_TIMESTAMP
  `);

  upsertMeta.run({ key: "schema_version", value: "3" });
  upsertMeta.run({ key: "app_name", value: "学习资料链接库" });
}

export function initLinkDatabase(db: Database.Database): void {
  db.exec(CREATE_APP_META_TABLE);
  db.exec(CREATE_RESOURCE_LINKS_TABLE);
  db.exec(CREATE_UNIQUE_INDEX);
  migrateSchema(db);

  for (const statement of CREATE_SEARCH_INDEXES) {
    db.exec(statement);
  }

  db.exec(CREATE_UPDATED_AT_TRIGGER);
  db.exec(CREATE_COVERAGE_MATRIX_CELL_NOTES_TABLE);
  seedAppMeta(db);
}
