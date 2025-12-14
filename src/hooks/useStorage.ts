import * as Sentry from "@sentry/react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  RefObject,
  useCallback,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import type { z, ZodType } from "zod";

interface Storage<Z extends ZodType> {
  load: () => Promise<void>;
  store: (data: z.output<Z>) => Promise<void>;
}

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

type UseStorage<Z extends ZodType> = {
  data: z.output<Z> | StorageFallback;
  storageApi: RefObject<Storage<Z> | undefined>;
};

export function useStorage<Z extends ZodType>(
  key: string,
  validator: Z,
): UseStorage<Z> {
  const [data, setData] = useState<z.output<Z> | object>({});
  const storageApi = useRef<Storage<Z>>(undefined);

  const onLoad = useCallback(async () => {
    const mData = await load(key, validator);

    setData(mData);
  }, [key, validator]);

  const onStore = useCallback(
    async (data: z.output<Z>) => {
      await store(key, data);
      onLoad();
    },
    [key, onLoad],
  );

  useImperativeHandle(
    storageApi,
    () => ({
      load: onLoad,
      store: onStore,
    }),
    [onLoad, onStore],
  );

  return { data, storageApi };
}
