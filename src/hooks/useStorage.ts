import * as Sentry from "@sentry/react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useRef, useState } from "react";
import type { z, ZodType } from "zod";

const loadingFallback = {};

async function load<Z extends ZodType>(
  key: string,
  validator: Z,
): Promise<z.output<Z> | object> {
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

async function store<Z extends ZodType>(key: string, data: z.output<Z>) {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    Sentry.captureException(e);
  }
}

type StorageFallback = object;

export type UseStorageResult<Z extends ZodType> = {
  data: z.output<Z> | StorageFallback;
  /** True while the hook is loading from storage (and during update persistence). */
  loading: boolean;
  /** Reload the persisted value (also updates `data`). */
  reload: () => Promise<void>;
  /** Update state and persist (also updates `data`). */
  update: (next: z.output<Z>) => Promise<void>;
};

export function useStorage<Z extends ZodType>(
  key: string,
  validator: Z,
  initialData: z.output<Z>,
): Omit<UseStorageResult<Z>, "data"> & { data: z.output<Z> };
export function useStorage<Z extends ZodType>(
  key: string,
  validator: Z,
): UseStorageResult<Z>;

export function useStorage<Z extends ZodType>(
  key: string,
  validator: Z,
  initialData?: z.output<Z>,
): UseStorageResult<Z> {
  const [data, setData] = useState<z.output<Z> | object>(
    initialData ?? loadingFallback,
  );
  const [loading, setLoading] = useState(true);
  const hasInitialData = useRef(initialData !== undefined);

  useEffect(() => {
    hasInitialData.current = initialData !== undefined;
  }, [initialData]);

  const reload = useCallback(async () => {
    setLoading(true);
    const mData = await load(key, validator);

    // If a caller provided initial data, keep it when storage is empty.
    if (hasInitialData.current && Object.is(mData, loadingFallback)) {
      setLoading(false);
      return;
    }

    setData(mData);
    setLoading(false);
  }, [key, validator]);

  const update = useCallback(
    async (next: z.output<Z>) => {
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
