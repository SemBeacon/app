module.exports = {
    testEnvironment: 'jsdom',
    moduleFileExtensions: ['js', 'ts', 'vue'],
    rootDir: '.',
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1',
        '\\.css$': 'identity-obj-proxy',
        '^@ionic/vue$': '<rootDir>/tests/unit/__mocks__/@ionic-vue.js',
        '^vue-facing-decorator$': '<rootDir>/tests/unit/__mocks__/vue-facing-decorator.js',
        '^@openhps/core$': '<rootDir>/tests/unit/__mocks__/@openhps-core.js',
        '^@openhps/rf$': '<rootDir>/tests/unit/__mocks__/@openhps-rf.js',
        '^@openhps/rdf$': '<rootDir>/tests/unit/__mocks__/@openhps-rdf.js',
        '^@openhps/geospatial$': '<rootDir>/tests/unit/__mocks__/@openhps-geospatial.js',
        '^@openhps/solid$': '<rootDir>/tests/unit/__mocks__/@openhps-solid.js',
        '^@sembeacon/openhps$': '<rootDir>/tests/unit/__mocks__/@sembeacon-openhps.js',
    },
    transform: {
        '^.+\\.ts$': ['ts-jest', { tsconfig: 'tsconfig.json' }],
        '^.+\\.vue$': '@vue/vue3-jest',
    },
    transformIgnorePatterns: [
        '/node_modules/(?!@ionic/vue|@ionic/vue-router|@ionic/core|@stencil/core|ionicons)',
    ],
    testMatch: ['**/tests/unit/**/*.spec.ts'],
    setupFilesAfterEnv: ['<rootDir>/tests/unit/setup.ts'],
};
