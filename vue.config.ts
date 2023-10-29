import { defineConfig } from '@vue/cli-service';
import CopyPlugin from "copy-webpack-plugin";

export default defineConfig({
  chainWebpack: config => {
    config.module
      .rule('js')
      .exclude.add(/\.worker\.js$/);
    config.externals( {
      '@openhps/core': ['OpenHPS', 'core'],
      '@openhps/rf': ['OpenHPS', 'rf'],
      '@openhps/geospatial': ['OpenHPS', 'geospatial'],
      '@openhps/rdf': ['OpenHPS', 'rdf'],
      '@sembeacon/openhps': ['SemBeacon', 'openhps'],
      '@openhps/solid/browser': ['OpenHPS', 'solid'],
    });
    config.plugin("copy").use(CopyPlugin, [{
      patterns: [
        { 
          from: "public", 
          globOptions: {
            ignore: ["**/index.html"]
          } 
        },
        { from: "src/**/*.worker.js", to: "js/workers/[name].js" },
      ],
    } as CopyPlugin.PluginOptions]);
  },
  devServer: {
    open: process.platform === 'darwin',
    host: '0.0.0.0',
    port: 8085,
    https: true,
  },
});
