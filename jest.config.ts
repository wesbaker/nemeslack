import type { Config } from "@jest/types";

const config: Config.InitialOptions = {
  testEnvironment: "node",
  coverageThreshold: {
    global: {
      branches: 100,
      functions: 100,
      lines: 100,
      statements: 100,
    },
  },
  testPathIgnorePatterns: ["/node_modules/", "jest.config.ts"],
};

export default config;
