import { useCallback, useMemo } from "react";
import {
  FlatList,
  StyleSheet,
  ListRenderItemInfo,
  useWindowDimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRoute, type RouteProp } from "@react-navigation/native";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useApiClient } from "@api/ApiClient";
import { VStack } from "@components/layout/VStack";
import { Caption } from "@components/typography/Text";
import { useTheme } from "@contexts/ThemeProvider";
import type { SearchProductItem } from "@api/validators/searchProducts";
import { SearchResultItem } from "./components/SearchResultItem";
import {
  SearchResultLoader,
  ROW_HEIGHT,
} from "./components/SearchResultLoader";

/** Approximate height of the header (back arrow + search pill + padding + safe area). */
const HEADER_HEIGHT_ESTIMATE = 56;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  list: {
    flex: 1,
  },
});

function InitialLoaders({ count }: { count: number }) {
  const keys = useMemo(
    () => Array.from({ length: count }, (_, i) => String(i)),
    [count],
  );

  return (
    <VStack>
      {keys.map((key) => (
        <SearchResultLoader key={key} />
      ))}
    </VStack>
  );
}

export function Search() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { client } = useApiClient();

  const route = useRoute<RouteProp<{ Search: SearchParams }, "Search">>();
  const query = route.params?.query ?? "";

  const queryEnabled = query.length > 0;

  const { data, fetchNextPage, hasNextPage, isFetching, isFetchingNextPage } =
    useInfiniteQuery({
      queryKey: ["search", query],
      queryFn: ({ pageParam }) =>
        client.searchProducts(query, { page: pageParam }),
      initialPageParam: 1,
      getNextPageParam: (lastPage) =>
        lastPage.page < lastPage.pageCount ? lastPage.page + 1 : undefined,
      enabled: queryEnabled,
    });

  const products = useMemo(
    () => data?.pages.flatMap((page) => page.products) ?? [],
    [data],
  );

  const handleEndReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<SearchProductItem>) => (
      <SearchResultItem item={item} />
    ),
    [],
  );

  const keyExtractor = useCallback((item: SearchProductItem) => item.code, []);

  const listFooter = useMemo(
    () => (isFetchingNextPage ? <SearchResultLoader /> : null),
    [isFetchingNextPage],
  );

  const isInitialLoad = isFetching && !data && queryEnabled;

  const { height: windowHeight } = useWindowDimensions();

  const loaderCount = useMemo(() => {
    const available = windowHeight - insets.top - HEADER_HEIGHT_ESTIMATE;
    return Math.ceil(available / ROW_HEIGHT);
  }, [windowHeight, insets.top]);

  return (
    <VStack style={styles.container}>
      {!queryEnabled ? (
        <VStack style={styles.emptyContainer}>
          <Caption color={theme.text.muted}>
            Start typing to add a food item
          </Caption>
        </VStack>
      ) : isInitialLoad ? (
        <InitialLoaders count={loaderCount} />
      ) : (
        <FlatList
          style={styles.list}
          data={products}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          onEndReached={handleEndReached}
          onEndReachedThreshold={0.5}
          ListFooterComponent={listFooter}
          keyboardShouldPersistTaps="handled"
        />
      )}
    </VStack>
  );
}

export type SearchParams =
  | {
      query?: string;
    }
  | undefined;
