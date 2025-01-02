import typescriptEslint from "@typescript-eslint/eslint-plugin";
import _import from "eslint-plugin-import";
import jsdoc from "eslint-plugin-jsdoc";
import { fixupPluginRules } from "@eslint/compat";
import globals from "globals";
import path from "node:path";
import { fileURLToPath } from "node:url";
import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all
});

export default [{
    ignores: ["public/js/*"],
}, ...compat.extends(
    "plugin:vue/vue3-essential",
    "eslint:recommended",
    "@vue/typescript/recommended",
    "plugin:vue/recommended",
    "plugin:prettier-vue/recommended",
), {
    plugins: {
        "@typescript-eslint": typescriptEslint,
        import: fixupPluginRules(_import),
        jsdoc,
    },

    languageOptions: {
        globals: {
            ...globals.node,
        },

        ecmaVersion: "next",
    },

    rules: {
        "no-console": "off",
        "no-debugger": "off",
        "vue/no-deprecated-slot-attribute": "off",
        "@typescript-eslint/no-explicit-any": "off",
        "@typescript-eslint/ban-ts-comment": "off",
        "prettier-vue/prettier": ["warn"],
    },
}, {
    files: ["**/__tests__/*.{j,t}s?(x)", "**/tests/unit/**/*.spec.{j,t}s?(x)"],

    languageOptions: {
        globals: {
            ...globals.jest,
        },
    },
}];