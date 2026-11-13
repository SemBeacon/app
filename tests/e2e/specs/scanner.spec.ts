import { test, expect, loadDemoBeacons, sortScannerBy, inputValues, activePage } from '../fixtures';

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
        await expect
            .poll(() => inputValues(page))
            .toEqual(expect.arrayContaining(['BEACON_08', 'c187d748']));
    });

    test('shows the RDF description of a SemBeacon in the code editor', async ({ page }) => {
        await page.locator('.beacon-item', { hasText: 'BEACON_08' }).locator('ion-grid').click();
        await page.locator('ion-button:has(ion-icon[name="code-slash-outline"])').click();
        await expect(page).toHaveURL(/\/beacon\/edit\/[^/]+\/code$/);
        const editor = page.locator('.monaco-editor').first();
        await expect(editor).toBeVisible();
        // Turtle content with the SemBeacon vocabulary, highlighted by the TextMate grammar
        await expect(editor.locator('.view-lines')).toContainText('sembeacon');
    });

    test('remembers every sort option, including distance', async ({ page }) => {
        await sortScannerBy(page, 'Distance');
        await page.locator('ion-button:has(ion-icon[name="swap-vertical"])').click();
        const distance = page.locator('ion-alert .alert-radio-button', { hasText: 'Distance' });
        await expect(distance).toHaveAttribute('aria-checked', 'true');
    });

    test('filters SemBeacons by all selected flags and hides other types', async ({ page }) => {
        await page.getByRole('button', { name: 'Filter beacons' }).click();
        const alert = page.locator('ion-alert');
        await alert.getByText('Moving', { exact: true }).click();
        await alert.getByRole('button', { name: 'Apply' }).click();
        await expect(alert).toBeHidden();

        await expect(page.locator('.filter-button.filter-active')).toHaveCount(1);
        await expect(page.locator('.beacon-item')).toHaveCount(1);
        await expect(page.locator('.beacon-item')).toContainText('Demo User');

        // Reset restores all beacon types
        await page.getByRole('button', { name: 'Filter beacons' }).click();
        const resetAlert = page.locator('ion-alert');
        await resetAlert.getByRole('button', { name: 'Reset' }).click();
        await expect(resetAlert).toBeHidden();
        await expect(page.locator('.beacon-item').filter({ hasText: 'BEACON_08' })).toBeVisible();
        await expect(page.locator('.filter-button.filter-active')).toHaveCount(0);
    });

    test('keeps an unresolved SemBeacon visible and retries it', async ({ page }) => {
        const uid = await page.evaluate(() => {
            const store = window.SemBeacon!.stores.beaconScanning;
            const beacon = [...store.beacons.values()].find(
                (candidate: any) => candidate.displayName === 'BEACON_08',
            ) as any;
            store.setResolutionError(beacon.uid, 'offline');
            return beacon.uid as string;
        });
        await expect(page.getByText('Beacon details unavailable')).toBeVisible();
        await expect(page.locator('.beacon-item', { hasText: 'Offline' })).toBeVisible();

        await page.getByRole('button', { name: 'Retry' }).click();
        await expect(page.getByText('Beacon details unavailable')).toBeHidden();
        await expect(
            page.evaluate(
                (beaconUID) =>
                    window.SemBeacon!.stores.beaconScanning.findBeaconInfo(beaconUID)
                        ?.resolutionError,
                uid,
            ),
        ).resolves.toBeUndefined();
    });

    test('shows the offline error on the SemBeacon detail page and retries', async ({ page }) => {
        await page.evaluate(() => {
            const store = window.SemBeacon!.stores.beaconScanning;
            const beacon = [...store.beacons.values()].find(
                (candidate: any) => candidate.displayName === 'BEACON_08',
            ) as any;
            store.setResolutionError(beacon.uid, 'offline');
        });
        await page.locator('.beacon-item', { hasText: 'BEACON_08' }).locator('ion-grid').click();
        await expect(page.getByText('SemBeacon details unavailable')).toBeVisible();

        const errorCard = activePage(page).locator('ion-card', {
            hasText: 'SemBeacon details unavailable',
        });
        await errorCard.getByRole('button', { name: 'Retry' }).click();
        await expect(errorCard).toBeHidden();
        // The page must stay on the detail view, not navigate to the simulator
        await expect(page).toHaveURL(/\/beacon\/(?!scanner$)[^/]+$/);
    });

    test('shows a clear offline message', async ({ page }) => {
        await page.evaluate(() => {
            Object.defineProperty(navigator, 'onLine', { configurable: true, value: false });
            window.dispatchEvent(new Event('offline'));
        });
        await expect(page.getByText('You are offline')).toBeVisible();
        await expect(
            page.getByText(
                'Detected beacons are shown, but their online information cannot be loaded.',
            ),
        ).toBeVisible();
    });

    test('shows and actuates the SemBeacon 1.1 semantic data', async ({ page }) => {
        await page.locator('.beacon-item', { hasText: 'Smart light' }).locator('ion-grid').click();
        await expect(page.getByText('Semantic data')).toBeVisible();
        await expect(page.getByText('21.5 DEG C')).toBeVisible();

        const lamp = page.locator('ion-item', { hasText: 'Lamp' }).last();
        await expect(lamp).toContainText('false');
        await lamp.locator('ion-toggle').click();
        await expect(lamp).toContainText('true');
    });

    test('keeps detected beacons after a reload', async ({ page }) => {
        await page.reload();
        await expect(
            page.locator('.beacon-item', { hasText: 'https://maximvdw.be' }),
        ).toBeVisible();
    });
});
