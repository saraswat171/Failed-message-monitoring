import globals from "globals";
import pluginJs from "@eslint/js";


export default [
  { files: ["**/*.js"], languageOptions: { sourceType: "commonjs" } },
  { languageOptions: { globals: globals.browser } },
  pluginJs.configs.recommended,
  {
    env: {
      "node": true,
    },
    rules: {
      "no-unused-vars": "warn",
      "no-undef": "warn"
    }
  }
];