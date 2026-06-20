import js from "@eslint/js";
import eslintConfigPrettier from "eslint-config-prettier";
import importPlugin from "eslint-plugin-import";
import onlyWarn from "eslint-plugin-only-warn";
import turboPlugin from "eslint-plugin-turbo";
import tseslint from "typescript-eslint";

/**
 * A shared ESLint configuration for the repository.
 *
 * @type {import("eslint").Linter.Config}
 * */
export const config = [
  js.configs.recommended,
  eslintConfigPrettier,
  ...tseslint.configs.recommended,
  {
    plugins: {
      import: importPlugin,
      turbo: turboPlugin,
    },
    rules: {
      "default-case": "warn",
      "default-param-last": "warn",
      "dot-notation": "warn",
      eqeqeq: "warn",
      "import/no-default-export": "warn",
      "no-duplicate-imports": "warn",
      "no-restricted-imports": [
        "warn",
        {
          patterns: [
            {
              regex: String.raw`^(\.\./)+(apps|packages)/[^/]+/(src|lib)(/.*)?$`,
              message:
                "Do not import workspace internals by relative path. Install the package and use the package public alias instead.",
            },
            {
              regex: String.raw`^@repo/[^/]+/.+$`,
              message:
                "Do not deep-import from a package. Install the package and use the package public alias instead.",
            },
          ],
        },
      ],
      "no-negated-condition": "warn",
      "no-unneeded-ternary": "warn",
      "object-shorthand": "warn",
      "prefer-const": "warn",
      "prefer-destructuring": "warn",
      "prefer-object-spread": "warn",
      "prefer-rest-params": "warn",
      "prefer-spread": "warn",
      "prefer-template": "warn",
      "turbo/no-undeclared-env-vars": "warn",
      "@typescript-eslint/consistent-type-imports": "warn",
      yoda: "warn",
    },
  },
  {
    plugins: {
      onlyWarn,
    },
  },
  {
    files: ["**/*.config.{js,mjs}"],
    rules: {
      "import/no-default-export": "off",
    },
  },
  {
    ignores: ["dist/**", ".next/**", "**/.turbo/**", "**/coverage/**"],
  },
];
