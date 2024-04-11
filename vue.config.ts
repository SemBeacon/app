import { defineConfig } from '@vue/cli-service';
import CopyPlugin from "copy-webpack-plugin";
import MonacoWebpackPlugin from "monaco-editor-webpack-plugin";
import * as path from "path";	

export default defineConfig({
  pluginOptions: {
    webpackBundleAnalyzer: {
      openAnalyzer: false,
      reportFilename: path.join(__dirname, "report.html")
    }
  },
  terser: {
    minify: 'terser',
    terserOptions: {
      keep_classnames: true,
    },
  },
  configureWebpack: {
    resolve: {
      symlinks: false,
      alias: {
        vue: path.resolve('./node_modules/vue')
      }
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
            from: "src/**/BLEScannerWorker.worker.js", 
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
