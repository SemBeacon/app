import { defineConfig, devices } from '@playwright/test';
import baseConfig from './playwright.config';

/**
 * App Store / Play Store screenshots (`yarn screenshots`), written to resources/screenshots.
 * Viewport × deviceScaleFactor gives the pixel size each store expects. The user agent
 * selects Ionic's iOS or Material Design mode.
 */
const store = (
    name: string,
    platform: 'android' | 'ios',
    width: number,
    height: number,
    scale: number,
) => ({
    name,
    metadata: { platform },
    use: {
        userAgent: (platform === 'ios' ? devices['iPhone 14'] : devices['Pixel 7']).userAgent,
        viewport: { width, height },
        deviceScaleFactor: scale,
        isMobile: true,
        hasTouch: true,
    },
});

export default defineConfig({
    ...baseConfig,
    testDir: 'tests/screenshots',
    outputDir: 'test-results/screenshots',
    retries: 0,
    reporter: [['list']],
    projects: [
        store('phone', 'android', 360, 640, 3), // 1080 × 1920
        store('tablet-7', 'android', 600, 960, 2), // 1200 × 1920
        store('tablet-10', 'android', 800, 1280, 2), // 1600 × 2560
        store('iphone-6.9', 'ios', 440, 956, 3), // 1320 × 2868
        store('iphone-6.5', 'ios', 414, 896, 3), // 1242 × 2688
        store('ipad-13', 'ios', 1032, 1376, 2), // 2064 × 2752
    ],
});
