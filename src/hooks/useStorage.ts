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

interface Storage {
  load: () => Promise<void>;
}

async function load<Z extends ZodType>(
  key: string,
  validator: Z,
): Promise<z.output<Z> | object> {
  try {
    const loadedData = await AsyncStorage.getItem(key);
    const parsedData = loadedData ? JSON.parse(loadedData) : {};
    const data = await validator.parseAsync(parsedData);
    return data;
  } catch (e) {
    Sentry.captureException(e);
    return {};
  }
}

type StorageFallback = object;

type UseStorage<Z extends ZodType> = {
  data: z.output<Z> | StorageFallback;
  storageApi: RefObject<Storage | undefined>;
};

export function useStorage<Z extends ZodType>(
  key: string,
  validator: Z,
): UseStorage<Z> {
  const [data, setData] = useState<z.output<Z> | object>({});
  const storageApi = useRef<Storage>(undefined);

  const onLoad = useCallback(async () => {
    const mData = await load(key, validator);

    setData(mData);
  }, [key, validator]);

  useImperativeHandle(
    storageApi,
    () => ({
      load: onLoad,
    }),
    [onLoad],
  );

  return { data, storageApi };
}
