import { test, expect } from '../fixtures';

test('opens the scanner by default', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL(/\/beacon\/scanner$/);
    await expect(page.locator('ion-title', { hasText: 'Beacon' }).first()).toBeVisible();
});

test.describe('side menu', () => {
    for (const [title, path] of [
        ['Simulator', '/beacon/simulator'],
        ['Map', '/map'],
        ['Scanner', '/beacon/scanner'],
    ]) {
        test(`navigates to ${title}`, async ({ page }) => {
            await page.goto('/beacon/scanner');
            await page.locator('ion-menu-button').first().click();
            await page.locator('ion-menu ion-item', { hasText: title }).click();
            await expect(page).toHaveURL(new RegExp(`${path}$`));
        });
    }
});

test('starts without uncaught errors', async ({ page, pageErrors }) => {
    await page.goto('/');
    await expect(page.locator('ion-app')).toBeVisible();
    // Give the stores time to initialise (scanner model, logger, settings)
    await page.waitForTimeout(3000);
    expect(pageErrors.map((e) => e.message)).toEqual([]);
});
