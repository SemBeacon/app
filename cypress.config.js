const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    supportFile: 'tests/e2e/support/index.js',
    specPattern: 'tests/e2e/specs/**/*.spec.{js,ts}',
    screenshotsFolder: 'tests/e2e/screenshots',
    videosFolder: 'tests/e2e/videos',
    fixturesFolder: 'tests/e2e/fixtures',
    baseUrl: 'http://localhost:42491',
    chromeWebSecurity: false,
    defaultCommandTimeout: 10000,
    pageLoadTimeout: 30000,
    video: false,
  },
});
