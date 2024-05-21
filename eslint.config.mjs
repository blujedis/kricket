import globals from "globals";
import pluginJs from "@eslint/js";


export default [
  { 
    languageOptions: { 
      globals: globals.node 
    } 
  },
  pluginJs.configs.recommended,
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "off"
    },
    ignores: [".tmp/*"]
  },



];