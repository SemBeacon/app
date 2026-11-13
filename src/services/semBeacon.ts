import { BLESemBeacon, SemBeaconService, SemBeaconServiceOptions } from '@sembeacon/openhps';
import { BLEBeaconObject } from '@openhps/rf';
import { CapacitorPreferencesDriver } from '@openhps/capacitor-preferences';
import { IriString } from '@openhps/rdf';
import { config } from '@/config';
import { getShortenIntegrityHeaders } from './appIntegrity';

/** Shorten a SemBeacon resource URI so it fits in an advertisement. */
export async function shortenUrl(url: string): Promise<string> {
    let apiKey = '';
    try {
        apiKey = new URL(config.shortenerUrl).searchParams.get('api') ?? '';
    } catch {
        // A relative override cannot be attested; use the anonymous tier.
    }
    const headers = await getShortenIntegrityHeaders(apiKey, url);
    const response = await fetch(`${config.shortenerUrl}&uri=${encodeURIComponent(url)}`, {
        headers,
    });
    return response.text();
}

/**
 * The SemBeacon data service: stores detected beacons (Capacitor Preferences) and resolves
 * SemBeacon resource URIs. Shared by the scanner model and the UI.
 */
const semBeaconOptions: SemBeaconServiceOptions = {
    urlShortener: shortenUrl,
    cors: config.corsProxyUrl as IriString,
    uid: 'sembeacon-service',
    timeout: 15000,
    minTimeout: 60000,
};

export const semBeaconService = new SemBeaconService(
    new CapacitorPreferencesDriver(BLESemBeacon, {
        namespace: 'sembeacon',
    }),
    semBeaconOptions,
);

/**
 * Replace the resource fetcher (and URL shortener), e.g. to serve demo resources from the
 * app bundle so demo mode also works without internet.
 */
export function setResourceProvider(
    fetcher: typeof globalThis.fetch,
    urlShortener?: (url: string) => Promise<string>,
): void {
    semBeaconOptions.fetch = fetcher as unknown as SemBeaconServiceOptions['fetch'];
    semBeaconOptions.urlShortener = urlShortener;
    semBeaconService.fetch = fetcher as unknown as typeof globalThis.fetch;
}

/**
 * Store a detected beacon and resolve with the stored (for SemBeacons: resolved) beacon.
 *
 * Works around @sembeacon/openhps 1.7.x: SemBeaconService.insert() never settles for
 * non-SemBeacon objects (its else-branch stores the beacon and emits 'beacon' but does not
 * resolve). For those, wait for the 'beacon' event instead.
 */
export function storeBeacon<T extends BLEBeaconObject>(beacon: T): Promise<T> {
    if (beacon instanceof BLESemBeacon) {
        return semBeaconService.insert(beacon.uid, beacon) as Promise<T>;
    }
    return new Promise((resolve, reject) => {
        const onBeacon = (stored: BLEBeaconObject) => {
            if (stored.uid === beacon.uid) {
                semBeaconService.removeListener('beacon', onBeacon);
                resolve(stored as T);
            }
        };
        semBeaconService.on('beacon', onBeacon);
        semBeaconService.insert(beacon.uid, beacon).catch((err) => {
            semBeaconService.removeListener('beacon', onBeacon);
            reject(err);
        });
    });
}
