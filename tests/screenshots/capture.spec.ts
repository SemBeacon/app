import { test as base, expect, type Page } from '@playwright/test';
import { join } from 'node:path';
import { mockNetwork, loadDemoBeacons, sortScannerBy, inputValues } from '../e2e/fixtures';

const OUTPUT = join(__dirname, '..', '..', 'resources', 'screenshots');

const test = base.extend({
    context: async ({ context }, use) => {
        // Real map tiles look better in the stores; everything else comes from fixtures
        await mockNetwork(context, { allowMapTiles: true });
        await use(context);
    },
});

const platformOf = () => (test.info().project.metadata as { platform: 'android' | 'ios' }).platform;

async function capture(page: Page, theme: string, name: string) {
    const info = test.info();
    const platform = platformOf();
    await page.waitForLoadState('networkidle');
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(800);
    await page.screenshot({
        path: join(OUTPUT, platform, info.project.name, theme, `${name}.png`),
        animations: 'disabled',
        caret: 'hide',
    });
}

for (const colorScheme of ['light', 'dark'] as const) {
    test.describe(colorScheme, () => {
        test.use({ colorScheme });

        test('store screenshots', async ({ page }) => {
            await page.goto('/beacon/scanner');
            await loadDemoBeacons(page);
            await sortScannerBy(page, 'RSSI');
            await capture(page, colorScheme, '01-scanner');

            await page
                .locator('.beacon-item', { hasText: 'BEACON_08' })
                .locator('ion-grid')
                .click();
            await expect.poll(() => inputValues(page)).toContain('BEACON_08');
            await capture(page, colorScheme, '02-semBeacon');

            // Navigate inside the app: a reload would leave demo mode
            await page.goBack();
            // The iOS app has no simulator (advertising is Android-only); the web build
            // cannot reproduce that, so iOS simulator shots are left out.
            if (platformOf() === 'android') {
                await page.locator('ion-segment-button', { hasText: 'Simulator' }).click();
                await expect(page).toHaveURL(/\/beacon\/simulator$/);
                await expect(page.locator('.beacon-item').first()).toBeVisible();
                await capture(page, colorScheme, '03-simulator');
                await page.locator('ion-segment-button', { hasText: 'Scanner' }).click();
            }

            // Tablets show the menu next to the content (split pane)
            const menuButton = page.locator('ion-menu-button').first();
            if (await menuButton.isVisible()) {
                await menuButton.click();
                await expect(page.locator('ion-menu')).toBeVisible();
            }
            await capture(page, colorScheme, '04-menu');
        });
    });
}
