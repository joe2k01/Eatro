const mockReact = require("react") as typeof import("react");

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

jest.mock(
  "react-native-safe-area-context",
  () => require("react-native-safe-area-context/jest/mock").default,
);

jest.mock("@gorhom/bottom-sheet", () => require("@gorhom/bottom-sheet/mock"));

jest.mock("react-native-vision-camera", () => ({
  Camera: mockReact.forwardRef(function MockCamera(
    props: Record<string, unknown>,
    ref: mockReact.Ref<unknown>,
  ) {
    return mockReact.createElement("View", { ...props, ref });
  }),
  useCameraDevice: jest.fn(() => ({ id: "back" })),
  useCameraPermission: jest.fn(() => ({
    hasPermission: true,
    requestPermission: jest.fn(),
  })),
  useCodeScanner: jest.fn((opts: { onCodeScanned?: Function }) => opts),
}));

const mockIconModule = () => ({
  __esModule: true,
  default: (props: { name: string; testID?: string }) =>
    mockReact.createElement(
      "Text",
      { testID: props.testID ?? `icon-${props.name}` },
      props.name,
    ),
});

jest.mock("@expo/vector-icons/MaterialIcons", () => mockIconModule());
jest.mock("@expo/vector-icons/MaterialCommunityIcons", () => mockIconModule());

jest.mock("@react-navigation/native", () => ({
  useNavigation: jest.fn(() => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
    canGoBack: jest.fn(() => true),
  })),
  useIsFocused: jest.fn(() => true),
}));

jest.mock("../modules/popup-button/src/PopupButtonView", () => ({
  __esModule: true,
  default: (props: {
    children?: mockReact.ReactNode;
    onOptionSelect?: Function;
  }) =>
    mockReact.createElement("View", { testID: "popup-button" }, props.children),
}));

afterEach(() => {
  jest.clearAllMocks();
});
