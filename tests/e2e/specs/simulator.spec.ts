import { test, expect } from '../fixtures';

test('loads the example beacons', async ({ page }) => {
    await page.goto('/beacon/simulator');
    await page.locator('ion-card', { hasText: 'Load example beacons' }).getByText('Load beacons').click();
    // The demo building describes several beacons; all of them must be kept
    await expect(page.locator('.beacon-item').nth(1)).toBeVisible({ timeout: 20_000 });
    await expect(page.locator('ion-card', { hasText: 'Load example beacons' })).toBeHidden();
});
