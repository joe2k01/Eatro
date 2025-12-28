import {
  goalsValidator,
  themeValidator,
  userValidator,
} from "./storage/validators";

/**
 * Storage schema mapping keys to their validators.
 * This ensures type safety and automatic validator selection in useStorage.
 */
export const storageSchema = {
  goals: goalsValidator,
  theme: themeValidator,
  user: userValidator,
} as const;

export type StorageKey = keyof typeof storageSchema;
