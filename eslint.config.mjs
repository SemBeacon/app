import pluginVue from 'eslint-plugin-vue';
import { defineConfigWithVueTs, vueTsConfigs } from '@vue/eslint-config-typescript';
import prettierConfig from 'eslint-config-prettier';
import globals from 'globals';

export default defineConfigWithVueTs(
    {
        ignores: [
            'dist/**',
            'coverage/**',
            'android/**',
            'ios/**',
            'public/js/**',
            'resources/**',
            'playwright-report/**',
            'test-results/**',
            'src/components.d.ts',
            'src/ontologies/**',
        ],
    },
    pluginVue.configs['flat/recommended'],
    vueTsConfigs.recommended,
    {
        languageOptions: {
            ecmaVersion: 'latest',
            globals: {
                ...globals.browser,
            },
        },
        rules: {
            'no-console': 'off',
            'no-debugger': 'warn',
            'vue/no-deprecated-slot-attribute': 'off',
            // Ionic emits camelCase custom events (ionChange, ionInput, ...)
            'vue/v-on-event-hyphenation': 'off',
            '@typescript-eslint/no-explicit-any': 'off',
            '@typescript-eslint/ban-ts-comment': 'off',
            '@typescript-eslint/no-unused-vars': [
                'error',
                { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
            ],
        },
    },
    {
        files: ['src/workers/**/*.js'],
        languageOptions: {
            globals: {
                ...globals.worker,
                importScripts: 'readonly',
            },
        },
    },
    {
        files: ['scripts/**/*.js', '*.config.{js,ts,mjs}', '.prettierrc.js'],
        languageOptions: {
            globals: {
                ...globals.node,
            },
        },
        rules: {
            '@typescript-eslint/no-require-imports': 'off',
        },
    },
    // Formatting is handled by prettier (`yarn format`), not by lint rules.
    prettierConfig,
);
