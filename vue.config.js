module.exports = {
    configureWebpack: {
        externals: {
            '@openhps/core': ['OpenHPS', 'core'],
            '@openhps/rf': ['OpenHPS', 'rf'],
            '@openhps/rdf': ['OpenHPS', 'rdf'],
        }
    },
    devServer: {
        open: process.platform === 'darwin',
        host: '0.0.0.0',
        port: 8085,
        https: true,
    },
}
