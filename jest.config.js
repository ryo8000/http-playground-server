/** @type {import('ts-jest').JestConfigWithTsJest} **/
module.exports = {
  testEnvironment: "node",
  testMatch: ["**/tests/ut/**/*.test.ts"],
  transform: {
    "^.+.tsx?$": ["ts-jest",{}],
  },
};
