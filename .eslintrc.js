module.exports = {
  root: true,
  env: {
    es6: true,
    node: true,
    "jest/globals": true,
  },
  parser: "@typescript-eslint/parser",
  plugins: ["jest", "@typescript-eslint"],
  extends: [
    "eslint:recommended",
    "plugin:jest/recommended",
    "plugin:@typescript-eslint/recommended",
  ],
  parserOptions: {
    sourceType: "module",
  },
};
