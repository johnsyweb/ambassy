import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";

export default [
  {files: ["**/*.{js,mjs,cjs,ts}"]},
  {ignores: ["node_modules/", "dist/"]},
  {languageOptions: { globals: {...globals.browser, ...globals.node} }},
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  {
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["../actions/*"],
              message: "Use @actions/* alias instead of relative path",
            },
            {
              group: ["../models/*"],
              message: "Use @models/* alias instead of relative path",
            },
            {
              group: ["../parsers/*"],
              message: "Use @parsers/* alias instead of relative path",
            },
            {
              group: ["../utils/*"],
              message: "Use @utils/* alias instead of relative path",
            },
            {
              group: ["../types/*"],
              message: "Use @localtypes/* alias instead of relative path",
            },
          ],
        },
      ],
    },
  },
];