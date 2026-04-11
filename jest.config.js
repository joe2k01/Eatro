/** @type {import('jest').Config} */
module.exports = {
  preset: "jest-expo",
  setupFiles: ["<rootDir>/test/jest-install-worklets-proxy.js"],
  setupFilesAfterEnv: ["<rootDir>/test/setup.ts"],
  moduleNameMapper: {
    "^expo-sqlite$": "<rootDir>/test/mocks/expo-sqlite.ts",
    "^@components/(.*)$": "<rootDir>/src/components/$1",
    "^@hooks/(.*)$": "<rootDir>/src/hooks/$1",
    "^@screens/(.*)$": "<rootDir>/src/screens/$1",
    "^@contexts/(.*)$": "<rootDir>/src/contexts/$1",
    "^@api/(.*)$": "<rootDir>/src/api/$1",
    "^@constants/(.*)$": "<rootDir>/src/constants/$1",
    "^@db/(.*)$": "<rootDir>/src/db/$1",
    "^@utils/(.*)$": "<rootDir>/src/utils/$1",
  },
  testMatch: ["<rootDir>/src/**/*.test.ts", "<rootDir>/src/**/*.test.tsx"],
  testTimeout: 10000,
};
