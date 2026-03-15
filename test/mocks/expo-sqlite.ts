import Database from "better-sqlite3";

// Normalise $ / : / @ prefixed params to unprefixed for better-sqlite3.
// better-sqlite3 supports $name natively, but we strip the prefix to be safe
// and consistent with the SQL syntax used in our repositories.
function normalizeParams(
  params: Record<string, unknown>,
): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(params)) {
    result[key.replace(/^[:@$]/, "")] = value;
  }
  return result;
}

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

  async resetAsync(): Promise<void> {}
}

class MockSQLiteStatement {
  constructor(private readonly stmt: Database.Statement) {}

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

  async finalizeAsync(): Promise<void> {
    // better-sqlite3 statements are GC'd automatically — no-op.
  }
}

class MockSQLiteDatabase {
  private readonly db: Database.Database;

  constructor() {
    this.db = new Database(":memory:");
  }

  async execAsync(sql: string): Promise<void> {
    this.db.exec(sql);
  }

  async prepareAsync(sql: string): Promise<MockSQLiteStatement> {
    return new MockSQLiteStatement(this.db.prepare(sql));
  }

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

export async function openDatabaseAsync(
  _name: string,
): Promise<MockSQLiteDatabase> {
  return new MockSQLiteDatabase();
}
