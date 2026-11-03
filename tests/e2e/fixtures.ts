import { test as base, expect, type BrowserContext, type Page } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const HTTP = join(__dirname, 'fixtures', 'http');
const read = (file: string) => readFileSync(join(HTTP, file), 'utf-8');

/** Fixed "now" so relative times ("5 min ago") render the same on every run. */
export const FIXED_NOW = new Date('2025-02-01T10:00:00Z');

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

/** Load the built-in demo beacons (window.SemBeacon.debug, see stores/beacon.scanning.ts). */
export async function loadDemoBeacons(page: Page) {
    await page.waitForFunction(() => typeof window.SemBeacon?.debug === 'function');
    await page.evaluate(() => window.SemBeacon.debug());
    await expect(page.getByText('BEACON_08')).toBeVisible({ timeout: 20_000 });
}

export const test = base.extend<{ pageErrors: Error[] }>({
    context: async ({ context }, use) => {
        await mockNetwork(context);
        await use(context);
    },
    page: async ({ page }, use) => {
        await page.clock.setFixedTime(FIXED_NOW);
        await use(page);
    },
    pageErrors: async ({ page }, use) => {
        const errors: Error[] = [];
        page.on('pageerror', (error) => errors.push(error));
        await use(errors);
    },
});

export { expect };
