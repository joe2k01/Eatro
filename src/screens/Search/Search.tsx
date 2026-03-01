import { useCallback, useMemo } from "react";
import {
  SectionList,
  StyleSheet,
  useWindowDimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRoute, type RouteProp } from "@react-navigation/native";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useApiClient } from "@api/ApiClient";
import { VStack } from "@components/layout/VStack";
import { Caption, Title } from "@components/typography/Text";
import { useTheme } from "@contexts/ThemeProvider";
import { spacing } from "@constants/theme";
import type { SearchProductItem } from "@api/validators/searchProducts";
import type { Food } from "@db/schemas";
import {
  SearchResultItem,
  type SearchResultItemProps,
} from "./components/SearchResultItem";
import {
  SearchResultLoader,
  ROW_HEIGHT,
} from "./components/SearchResultLoader";
import { useManualFoods } from "@screens/MyFoods/hooks/useManualFoods";

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
  sectionHeader: {
    paddingHorizontal: spacing(2),
    paddingTop: spacing(2),
    paddingBottom: spacing(0.5),
  },
});

type SearchSectionItem = SearchResultItemProps;

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

  const manualFoods = useManualFoods(query, {
    limit: 10,
    refetchOnFocus: false,
  });

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

  const sections = useMemo(() => {
    const result: { title: string; data: SearchSectionItem[] }[] = [];

    if (manualFoods.length > 0) {
      result.push({
        title: "My Foods",
        data: manualFoods.map(
          (f) => ({ item: f, source: "local" as const }),
        ),
      });
    }

    if (products.length > 0) {
      result.push({
        title: "Online Results",
        data: products.map(
          (p) => ({ item: p, source: "api" as const }),
        ),
      });
    }

    return result;
  }, [manualFoods, products]);

  const handleEndReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const renderItem = useCallback(
    ({ item }: { item: SearchSectionItem }) => (
      <SearchResultItem {...item} />
    ),
    [],
  );

  const renderSectionHeader = useCallback(
    ({ section }: { section: { title: string } }) => (
      <VStack style={styles.sectionHeader}>
        <Title>{section.title}</Title>
      </VStack>
    ),
    [],
  );

  const keyExtractor = useCallback(
    (item: SearchSectionItem) =>
      "code" in item.item
        ? (item.item as SearchProductItem).code
        : `local-${(item.item as Food).id}`,
    [],
  );

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
        <SectionList
          style={styles.list}
          sections={sections}
          renderItem={renderItem}
          renderSectionHeader={renderSectionHeader}
          keyExtractor={keyExtractor}
          onEndReached={handleEndReached}
          onEndReachedThreshold={0.5}
          ListFooterComponent={listFooter}
          keyboardShouldPersistTaps="handled"
          stickySectionHeadersEnabled={false}
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
