import { test, expect, loadDemoBeacons, sortScannerBy, timeDependent } from '../fixtures';
import type { Page } from '@playwright/test';

/** Wait until Ionic finished rendering and transitions settled. */
async function settle(page: Page) {
    await page.waitForLoadState('networkidle');
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(500);
}

for (const colorScheme of ['light', 'dark'] as const) {
    test.describe(`${colorScheme} theme`, () => {
        test.use({ colorScheme });

        test('scanner without Bluetooth', async ({ page }) => {
            await page.goto('/beacon/scanner');
            await expect(page.locator('ion-item[color="danger"]')).toBeVisible();
            await settle(page);
            await expect(page).toHaveScreenshot(`scanner-unavailable-${colorScheme}.png`);
        });

        test('scanner with beacons', async ({ page }) => {
            await page.goto('/beacon/scanner');
            await loadDemoBeacons(page);
            // "First seen" depends on resolution timing in a Web Worker, which the fixed
            // clock does not control. All demo beacons share one RSSI, so this sorts by UID.
            await sortScannerBy(page, 'RSSI');
            await settle(page);
            await expect(page).toHaveScreenshot(`scanner-beacons-${colorScheme}.png`, {
                mask: timeDependent(page),
            });
        });

        test('SemBeacon details', async ({ page }) => {
            await page.goto('/beacon/scanner');
            await loadDemoBeacons(page);
            await settle(page);
            await page.locator('.beacon-item', { hasText: 'BEACON_08' }).locator('ion-grid').click();
            await expect(page).toHaveURL(/\/beacon\/(?!scanner$)[^/]+$/);
            await expect(page.locator('ion-title', { hasText: 'Beacon details' })).toBeVisible();
            await expect(page.locator('ion-content').getByText('BEACON_08').first()).toBeVisible();
            await settle(page);
            await expect(page).toHaveScreenshot(`semBeacon-details-${colorScheme}.png`, {
                mask: [page.locator('.ol-viewport'), ...timeDependent(page)],
            });
        });

        test('simulator', async ({ page }) => {
            await page.goto('/beacon/simulator');
            await expect(page.getByText('Load example beacons')).toBeVisible();
            await settle(page);
            await expect(page).toHaveScreenshot(`simulator-${colorScheme}.png`);
        });

        test('menu', async ({ page }) => {
            await page.goto('/beacon/scanner');
            await page.locator('ion-menu-button').first().click();
            await expect(page.locator('ion-menu')).toBeVisible();
            await settle(page);
            await expect(page).toHaveScreenshot(`menu-${colorScheme}.png`);
        });

        test('settings', async ({ page }) => {
            await page.goto('/settings');
            await expect(page.getByText('SemBeacon DEMO')).toBeVisible();
            await settle(page);
            await expect(page).toHaveScreenshot(`settings-${colorScheme}.png`);
        });
    });
}
