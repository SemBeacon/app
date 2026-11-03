import type { useBeaconStore } from '@/stores/beacon.scanning';
import type { useBeaconAdvertisingStore } from '@/stores/beacon.advertising';
import type { useGeolocationStore } from '@/stores/geolocation';

declare global {
    interface Window {
        /** Debug API, see src/demo/index.ts */
        SemBeacon?: {
            demo(): Promise<void>;
            debug(): Promise<void>;
            readonly stores: {
                beaconScanning: ReturnType<typeof useBeaconStore>;
                beaconAdvertising: ReturnType<typeof useBeaconAdvertisingStore>;
                geolocation: ReturnType<typeof useGeolocationStore>;
            };
        };
    }
}

export {};
