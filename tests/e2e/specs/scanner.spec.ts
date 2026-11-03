import { test, expect, loadDemoBeacons } from '../fixtures';

test('explains that scanning is unavailable without Web Bluetooth', async ({ page }) => {
    await page.goto('/beacon/scanner');
    await expect(page.locator('ion-item[color="danger"]')).toBeVisible();
    await expect(page.locator('ion-fab-button')).toHaveClass(/fab-button-disabled/);
});

test.describe('with demo beacons', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/beacon/scanner');
        await loadDemoBeacons(page);
    });

    test('lists beacons of each type', async ({ page }) => {
        const items = page.locator('.beacon-item');
        await expect(items.filter({ hasText: 'BEACON_08' })).toBeVisible();
        await expect(items.filter({ hasText: 'Major' }).first()).toBeVisible();
        await expect(items.filter({ hasText: 'https://maximvdw.be' })).toBeVisible();
        await expect(items.filter({ hasText: 'Voltage' })).toBeVisible();
    });

    test('opens the detail page of a SemBeacon', async ({ page }) => {
        await page.locator('.beacon-item', { hasText: 'BEACON_08' }).locator('ion-grid').click();
        await expect(page).toHaveURL(/\/beacon\/[^/]+$/);
        await expect(page.getByText('c187d748').first()).toBeVisible();
    });

    test('keeps detected beacons after a reload', async ({ page }) => {
        await page.reload();
        await expect(page.locator('.beacon-item', { hasText: 'https://maximvdw.be' })).toBeVisible();
    });
});
