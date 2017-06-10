module.exports = {
  env: {
    es6: true,
    node: true,
    "jest/globals": true
  },
  plugins: ["jest", "flowtype"],
  extends: [
    "eslint:recommended",
    "plugin:jest/recommended",
    "plugin:flowtype/recommended"
  ],
  parser: "babel-eslint",
  parserOptions: {
    sourceType: "module"
  },
  rules: {
    indent: ["error", 2],
    "linebreak-style": ["error", "unix"],
    quotes: ["error", "double"],
    semi: ["error", "always"],
    "no-console": [0]
  }
};
