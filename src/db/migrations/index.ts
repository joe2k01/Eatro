import type * as SQLite from "expo-sqlite";
import type { Migration } from "./types";
import { migrateV1 } from "./v1";
import { migrateV2 } from "./v2";
import { migrateV3 } from "./v3";

export const MIGRATIONS: Migration[] = [
  { version: 1, name: "initial_schema_and_indexes", up: migrateV1 },
  { version: 2, name: "add_foods_name_index", up: migrateV2 },
  { version: 3, name: "convert_text_ids_to_integer_pks", up: migrateV3 },
];

export function latestSchemaVersion(): number {
  return MIGRATIONS.reduce((acc, m) => Math.max(acc, m.version), 0);
}

export async function getUserVersion(
  db: SQLite.SQLiteDatabase,
): Promise<number> {
  const row = await db.getFirstAsync<{ user_version: number }>(
    "PRAGMA user_version;",
  );
  return row?.user_version ?? 0;
}

export async function setUserVersion(
  db: SQLite.SQLiteDatabase,
  version: number,
): Promise<void> {
  await db.execAsync(`PRAGMA user_version = ${version};`);
}

export async function runMigrations(db: SQLite.SQLiteDatabase): Promise<void> {
  const current = await getUserVersion(db);
  const pending = MIGRATIONS.filter((m) => m.version > current).sort(
    (a, b) => a.version - b.version,
  );

  for (const m of pending) {
    await db.withTransactionAsync(async () => {
      await m.up(db);
      await setUserVersion(db, m.version);
    });
  }
}
