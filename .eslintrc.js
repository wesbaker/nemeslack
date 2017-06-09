module.exports = {
  env: {
    es6: true,
    node: true,
    "jest/globals": true
  },
  plugins: ["jest"],
  extends: ["eslint:recommended", "plugin:jest/recommended"],
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
