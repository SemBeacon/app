import { defineConfig, devices } from '@playwright/test';
import baseConfig from './playwright.config';

/**
 * Marketing / QA footage (`yarn playwright test -c playwright.video.config.ts`): records the
 * demo-mode app in WebKit (the engine behind iOS WKWebView) with iPhone and iPad profiles.
 * This is not the iOS Simulator: native BLE is not exercised.
 */
const device = (name: string, width: number, height: number, ua: string) => ({
    name,
    use: {
        userAgent: ua,
        viewport: { width, height },
        deviceScaleFactor: 2,
        isMobile: true,
        hasTouch: true,
        colorScheme: 'light' as const,
        video: { mode: 'on' as const, size: { width: width * 2, height: height * 2 } },
    },
});

export default defineConfig({
    ...baseConfig,
    testDir: 'tests/video',
    outputDir: 'test-results/video',
    retries: 0,
    timeout: 180_000,
    reporter: [['list']],
    projects: [
        device('iphone', 430, 932, devices['iPhone 14'].userAgent),
        device('ipad', 1024, 1366, devices['iPad Pro 11'].userAgent),
    ],
});
