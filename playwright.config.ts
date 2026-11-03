import { defineConfig, devices } from '@playwright/test';

const PORT = 4173;

/**
 * E2E and visual regression tests against the production web build.
 * Visual baselines are only valid when generated in the pinned Playwright Docker
 * image (`yarn test:visual:update`); fonts differ between host systems.
 */
export default defineConfig({
    testDir: 'tests/e2e',
    outputDir: 'test-results',
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 1 : 0,
    reporter: process.env.CI ? [['html', { open: 'never' }], ['github']] : [['list']],
    timeout: 60_000,
    expect: {
        toHaveScreenshot: {
            maxDiffPixelRatio: 0.01,
            animations: 'disabled',
            caret: 'hide',
        },
    },
    snapshotPathTemplate: '{testDir}/__screenshots__/{projectName}/{arg}{ext}',
    use: {
        baseURL: `https://localhost:${PORT}`,
        // vite preview serves a self-signed certificate (@vitejs/plugin-basic-ssl)
        ignoreHTTPSErrors: true,
        trace: 'retain-on-failure',
        screenshot: 'only-on-failure',
    },
    projects: [
        {
            name: 'chromium-mobile',
            testDir: 'tests/e2e/specs',
            use: { ...devices['Pixel 7'] },
        },
        {
            name: 'webkit-mobile',
            testDir: 'tests/e2e/specs',
            use: { ...devices['iPhone 14'] },
        },
        {
            name: 'visual-android',
            testDir: 'tests/e2e/visual',
            use: { ...devices['Pixel 7'] },
        },
        {
            name: 'visual-ios',
            testDir: 'tests/e2e/visual',
            use: { ...devices['iPhone 14'] },
        },
    ],
    webServer: {
        command: `npm run build && npm run serve -- --port ${PORT} --strictPort`,
        url: `https://localhost:${PORT}`,
        ignoreHTTPSErrors: true,
        reuseExistingServer: !process.env.CI,
        timeout: 180_000,
    },
});
