import type * as SQLite from "expo-sqlite";

// Example production-safe migration (v1 -> v2): add an additional index to speed name searches.
// This does NOT change any required table schema.
export async function migrateV2(db: SQLite.SQLiteDatabase): Promise<void> {
  await db.execAsync(
    `
CREATE INDEX IF NOT EXISTS idx_foods_name_active
ON foods(name COLLATE NOCASE)
WHERE deleted_at IS NULL;
    `.trim(),
  );
}
