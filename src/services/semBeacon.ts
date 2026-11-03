import { BLESemBeacon, SemBeaconService } from '@sembeacon/openhps';
import { BLEBeaconObject } from '@openhps/rf';
import { CapacitorPreferencesDriver } from '@openhps/capacitor-preferences';
import { IriString } from '@openhps/rdf';
import { config } from '@/config';

/** Shorten a SemBeacon resource URI so it fits in an advertisement. */
export async function shortenUrl(url: string): Promise<string> {
    const response = await fetch(`${config.shortenerUrl}&uri=${encodeURIComponent(url)}`);
    return response.text();
}

/**
 * The SemBeacon data service: stores detected beacons (Capacitor Preferences) and resolves
 * SemBeacon resource URIs. Shared by the scanner model and the UI.
 */
export const semBeaconService = new SemBeaconService(
    new CapacitorPreferencesDriver(BLESemBeacon, {
        namespace: 'sembeacon',
    }),
    {
        urlShortener: shortenUrl,
        cors: config.corsProxyUrl as IriString,
        uid: 'sembeacon-service',
        timeout: 15000,
        minTimeout: 60000,
    },
);

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
