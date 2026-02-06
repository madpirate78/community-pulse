import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const submissions = sqliteTable("submissions", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  createdAt: text("created_at")
    .default(sql`(datetime('now'))`)
    .notNull(),
  responses: text("responses", { mode: "json" })
    .notNull()
    .$type<{
      biggest_pressure: string;
      change_direction: number;
      sacrifice: string;
    }>(),
  adaptiveData: text("adaptive_data", { mode: "json" }).$type<
    Record<string, unknown>[] | null
  >(),
  consentGiven: integer("consent_given", { mode: "boolean" }).notNull(),
});

export const insightSnapshots = sqliteTable("insight_snapshots", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  createdAt: text("created_at")
    .default(sql`(datetime('now'))`)
    .notNull(),
  insightText: text("insight_text").notNull(),
  dataSummary: text("data_summary", { mode: "json" })
    .notNull()
    .$type<Record<string, unknown>>(),
  submissionCount: integer("submission_count").notNull(),
  modelUsed: text("model_used").notNull(),
  generationTimeMs: integer("generation_time_ms"),
});
