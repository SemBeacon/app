import { test, expect, loadDemoBeacons, sortScannerBy, inputValues } from '../fixtures';

test('explains that scanning is unsupported without Web Bluetooth', async ({ page }) => {
    await page.goto('/beacon/scanner');
    const banner = page.locator('ion-item[color="danger"]');
    await expect(banner).toContainText('not supported');
    // Opening the system settings cannot help here
    await expect(banner.getByText('Edit')).toHaveCount(0);
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
        await expect(page).toHaveURL(/\/beacon\/(?!scanner$)[^/]+$/);
        await expect(page.locator('ion-title', { hasText: 'Beacon details' })).toBeVisible();
        // The beacon itself is shown, not the generic loading placeholder
        await expect.poll(() => inputValues(page)).toEqual(
            expect.arrayContaining(['BEACON_08', 'c187d748']),
        );
    });

    test('remembers every sort option, including distance', async ({ page }) => {
        await sortScannerBy(page, 'Distance');
        await page.locator('ion-button:has(ion-icon[name="funnel"])').click();
        const distance = page.locator('ion-alert .alert-radio-button', { hasText: 'Distance' });
        await expect(distance).toHaveAttribute('aria-checked', 'true');
    });

    test('keeps detected beacons after a reload', async ({ page }) => {
        await page.reload();
        await expect(page.locator('.beacon-item', { hasText: 'https://maximvdw.be' })).toBeVisible();
    });
});
