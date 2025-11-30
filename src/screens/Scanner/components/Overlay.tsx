import { IconButton } from "@coinbase/cds-mobile/buttons/IconButton";
import { Box, VStack } from "@coinbase/cds-mobile/layout";
import { Text } from "@coinbase/cds-mobile/typography/Text";
import { useNavigation } from "@react-navigation/native";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { Animated, ViewStyle } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export function Overlay() {
  const navigation = useNavigation();
  const onCancel = useCallback(() => navigation.goBack(), [navigation]);

  const insets = useSafeAreaInsets();

  const opacity = useRef(new Animated.Value(1));

  const topBoxStyle = useMemo<ViewStyle>(
    () => ({ paddingTop: insets.top }),
    [insets.top],
  );
  const bottomBoxStyle = useMemo<ViewStyle>(
    () => ({ opacity: opacity.current, paddingBlock: insets.bottom }),
    [insets.bottom],
  );

  useEffect(() => {
    Animated.timing(opacity.current, {
      toValue: 0,
      useNativeDriver: true,
      delay: 2000,
      duration: 1000,
    }).start();
  }, []);

  return (
    <VStack height="100%" justifyContent="space-between">
      <Box style={topBoxStyle} paddingStart={2}>
        <IconButton
          name="close"
          variant="negative"
          accessibilityLabel="Cancel"
          onPress={onCancel}
        />
      </Box>
      <Box background="bgElevation1" style={bottomBoxStyle} animated>
        <Text font="title1" align="center">
          Scan a product&apos;s bar code to look up its data
        </Text>
      </Box>
    </VStack>
  );
}
