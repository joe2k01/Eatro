import {
  type SQLiteDatabase,
  type SQLiteStatement,
  type SQLiteBindParams,
  SQLiteExecuteAsyncResult,
} from "expo-sqlite";
import * as Sentry from "@sentry/react-native";

export type QueryResult<T> = Promise<T | null>;

export class BaseRepository {
  private statements: Map<string, SQLiteStatement> = new Map();

  constructor(protected readonly db: SQLiteDatabase) {}

  protected async withTransaction<T>(task: () => Promise<T>): QueryResult<T> {
    try {
      let result: T | null = null;
      await this.db.withTransactionAsync(async () => {
        result = await task();
      });
      return result;
    } catch (error) {
      Sentry.captureException(error);
      console.error(error);
      return null;
    }
  }

  protected async prepareStatement(
    query: string,
    caller: string,
  ): QueryResult<SQLiteStatement> {
    let statement = this.statements.get(caller);

    if (statement) {
      return statement;
    }

    try {
      const newStatement = await this.db.prepareAsync(query);
      this.statements.set(caller, newStatement);

      return newStatement;
    } catch (error) {
      Sentry.captureException(error);
      console.error(error);
      return null;
    }
  }

  protected async finalizeStatement(caller: string) {
    const statement = this.statements.get(caller);
    if (statement) {
      await statement.finalizeAsync();
      this.statements.delete(caller);
    }
  }

  public async finalize() {
    const mStatements = this.statements.values();

    function* getPromises() {
      for (const statement of mStatements) {
        yield statement.finalizeAsync();
      }
    }

    return Promise.all(getPromises());
  }

  protected async executeStatement(
    statement: SQLiteStatement,
    params: SQLiteBindParams,
  ) {
    try {
      return await statement.executeAsync(params);
    } catch (error) {
      Sentry.captureException(error);
      console.error(error);
      return null;
    }
  }

  protected async getFirstRow(result: SQLiteExecuteAsyncResult<unknown>) {
    try {
      return await result.getFirstAsync();
    } catch (error) {
      Sentry.captureException(error);
      console.error(error);
      return null;
    }
  }
}
