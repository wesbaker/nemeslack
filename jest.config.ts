import type { Config } from "@jest/types";

const config: Config.InitialOptions = {
  coverageDirectory: "./coverage/",
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
  testEnvironment: "node",
  testPathIgnorePatterns: ["/node_modules/", "jest.config.ts"],
  transform: {
    "^.+\\.(ts|tsx)$": "ts-jest",
  },
};

export default config;
