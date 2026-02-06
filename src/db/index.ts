import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import * as schema from "./schema";

function createDb() {
  const sqlite = new Database("community-pulse.db");
  sqlite.pragma("journal_mode = WAL");
  return drizzle(sqlite, { schema });
}

// Cache the DB instance on globalThis to survive Next.js hot reloads
// without leaking connections.
const globalForDb = globalThis as unknown as { __db?: ReturnType<typeof createDb> };
export const db = globalForDb.__db ?? (globalForDb.__db = createDb());
