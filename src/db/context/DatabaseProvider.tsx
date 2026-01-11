import { SQLiteProvider } from "expo-sqlite";
import React, { Suspense } from "react";
import { ErrorBoundary } from "@components/feedback/ErrorBoundary";
import { migrateDbIfNeeded } from "../migrations/migrate";
import * as SQLite from "expo-sqlite";

type DatabaseProviderProps = {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  errorFallback?: React.ReactNode;
};

export function DatabaseProvider({
  children,
  fallback,
  errorFallback,
}: DatabaseProviderProps) {
  SQLite.deleteDatabaseSync("eatro.db");

  return (
    <ErrorBoundary fallback={errorFallback}>
      <Suspense fallback={fallback}>
        <SQLiteProvider
          databaseName="eatro.db"
          useSuspense={!!fallback && !!errorFallback}
          onInit={migrateDbIfNeeded}
        >
          {children}
        </SQLiteProvider>
      </Suspense>
    </ErrorBoundary>
  );
}
