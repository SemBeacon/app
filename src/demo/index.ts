import { useBeaconStore } from '@/stores/beacon.scanning';
import { useBeaconAdvertisingStore } from '@/stores/beacon.advertising';
import { useGeolocationStore } from '@/stores/geolocation';
import { useEnvironmentStore } from '@/stores/environment';
import { useLogger } from '@/stores/logger';
import { ControllerState } from '@/stores/types';
import { setResourceProvider } from '@/services/semBeacon';
import { createDemoSimulatedBeacons } from './demoBeacons';
import { demoFetch, demoShorten } from './DemoResources';

/**
 * Show the app with demo data, without Bluetooth hardware: detected beacons in the
 * scanner and simulated beacons in the simulator. Used for development, e2e tests and
 * store screenshots. Note: demo beacons are persisted like real ones.
 */
export async function enableDemoMode(): Promise<void> {
    const logger = useLogger();
    logger.log('info', 'Enabling demo mode');

    // Demo resources are served from the app bundle, so the demo also works without
    // internet (e.g. on a conference Wi-Fi network). Must be set before adding beacons.
    setResourceProvider(demoFetch, demoShorten);

    const scanner = useBeaconStore();
    await scanner.load();
    scanner.state = ControllerState.READY;
    scanner.demoMode = true;
    await scanner.addDemoBeacons();

    const advertiser = useBeaconAdvertisingStore();
    advertiser.state = ControllerState.READY;
    for (const beacon of await createDemoSimulatedBeacons()) {
        await advertiser.addSimulatedBeacon(beacon.uid, beacon);
    }
}

/**
 * Debug API on `window.SemBeacon` (browser console, e2e tests):
 * - `SemBeacon.demo()` enables demo mode (`debug()` is kept as an alias)
 * - `SemBeacon.stores` gives access to the Pinia stores
 */
export function registerDebugApi(): void {
    window.SemBeacon = {
        demo: enableDemoMode,
        debug: enableDemoMode,
        get stores() {
            return {
                beaconScanning: useBeaconStore(),
                beaconAdvertising: useBeaconAdvertisingStore(),
                geolocation: useGeolocationStore(),
                environments: useEnvironmentStore(),
            };
        },
    };
}
