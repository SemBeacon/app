import { test, expect } from '../fixtures';

test('settings lists the known beacon UUIDs', async ({ page }) => {
    await page.goto('/settings');
    await expect(page.getByText('SemBeacon DEMO')).toBeVisible();
    await expect(page.getByText('77f340db-ac0d-20e8-aa3a-f656a29f236c')).toBeVisible();
});

test('map page renders an OpenLayers map', async ({ page }) => {
    await page.goto('/map');
    await expect(page.locator('.ol-viewport').first()).toBeVisible();
});
