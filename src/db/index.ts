import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import { mkdirSync, existsSync } from "fs";
import { dirname } from "path";
import * as schema from "./schema";

function createDb() {
  const dbPath = process.env.DB_PATH || "community-pulse.db";
  const dir = dirname(dbPath);
  if (dir !== "." && !existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
  const sqlite = new Database(dbPath);
  sqlite.pragma("journal_mode = WAL");

  // Auto-create tables if they don't exist
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS submissions (
      id TEXT PRIMARY KEY,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      responses TEXT NOT NULL,
      adaptive_data TEXT,
      consent_given INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS insight_snapshots (
      id TEXT PRIMARY KEY,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      insight_text TEXT NOT NULL,
      data_summary TEXT NOT NULL,
      submission_count INTEGER NOT NULL,
      model_used TEXT NOT NULL,
      generation_time_ms INTEGER
    );
  `);

  return drizzle(sqlite, { schema });
}

// Cache the DB instance on globalThis to survive Next.js hot reloads
// without leaking connections.
const globalForDb = globalThis as unknown as { __db?: ReturnType<typeof createDb> };
export const db = globalForDb.__db ?? (globalForDb.__db = createDb());
