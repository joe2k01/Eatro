jest.mock("@sentry/react-native", () => ({
  captureException: jest.fn(),
}));

afterEach(() => {
  jest.clearAllMocks();
});
