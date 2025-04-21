/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  transform: {
    "^.+\\.tsx?$": ["ts-jest", {
      tsconfig: './frontend/tsconfig.json',
    }],
  },
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/frontend/$1",
    "^react$": "<rootDir>/frontend/node_modules/react",
    "^react-dom$": "<rootDir>/frontend/node_modules/react-dom"
  },
  setupFilesAfterEnv: ['<rootDir>/tests/frontend/setupTests.ts'],
  testMatch: [
    "**/tests/frontend/**/*.test.ts",
    "**/tests/frontend/**/*.test.tsx"
  ],
};