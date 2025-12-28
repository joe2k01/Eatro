import * as Sentry from "@sentry/react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useRef, useState } from "react";
import type { z } from "zod";
import { storageSchema, type StorageKey } from "@constants/storage";

type StorageSchema = typeof storageSchema;

const loadingFallback = {};

async function load<K extends StorageKey>(
  key: K,
): Promise<z.output<StorageSchema[K]> | object> {
  const validator = storageSchema[key];
  try {
    const loadedData = await AsyncStorage.getItem(key);
    const parsedData = loadedData ? JSON.parse(loadedData) : loadingFallback;

    // This avoids emitting sentry event on fallbacks where the validator is not an object
    if (Object.is(parsedData, loadingFallback)) {
      return loadingFallback;
    }

    const data = await validator.parseAsync(parsedData);
    return data;
  } catch (e) {
    Sentry.captureException(e);
    return {};
  }
}

async function store<K extends StorageKey>(
  key: K,
  data: z.output<StorageSchema[K]>,
) {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    Sentry.captureException(e);
  }
}

type StorageFallback = object;

export type UseStorageResult<K extends StorageKey> = {
  data: z.output<StorageSchema[K]> | StorageFallback;
  /** True while the hook is loading from storage (and during update persistence). */
  loading: boolean;
  /** Reload the persisted value (also updates `data`). */
  reload: () => Promise<void>;
  /** Update state and persist (also updates `data`). */
  update: (next: z.output<StorageSchema[K]>) => Promise<void>;
};

export function useStorage<K extends StorageKey>(
  key: K,
  initialData: z.output<StorageSchema[K]>,
): Omit<UseStorageResult<K>, "data"> & {
  data: z.output<StorageSchema[K]>;
};
export function useStorage<K extends StorageKey>(key: K): UseStorageResult<K>;

export function useStorage<K extends StorageKey>(
  key: K,
  initialData?: z.output<StorageSchema[K]>,
): UseStorageResult<K> {
  const validator = storageSchema[key];
  const [data, setData] = useState<z.output<StorageSchema[K]> | object>(
    initialData ?? loadingFallback,
  );
  const [loading, setLoading] = useState(true);
  const hasInitialData = useRef(initialData !== undefined);

  useEffect(() => {
    hasInitialData.current = initialData !== undefined;
  }, [initialData]);

  const reload = useCallback(async () => {
    setLoading(true);
    const mData = await load(key);

    // If a caller provided initial data, keep it when storage is empty.
    if (hasInitialData.current && Object.is(mData, loadingFallback)) {
      setLoading(false);
      return;
    }

    setData(mData);
    setLoading(false);
  }, [key]);

  const update = useCallback(
    async (next: z.output<StorageSchema[K]>) => {
      try {
        setLoading(true);
        const parsed = await validator.parseAsync(next);
        setData(parsed);
        await store(key, parsed);
      } catch (e) {
        Sentry.captureException(e);
      } finally {
        setLoading(false);
      }
    },
    [key, validator],
  );

  useEffect(() => {
    reload();
  }, [reload]);

  return { data, loading, reload, update };
}
