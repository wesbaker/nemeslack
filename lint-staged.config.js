module.exports = {
  "*.{ts,tsx,js,jsx,css,md,json}": ["prettier --write"],
  "*.{ts,tsx,js,jsx}": ["eslint", "jest --findRelatedTests"],
  "*.{ts,tsx}": () => "tsc -p tsconfig.json",
};
