import type { Config } from "@jest/types";

const config: Config.InitialOptions = {
  coverageDirectory: "./coverage/",
  coverageThreshold: {
    global: {
      branches: 100,
      functions: 100,
      lines: 100,
      statements: 100,
    },
  },
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
  testEnvironment: "node",
  testPathIgnorePatterns: ["/node_modules/", "jest.config.ts"],
  transform: {
    "^.+\\.(ts|tsx)$": "ts-jest",
  },
};

export default config;
