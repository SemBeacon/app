/**
 * External endpoints and keys, from VITE_* variables (see .env.example). The SemBeacon
 * services have defaults; the Mapbox token must be provided (local .env, CI secret
 * MAPBOX_TOKEN), otherwise maps and geocoding do not load.
 * Keep src/workers/BLEScannerWorker.worker.js in sync: it is not bundled and cannot import
 * this module.
 */
const env = import.meta.env;

export const config = {
    /** URL shortener for SemBeacon resource URIs (returns the short URL as text). */
    shortenerUrl: env.VITE_SHORTENER_URL ?? 'https://s.sembeacon.org/shorten?api=Y5Y2SRZ2zo',
    /** CORS proxy prefix for fetching SemBeacon resources; the target URI is appended. */
    corsProxyUrl: env.VITE_CORS_PROXY_URL ?? 'https://proxy.sembeacon.org/?api=xWzD9b4eRBdWz&uri=',
    /** Mapbox access token (pk.*) for map tiles and geocoding. */
    mapboxToken: env.VITE_MAPBOX_TOKEN,
    /**
     * Google Cloud project number linked to Play Console for Play Integrity.
     * 0 disables integrity checks (requests use the anonymous tier).
     */
    playIntegrityCloudProject: Number(env.VITE_PLAY_INTEGRITY_CLOUD_PROJECT ?? 0),
} as const;
