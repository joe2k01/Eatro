/**
 * Jest mock for `expo-sqlite`, backed by `better-sqlite3`.
 *
 * Why this exists:
 * `expo-sqlite-mock` (the standard community mock) calls `.bind()` on
 * `better-sqlite3` prepared statements, which can only be invoked once per
 * statement object. Our repositories cache and reuse prepared statements via
 * `BaseRepository.prepareStatement()`, causing every second call to the same
 * method to throw `TypeError: The bind() method can only be invoked once per
 * statement object`.
 *
 * This mock avoids `.bind()` entirely and passes parameters directly to
 * `.all(params)` and `.run(params)`, both of which support repeated invocation
 * on the same statement object — which is the behaviour we need.
 *
 * Registered via `moduleNameMapper` in `jest.config.js`.
 */

import Database from "better-sqlite3";

/**
 * Strips the `$`, `:`, or `@` prefix from named parameter keys before passing
 * them to `better-sqlite3`. Our repositories use `$name` style params (e.g.
 * `{ $barcode: "123" }`), while `better-sqlite3` expects the key without the
 * sigil when using its named-param object API.
 */
function normalizeParams(
  params: Record<string, unknown>,
): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(params)) {
    result[key.replace(/^[:@$]/, "")] = value;
  }
  return result;
}

/**
 * Wraps the rows returned by a statement execution and exposes the subset of
 * the `SQLiteExecuteAsyncResult` interface used by our repositories.
 */
class MockExecuteResult {
  constructor(
    private readonly rows: Record<string, unknown>[],
    public readonly changes: number,
    public readonly lastInsertRowId: number,
  ) {}

  async getAllAsync<T>(): Promise<T[]> {
    return this.rows as T[];
  }

  async getFirstAsync<T>(): Promise<T | null> {
    return (this.rows[0] ?? null) as T | null;
  }

  /** No-op — included for interface compatibility with `SQLiteExecuteAsyncResult`. */
  async resetAsync(): Promise<void> {}
}

/**
 * Wraps a `better-sqlite3` prepared statement and exposes the subset of the
 * `SQLiteStatement` interface used by our repositories.
 */
class MockSQLiteStatement {
  constructor(private readonly stmt: Database.Statement) {}

  /**
   * Executes the prepared statement with the given named parameters.
   *
   * Branching strategy:
   * - `SELECT` — uses `.all()` so rows are returned; `changes` is 0 (reads
   *   never affect `changes()` in SQLite).
   * - DML with `RETURNING` — uses `.all()` to capture the returned rows;
   *   `changes` equals the row count because SQLite's RETURNING clause emits
   *   exactly one row per affected row.
   * - Plain DML — uses `.run()` which returns accurate `changes` and
   *   `lastInsertRowid` metadata; no rows are produced.
   *
   * Positional array params are not supported — all repositories use named
   * params exclusively.
   */
  async executeAsync(
    params: Record<string, unknown> | unknown[],
  ): Promise<MockExecuteResult> {
    if (Array.isArray(params)) {
      throw new Error(
        "MockSQLiteStatement: positional params are not supported",
      );
    }

    const normalized = normalizeParams(params);

    if (this.stmt.source.trimStart().toLowerCase().startsWith("select")) {
      const rows = this.stmt.all(normalized) as Record<string, unknown>[];
      return new MockExecuteResult(rows, 0, 0);
    }

    if (/\breturning\b/.test(this.stmt.source.toLowerCase())) {
      const rows = this.stmt.all(normalized) as Record<string, unknown>[];
      return new MockExecuteResult(rows, rows.length, 0);
    }

    const info = this.stmt.run(normalized);
    return new MockExecuteResult(
      [],
      info.changes,
      Number(info.lastInsertRowid),
    );
  }

  /** No-op — `better-sqlite3` statements are garbage-collected automatically. */
  async finalizeAsync(): Promise<void> {}
}

/**
 * Wraps a `better-sqlite3` in-memory database and exposes the subset of the
 * `SQLiteDatabase` interface used by our repositories.
 */
class MockSQLiteDatabase {
  private readonly db: Database.Database;

  constructor() {
    this.db = new Database(":memory:");
  }

  /** Executes one or more SQL statements with no parameter binding (DDL / migrations). */
  async execAsync(sql: string): Promise<void> {
    this.db.exec(sql);
  }

  /** Prepares a statement and returns it wrapped in `MockSQLiteStatement`. */
  async prepareAsync(sql: string): Promise<MockSQLiteStatement> {
    return new MockSQLiteStatement(this.db.prepare(sql));
  }

  /** One-shot query — prepares, executes, and returns all rows. */
  async getAllAsync<T>(
    sql: string,
    params?: Record<string, unknown>,
  ): Promise<T[]> {
    const normalized = params ? normalizeParams(params) : {};
    return this.db.prepare(sql).all(normalized) as T[];
  }

  async closeAsync(): Promise<void> {
    this.db.close();
  }

  /**
   * Wraps an async callback in a SQLite transaction.
   *
   * `better-sqlite3`'s native `.transaction()` helper is synchronous and
   * cannot wrap an `async` callback, so we manage `BEGIN` / `COMMIT` /
   * `ROLLBACK` manually. This is safe because all `better-sqlite3` operations
   * are synchronous under the hood — the async wrappers here are thin
   * `Promise` facades, so the callback always resolves before any other
   * statement can interleave.
   */
  async withTransactionAsync(callback: () => Promise<void>): Promise<void> {
    this.db.exec("BEGIN");
    try {
      await callback();
      this.db.exec("COMMIT");
    } catch (e) {
      this.db.exec("ROLLBACK");
      throw e;
    }
  }
}

export type SQLiteDatabase = MockSQLiteDatabase;

/**
 * Returns a fresh in-memory database for each call. The `name` parameter is
 * accepted for interface compatibility but ignored — isolation between tests is
 * achieved by the `beforeEach` / `afterEach` lifecycle in each test suite.
 */
export async function openDatabaseAsync(
  _name: string,
): Promise<MockSQLiteDatabase> {
  return new MockSQLiteDatabase();
}
