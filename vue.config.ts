import { defineConfig } from '@vue/cli-service';
import CopyPlugin from "copy-webpack-plugin";
import MonacoWebpackPlugin from "monaco-editor-webpack-plugin";
import TerserPlugin from "terser-webpack-plugin";

export default defineConfig({
  configureWebpack: {
    optimization: {
      minimize: true,
      minimizer: [new TerserPlugin({
        exclude: [/public/gi, /js\/vendor/gi],
        parallel: true,
        terserOptions: {
          compress: {
            // turn off flags with small gains to speed up minification
            arrows: false,
            collapse_vars: false, // 0.3kb
            comparisons: false,
            computed_props: false,
            hoist_funs: false,
            hoist_props: false,
            hoist_vars: false,
            inline: false,
            loops: false,
            negate_iife: false,
            properties: false,
            reduce_funcs: false,
            reduce_vars: false,
            switches: false,
            toplevel: false,
            typeofs: false,
    
            // a few flags with noticeable gains/speed ratio
            // numbers based on out of the box vendor bundle
            booleans: true, // 0.7kb
            if_return: true, // 0.4kb
            sequences: true, // 0.7kb
            unused: true, // 2.3kb
    
            // required features to drop conditional branches
            conditionals: true,
            dead_code: true,
            evaluate: true,

            drop_console: true
          },
          mangle: {
            safari10: true
          }
        }
      })],
    },
    externals: {
      'path': [],
      '@openhps/core': ['OpenHPS', 'core'],
      '@openhps/rf': ['OpenHPS', 'rf'],
      '@openhps/geospatial': ['OpenHPS', 'geospatial'],
      '@openhps/rdf': ['OpenHPS', 'rdf'],
      '@sembeacon/openhps': ['SemBeacon', 'openhps'],
      '@openhps/solid/browser': ['OpenHPS', 'solid'],
    },
    plugins: [
      new MonacoWebpackPlugin({
        languages: [],
        features: ["find"],
      }),
      new CopyPlugin({
        patterns: [
          { 
            from: "src/**/*.worker.js", 
            to: "js/workers/[name].js",
          },
        ],
      })
    ]
  },
  devServer: {
    open: process.platform === 'darwin',
    host: '0.0.0.0',
    port: 8085,
    https: true,
  },
});
