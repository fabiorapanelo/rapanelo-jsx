module.exports = {
  env: {
    browser: true,
    es6: true,
  },
  extends: "airbnb-base",
  globals: {
    Atomics: "readonly",
    SharedArrayBuffer: "readonly",
  },
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: "module",
    ecmaFeatures: {
      jsx: true,
    },
  },
  ignorePatterns: ["node_modules/", "dist", "README.md"],
  rules: {
    indent: [2, "tab"],
    "no-tabs": 0,
    "linebreak-style": ["error", "unix"],
    quotes: ["error", "single"],
    semi: ["error", "always"],
    "quote-props": ["error", "as-needed"],
    "no-unused-vars": ["error", { varsIgnorePattern: "createElement" }],
    "no-prototype-builtins": "off",
    "no-use-before-define": ["error", { "functions": false }],
    "no-plusplus": 0,
    "no-param-reassign": 0,
    "no-trailing-spaces": "error",
    "import/prefer-default-export": 0,
  },
};
