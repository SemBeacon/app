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
        // Resolve like the browser build. OpenHPS packages without an `exports` map
        // (e.g. @openhps/rf, typedjson) would otherwise load their CJS `main`, and their
        // decorator metadata would no longer match the ESM @openhps/core.
        mainFields: ['module', 'jsnext:main', 'jsnext', 'main'],
    },
    test: {
        environment: 'happy-dom',
        globals: true,
        include: ['tests/unit/**/*.spec.ts'],
        setupFiles: ['tests/unit/setup.ts'],
        server: {
            deps: {
                // The OpenHPS ESM builds use directory imports that Node's ESM loader
                // rejects; inline their own dist code (not their nested node_modules).
                inline: [/@ionic\//, /ionicons/, /@(openhps|sembeacon)\/[^/]+\/dist\//],
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
