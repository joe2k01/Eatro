import type * as SQLite from "expo-sqlite";
import { INDEXES_SQL, SCHEMA_V1_SQL } from "../schema";

export async function migrateV1(db: SQLite.SQLiteDatabase): Promise<void> {
  for (const stmt of SCHEMA_V1_SQL) {
    await db.execAsync(stmt);
  }
  for (const stmt of INDEXES_SQL) {
    await db.execAsync(stmt);
  }
}
