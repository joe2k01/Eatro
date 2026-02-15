import { useCallback, useMemo, useRef, useState } from "react";
import {
  FlatList,
  StyleSheet,
  TextInput,
  ListRenderItemInfo,
  useWindowDimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useApiClient } from "@api/ApiClient";
import { VStack } from "@components/layout/VStack";
import { HStack } from "@components/layout/HStack";
import { Icon } from "@components/media/Icon";
import { IconButton } from "@components/buttons/IconButton";
import { Caption } from "@components/typography/Text";
import { useTheme } from "@contexts/ThemeProvider";
import { BorderRadius, spacing } from "@constants/theme";
import { useStaticNavigationOptions } from "@hooks/useStaticNavigationOptions";
import type { NativeStackNavigationOptions } from "@react-navigation/native-stack";
import type { SearchProductItem } from "@api/validators/searchProducts";
import { SearchResultItem } from "./components/SearchResultItem";
import {
  SearchResultLoader,
  ROW_HEIGHT,
} from "./components/SearchResultLoader";

const DEBOUNCE_MS = 400;

/** Approximate height of the search bar row (icon + input + padding). */
const SEARCH_BAR_HEIGHT = 56;

const headerOptions = {
  headerShown: false,
} satisfies NativeStackNavigationOptions;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchRow: {
    paddingHorizontal: spacing(2),
    paddingVertical: spacing(1),
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: spacing(1),
    paddingHorizontal: spacing(2),
  },
  inputContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: spacing(1.5),
    overflow: "hidden",
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
  useStaticNavigationOptions(headerOptions);

  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { client } = useApiClient();
  const inputRef = useRef<TextInput>(null);

  const [text, setText] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleChangeText = useCallback(
    (value: string) => {
      setText(value);

      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }

      debounceTimer.current = setTimeout(() => {
        setDebouncedQuery(value.trim());
      }, DEBOUNCE_MS);
    },
    [],
  );

  const handleScanPress = useCallback(() => {
    navigation.navigate("Scanner");
  }, [navigation]);

  const handleBackPress = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const queryEnabled = debouncedQuery.length > 0;

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["search", debouncedQuery],
    queryFn: ({ pageParam }) =>
      client.searchProducts(debouncedQuery, { page: pageParam }),
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

  const keyExtractor = useCallback(
    (item: SearchProductItem) => item.code,
    [],
  );

  const listFooter = useMemo(
    () => (isFetchingNextPage ? <SearchResultLoader /> : null),
    [isFetchingNextPage],
  );

  const isInitialLoad = isFetching && !data && queryEnabled;

  const inputContainerStyle = useMemo(
    () => [
      styles.inputContainer,
      {
        backgroundColor: theme.surface.secondary,
        borderRadius: BorderRadius.full,
      },
    ],
    [theme.surface.secondary],
  );

  const inputColor = theme.text.primary;
  const placeholderColor = theme.text.muted;

  const { height: windowHeight } = useWindowDimensions();

  const loaderCount = useMemo(() => {
    const available = windowHeight - insets.top - SEARCH_BAR_HEIGHT;
    return Math.ceil(available / ROW_HEIGHT);
  }, [windowHeight, insets.top]);

  const containerStyle = useMemo(
    () => [
      styles.container,
      {
        backgroundColor: theme.surface.primary,
        paddingTop: insets.top,
      },
    ],
    [theme.surface.primary, insets.top],
  );

  return (
    <VStack style={containerStyle}>
      {/* Search bar */}
      <HStack style={styles.searchRow} gap={1} alignItems="center">
        <IconButton
          name="chevron-left"
          size="s"
          variant="ghost"
          onPress={handleBackPress}
        />
        <HStack style={inputContainerStyle}>
          <Icon name="search" size="xs" color={theme.text.muted} />
          <TextInput
            ref={inputRef}
            style={[styles.input, { color: inputColor }]}
            placeholder="Search food..."
            placeholderTextColor={placeholderColor}
            value={text}
            onChangeText={handleChangeText}
            autoFocus
            returnKeyType="search"
            autoCorrect={false}
          />
        </HStack>
        <IconButton
          name="qr-code-scanner"
          size="s"
          variant="ghost"
          onPress={handleScanPress}
        />
      </HStack>

      {/* Content */}
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

export type SearchParams = undefined;
