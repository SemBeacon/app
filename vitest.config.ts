import { defineConfig } from 'vitest/config';
import vue from '@vitejs/plugin-vue';
import swc from 'unplugin-swc';
import { resolve } from 'path';

// Kept separate from vite.config.ts: the app config adds SSL, monaco and file-copy
// plugins that are irrelevant (and slow) for unit tests.
export default defineConfig({
    plugins: [vue(), swc.vite()],
    resolve: {
        alias: {
            '@': resolve(__dirname, './src'),
        },
    },
    test: {
        environment: 'happy-dom',
        globals: true,
        include: ['tests/unit/**/*.spec.ts'],
        setupFiles: ['tests/unit/setup.ts'],
        server: {
            deps: {
                inline: [/@ionic\//, /ionicons/],
            },
        },
        coverage: {
            provider: 'v8',
            include: ['src/**/*.{ts,vue}'],
            exclude: ['src/ontologies/**', 'src/components.d.ts', 'src/**/*.d.ts'],
            reporter: ['text-summary', 'html', 'lcov'],
        },
    },
});
