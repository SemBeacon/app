import { test, expect, loadDemoBeacons } from '../fixtures';

// Use the demo building location so the map can focus the building's floors
test.use({
    geolocation: { latitude: 50.82062, longitude: 4.39229 },
    permissions: ['geolocation'],
});

test('floor selector always has exactly one selected floor', async ({ page }) => {
    await page.goto('/beacon/scanner');
    await loadDemoBeacons(page);

    // Navigate inside the app: a reload would lose the demo environment
    await page.locator('ion-menu-button').first().click();
    await page.locator('ion-item', { hasText: 'Map' }).first().click();
    await expect(page.locator('.ol-viewport')).toBeVisible();

    // The demo floor plan is in the local example RDF and must have its coverage
    await expect
        .poll(() =>
            page.evaluate(() =>
                [...window.SemBeacon!.stores.environments.floorPlans.values()].map(
                    (map) => map.coverage !== undefined && map.coverage.geometry !== undefined,
                ),
            ),
        )
        .toContain(true);

    await page.waitForFunction(() => window.SemBeacon?.stores.geolocation.location !== undefined);
    await page.locator('#location-center ion-fab-button').click();

    const floorButtons = page.locator('.ol-control.ol-bar .floor-toggle');
    await expect(floorButtons).toHaveCount(2, { timeout: 20_000 });
    await expect(page.locator('.floor-toggle.ol-active')).toHaveCount(1);

    const groundFloor = page.locator('.ol-control.ol-bar .floor-toggle', { hasText: '0' });
    await groundFloor.locator('button').click();
    await expect(page.locator('.floor-toggle.ol-active')).toHaveCount(1);
    await expect(groundFloor).toHaveClass(/ol-active/);

    // Selecting the active floor again keeps it selected (no floor is hidden)
    await groundFloor.locator('button').click();
    await expect(page.locator('.floor-toggle.ol-active')).toHaveCount(1);
    await expect(groundFloor).toHaveClass(/ol-active/);
});
