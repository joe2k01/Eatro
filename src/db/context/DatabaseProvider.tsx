import { SQLiteProvider, useSQLiteContext } from "expo-sqlite";
import React, {
  Suspense,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import * as Sentry from "@sentry/react-native";
import { ErrorBoundary } from "@components/feedback/ErrorBoundary";
import { migrateDbIfNeeded } from "../migrations/migrate";
import { FoodRepository } from "../repositories/FoodRepository";
import { MealRepository } from "../repositories/MealRepository";
import { MealFoodRepository } from "../repositories/MealFoodRepository";

type Repositories = {
  food: FoodRepository;
  meal: MealRepository;
  mealFood: MealFoodRepository;
};

const RepositoriesContext = createContext<Repositories | null>(null);

/**
 * Hook to access singleton repository instances.
 * These instances cache prepared statements for better performance.
 */
export function useRepositories(): Repositories {
  const context = useContext(RepositoriesContext);
  if (!context) {
    throw new Error("useRepositories must be used within a DatabaseProvider");
  }
  return context;
}

type DatabaseProviderProps = {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  errorFallback?: React.ReactNode;
};

function RepositoriesProvider({ children }: { children: React.ReactNode }) {
  const db = useSQLiteContext();
  const [repositories, setRepositories] = useState<Repositories | null>(null);

  useEffect(() => {
    // Create new repository instances
    const newRepositories: Repositories = {
      food: new FoodRepository(db),
      meal: new MealRepository(db),
      mealFood: new MealFoodRepository(db),
    };

    setRepositories(newRepositories);

    // Cleanup function for when component unmounts or db changes
    return () => {
      Promise.all([
        newRepositories.food.finalize(),
        newRepositories.meal.finalize(),
        newRepositories.mealFood.finalize(),
      ]).catch((error) => {
        Sentry.captureException(error);
        console.error("Error finalizing repositories on cleanup:", error);
      });
    };
  }, [db]);

  // Don't render children until repositories are ready
  if (!repositories) {
    return null;
  }

  return (
    <RepositoriesContext.Provider value={repositories}>
      {children}
    </RepositoriesContext.Provider>
  );
}

export function DatabaseProvider({
  children,
  fallback,
  errorFallback,
}: DatabaseProviderProps) {
  // SQLite.deleteDatabaseSync("eatro.db");

  return (
    <ErrorBoundary fallback={errorFallback}>
      <Suspense fallback={fallback}>
        <SQLiteProvider
          databaseName="eatro.db"
          useSuspense={!!fallback && !!errorFallback}
          onInit={migrateDbIfNeeded}
        >
          <RepositoriesProvider>{children}</RepositoriesProvider>
        </SQLiteProvider>
      </Suspense>
    </ErrorBoundary>
  );
}
