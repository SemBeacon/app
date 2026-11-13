import { test as base, expect, type BrowserContext, type Page } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const HTTP = join(__dirname, 'fixtures', 'http');
const read = (file: string) => readFileSync(join(HTTP, file), 'utf-8');

/**
 * Start time of the page clock. Time keeps running: freezing it (setFixedTime) breaks
 * Ionic's tap handling, which relies on timestamps. Relative times ("5s ago") are masked
 * in screenshots instead (`.relative-time`).
 */
export const START_TIME = new Date('2025-02-01T10:00:00Z');

/** Elements whose content depends on elapsed time. */
export const timeDependent = (page: Page) => [page.locator('.relative-time')];

/**
 * RDF documents served by the mocked CORS proxy, keyed by the requested URI.
 * `finalUrl` mirrors the proxy's x-final-url header (the URI after redirects).
 */
const PROXIED: Record<string, { file: string; finalUrl: string }> = {
    'https://bit.ly/3JsEnF9': {
        file: 'demo-building.ttl',
        finalUrl: 'https://sembeacon.org/examples/openhps2021/beacons.ttl#BEACON_08',
    },
    'https://solid.maximvdw.be/profile/card#me': {
        file: 'solid-profile.ttl',
        finalUrl: 'https://solid.maximvdw.be/profile/card#me',
    },
};

/** CORS headers as sent by the real proxy and shortener services. */
const CORS = {
    'access-control-allow-origin': '*',
    'access-control-expose-headers': 'x-final-url',
};

/**
 * Serve SemBeacon network dependencies from fixtures and block every other
 * external request, so tests never depend on third-party services.
 */
export async function mockNetwork(context: BrowserContext, { allowMapTiles = false } = {}) {
    await context.route(
        (url) => url.hostname !== 'localhost',
        async (route) => {
            const url = new URL(route.request().url());
            if (url.hostname === 's.sembeacon.org' && url.pathname === '/shorten') {
                return route.fulfill({ headers: CORS, body: read('shorten-solid-profile.txt') });
            }
            if (url.hostname === 'proxy.sembeacon.org') {
                const proxied = PROXIED[url.searchParams.get('uri') ?? ''];
                return proxied
                    ? route.fulfill({
                          contentType: 'text/turtle; charset=utf-8',
                          headers: { ...CORS, 'x-final-url': proxied.finalUrl },
                          body: read(proxied.file),
                      })
                    : route.fulfill({ status: 404, headers: CORS });
            }
            if (allowMapTiles && /(^|\.)mapbox\.com$/.test(url.hostname)) {
                return route.continue();
            }
            return route.abort('blockedbyclient');
        },
    );
}

/** ControllerState values (src/stores/types.ts) that mean "still starting". */
const STARTING_STATES = [1 /* INITIALIZING */, 2 /* PENDING */];

/**
 * Enable demo mode (window.SemBeacon.demo, see src/demo): demo beacons in the scanner and
 * simulator. Waits for the scanner and advertiser initialisation to settle first; it
 * would otherwise override the READY state that demo mode sets.
 */
export async function loadDemoBeacons(page: Page) {
    await page
        .waitForFunction(
            (starting) => {
                const stores = window.SemBeacon?.stores;
                return (
                    stores !== undefined &&
                    !starting.includes(stores.beaconScanning.state) &&
                    !starting.includes(stores.beaconAdvertising.state)
                );
            },
            STARTING_STATES,
            { timeout: 30_000 },
        )
        .catch(async (error) => {
            const states = await page.evaluate(() => ({
                scanner: window.SemBeacon?.stores.beaconScanning.state,
                advertiser: window.SemBeacon?.stores.beaconAdvertising.state,
            }));
            throw new Error(`Controllers did not finish starting: ${JSON.stringify(states)}`, {
                cause: error,
            });
        });
    await page.evaluate(() => window.SemBeacon!.demo());
    // Both SemBeacons are resolved through the (mocked) network
    await expect(page.getByText('BEACON_08').first()).toBeVisible({ timeout: 20_000 });
    await expect(page.getByText('Demo User')).toBeVisible({ timeout: 20_000 });
}

/** The Ionic page currently shown (other pages stay in the DOM, hidden). */
export const activePage = (page: Page) => page.locator('.ion-page:not(.ion-page-hidden)').last();

/** Values of the inputs on the active page. */
export const inputValues = (page: Page) =>
    activePage(page)
        .locator('ion-input')
        .evaluateAll((inputs) =>
            inputs.map((input) => (input as unknown as { value?: string }).value),
        );

/** Choose a sort order in the scanner's sort dialog. */
export async function sortScannerBy(
    page: Page,
    label: 'First seen' | 'Last seen' | 'RSSI' | 'Distance',
) {
    await page.locator('ion-button:has(ion-icon[name="swap-vertical"])').click();
    const alert = page.locator('ion-alert');
    await alert.getByText(label, { exact: true }).click();
    await alert.getByRole('button', { name: 'OK' }).click();
    await expect(alert).toBeHidden();
}

export const test = base.extend<{ pageErrors: Error[] }>({
    context: async ({ context }, use) => {
        await mockNetwork(context);
        await use(context);
    },
    page: async ({ page }, use) => {
        await page.clock.install({ time: START_TIME });
        await page.clock.resume();
        await use(page);
    },
    pageErrors: async ({ page }, use) => {
        const errors: Error[] = [];
        page.on('pageerror', (error) => errors.push(error));
        await use(errors);
    },
});

export { expect };
