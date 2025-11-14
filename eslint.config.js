import { defineConfig } from "eslint/config";
import eslint from "@eslint/js";
import tseslint from "typescript-eslint";

export default defineConfig(
    eslint.configs.recommended,
    tseslint.configs.recommended,
    {
        name: "custom-style-overrides",
        rules: {
            "no-var": "error",
            "prefer-const": "error",
            "semi": ["error", "always"],
            "quotes": ["error", "double"],
            "no-trailing-spaces": "error",
            "camelcase": "off",
            "indent": ["error", 4],
            "curly": ["error", "all"],
        }
    }
);