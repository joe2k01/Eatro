import * as SQLite from "expo-sqlite";
import { runMigrations } from "./migrations";

const DB_NAME = "eatro.db";

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

async function configurePragmas(db: SQLite.SQLiteDatabase): Promise<void> {
  // Performance-oriented defaults for offline-first mobile workloads.
  await db.execAsync("PRAGMA journal_mode = WAL;");
  await db.execAsync("PRAGMA synchronous = NORMAL;");
  await db.execAsync("PRAGMA temp_store = MEMORY;");

  // Explicitly keep FK enforcement off (sync-friendly + avoids constraint costs).
  await db.execAsync("PRAGMA foreign_keys = OFF;");
}

export async function getDb(): Promise<SQLite.SQLiteDatabase> {
  if (!dbPromise) {
    dbPromise = (async () => {
      const db = await SQLite.openDatabaseAsync(DB_NAME);
      await configurePragmas(db);
      await runMigrations(db);
      return db;
    })();
  }
  return dbPromise;
}

export async function closeDb(): Promise<void> {
  if (!dbPromise) return;
  const db = await dbPromise;
  dbPromise = null;
  await db.closeAsync();
}
