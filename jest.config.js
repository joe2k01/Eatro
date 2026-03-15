/** @type {import('jest').Config} */
module.exports = {
  preset: "jest-expo",
  setupFilesAfterEnv: [
    "expo-sqlite-mock/src/setup.ts",
    "<rootDir>/test/setup.ts",
  ],
  moduleNameMapper: {
    "^@components/(.*)$": "<rootDir>/src/components/$1",
    "^@hooks/(.*)$": "<rootDir>/src/hooks/$1",
    "^@screens/(.*)$": "<rootDir>/src/screens/$1",
    "^@contexts/(.*)$": "<rootDir>/src/contexts/$1",
    "^@api/(.*)$": "<rootDir>/src/api/$1",
    "^@constants/(.*)$": "<rootDir>/src/constants/$1",
    "^@db/(.*)$": "<rootDir>/src/db/$1",
    "^@utils/(.*)$": "<rootDir>/src/utils/$1",
  },
  testMatch: ["<rootDir>/test/**/*.test.ts"],
  testTimeout: 10000,
};
