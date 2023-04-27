module.exports = {
    configureWebpack: {
        externals: {
            '@openhps/core': ['OpenHPS', 'core'],
            '@openhps/rf': ['OpenHPS', 'rf'],
            '@openhps/rdf': ['OpenHPS', 'rdf'],
            '@openhps/solid/browser': ['OpenHPS', 'solid']
        }
    },
    devServer: {
        open: process.platform === 'darwin',
        host: '0.0.0.0',
        port: 8085,
        https: true,
    },
}
