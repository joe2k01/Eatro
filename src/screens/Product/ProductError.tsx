import { ApiError } from "@api/ApiError";
import { CommonActions, useNavigation } from "@react-navigation/native";
import { Ramen404 } from "@components/media/Ramen404";
import { useThemeVariant } from "@contexts/ThemeProvider";
import { VStack } from "@components/layout/VStack";
import { Box } from "@components/layout/Box";
import { Headline, TextBody } from "@components/typography/Text";
import { Button } from "@components/buttons/Button";

export function ProductError({
  onRetry,
  error,
}: {
  error: unknown;
  onRetry: () => void;
}) {
  const navigation = useNavigation();

  const themeVariant = useThemeVariant();

  if (error instanceof ApiError && error.status === 404) {
    return (
      <VStack padding={2} gap={2} width="100%" alignItems="center">
        <Box width="100%" alignItems="center" aspectRatio={194 / 155}>
          <Ramen404 />
        </Box>

        <VStack gap={0.5} alignItems="center">
          <Headline>Product not found</Headline>
          <TextBody
            color={themeVariant === "dark" ? "fgMuted" : "muted"}
            textAlign="center"
          >
            We couldn’t find a product for this barcode.
          </TextBody>
        </VStack>

        <Box width="100%">
          <Button
            onPress={() => {
              navigation.dispatch(
                CommonActions.reset({
                  index: 0,
                  routes: [{ name: "Home" as never }],
                }),
              );
            }}
            variant="primary"
          >
            Back home
          </Button>
        </Box>
      </VStack>
    );
  }

  return (
    <VStack padding={2} gap={2} width="100%">
      <Headline>Could not load product</Headline>
      <TextBody>Please try again.</TextBody>
      <Box width="100%">
        <Button onPress={onRetry} variant="destructive">
          Retry
        </Button>
      </Box>
    </VStack>
  );
}
