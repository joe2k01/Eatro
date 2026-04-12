jest.mock("react-native-worklets", () =>
  require("react-native-worklets/src/mock"),
);

// Must use require — worklets mock above must be registered before reanimated loads
require("react-native-reanimated").setUpTests();

jest.mock("@sentry/react-native", () => ({
  captureException: jest.fn(),
}));

jest.mock("@react-native-async-storage/async-storage", () =>
  require("@react-native-async-storage/async-storage/jest/async-storage-mock"),
);

jest.mock("react-native-safe-area-context", () => {
  const mock = require("react-native-safe-area-context/jest/mock");
  return mock.default ?? mock;
});

jest.mock("@gorhom/bottom-sheet", () => require("@gorhom/bottom-sheet/mock"));

jest.mock("react-native-vision-camera", () => {
  const React = require("react");
  return {
    Camera: React.forwardRef(function MockCamera(
      props: Record<string, unknown>,
      ref: React.Ref<unknown>,
    ) {
      return React.createElement("View", { ...props, ref });
    }),
    useCameraDevice: jest.fn(() => ({ id: "back" })),
    useCameraPermission: jest.fn(() => ({
      hasPermission: true,
      requestPermission: jest.fn(),
    })),
    useCodeScanner: jest.fn((opts: { onCodeScanned?: Function }) => opts),
  };
});

jest.mock("@expo/vector-icons/MaterialIcons", () => {
  const React = require("react");
  return {
    __esModule: true,
    default: function MockMaterialIcons(props: {
      name: string;
      testID?: string;
    }) {
      return React.createElement(
        "Text",
        { testID: props.testID ?? `icon-${props.name}` },
        props.name,
      );
    },
  };
});

jest.mock("@expo/vector-icons/MaterialCommunityIcons", () => {
  const React = require("react");
  return {
    __esModule: true,
    default: function MockMaterialCommunityIcons(props: {
      name: string;
      testID?: string;
    }) {
      return React.createElement(
        "Text",
        { testID: props.testID ?? `icon-${props.name}` },
        props.name,
      );
    },
  };
});

jest.mock("@react-navigation/native", () => ({
  useNavigation: jest.fn(() => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
    canGoBack: jest.fn(() => true),
  })),
  useIsFocused: jest.fn(() => true),
}));

jest.mock("../modules/popup-button/src/PopupButtonView", () => {
  const React = require("react");
  return {
    __esModule: true,
    default: function MockPopupButtonView(props: {
      children?: React.ReactNode;
      onOptionSelect?: Function;
    }) {
      return React.createElement(
        "View",
        { testID: "popup-button" },
        props.children,
      );
    },
  };
});

afterEach(() => {
  jest.clearAllMocks();
});
