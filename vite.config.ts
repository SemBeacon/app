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
                    buffer: false,
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
        swc.vite(),
    ],
    build: {
        rollupOptions: {
            output: {
                paths: {
                    '@openhps/core': '/js/vendor/openhps/openhps-core.es.min.js',
                    '@openhps/rf': '/js/vendor/openhps/openhps-rf.es.min.js',
                    '@openhps/geospatial': '/js/vendor/openhps/openhps-geospatial.es.min.js',
                    '@openhps/rdf': '/js/vendor/openhps/openhps-rdf.all.es.min.js',
                    '@sembeacon/openhps': '/js/vendor/openhps/sembeacon-openhps.es.min.js'
                }
            },
            external: [
                'crypto',
                'path',
                '@openhps/core',
                '@openhps/rf',
                '@openhps/geospatial',
                '@openhps/rdf',
                '@sembeacon/openhps'
            ],
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
