jest.mock("@sentry/react-native", () => ({
  captureException: jest.fn(),
}));

const originalWarn = console.warn;
console.warn = (...args: unknown[]) => {
  if (typeof args[0] === "string" && args[0].includes("Failed to initialize devtools client")) {
    return;
  }
  originalWarn(...args);
};

afterEach(() => {
  jest.clearAllMocks();
});
