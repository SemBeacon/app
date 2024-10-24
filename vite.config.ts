import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import copy from 'rollup-plugin-copy';
import monacoEditorPlugin from 'vite-plugin-monaco-editor';
import { resolve } from 'path';
import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill';
import { NodeModulesPolyfillPlugin } from '@esbuild-plugins/node-modules-polyfill';
import basicSsl from '@vitejs/plugin-basic-ssl';
import swc from 'unplugin-swc';

export default defineConfig({
    optimizeDeps: {
        esbuildOptions: {
            plugins: [
                NodeGlobalsPolyfillPlugin({
                    process: true,
                    buffer: true
                }),
                NodeModulesPolyfillPlugin(),
            ]
        }
    },
    resolve: {
        alias: {
          '@': resolve(__dirname, './src'),
        }
    },
    plugins: [
        vue(),
        monacoEditorPlugin({
            languageWorkers: [],
        }),
        copy({
            targets: [
                { 
                    src: 'src/**/BLEScannerWorker.worker.js', 
                    dest: 'public/js/workers',
                    rename: (name, extension) => `${name}.${extension}`
                },
            ],
        }),
        basicSsl({
            name: 'SemBeacon',
            domains: ['localhost:8085'],
        }),
        swc.vite()
    ],
    build: {
        rollupOptions: {
            external: [
                'crypto',
                'path',
                '@openhps/core',
                '@openhps/rf',
                '@openhps/geospatial',
                '@openhps/rdf',
                '@sembeacon/openhps',
                '@openhps/solid/browser'
            ],
            output: {
                globals: {
                    '@openhps/core': 'OpenHPS.core',
                    '@openhps/rf': 'OpenHPS.rf',
                    '@openhps/geospatial': 'OpenHPS.geospatial',
                    '@openhps/rdf': 'OpenHPS.rdf',
                    '@sembeacon/openhps': 'SemBeacon.openhps',
                    '@openhps/solid/browser': 'OpenHPS.solid'
                }
            }
        },
        terserOptions: {
            keep_classnames: true,
        }
    },
    server: {
        open: process.platform === 'darwin',
        host: '0.0.0.0',
        port: 8085,
        watch: {
            usePolling: true,
        }
    }
});
