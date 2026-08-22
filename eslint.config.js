const js = require("@eslint/js");
const tseslint = require("typescript-eslint");
const reactHooks = require("eslint-plugin-react-hooks");

module.exports = tseslint.config(
  { ignores: ["build/"] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["src/**/*.{ts,tsx}"],
    plugins: { "react-hooks": reactHooks },
    rules: {
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
      "@typescript-eslint/ban-ts-comment": ["error", { "ts-ignore": true }],
      "@typescript-eslint/no-unused-vars": ["error", { "varsIgnorePattern": "^_" }],
      "@typescript-eslint/no-explicit-any": "warn"
    }
  }
);
