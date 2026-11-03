/**
 * External endpoints and keys. Defaults are the public SemBeacon services; override them
 * with VITE_* variables (see .env.example) for staging or self-hosted deployments.
 * Keep src/workers/BLEScannerWorker.worker.js in sync: it is not bundled and cannot import
 * this module.
 */
const env = import.meta.env;

export const config = {
    /** URL shortener for SemBeacon resource URIs (returns the short URL as text). */
    shortenerUrl: env.VITE_SHORTENER_URL ?? 'https://s.sembeacon.org/shorten?api=Y5Y2SRZ2zo',
    /** CORS proxy prefix for fetching SemBeacon resources; the target URI is appended. */
    corsProxyUrl: env.VITE_CORS_PROXY_URL ?? 'https://proxy.sembeacon.org/?api=xWzD9b4eRBdWz&uri=',
    /** Public Mapbox token (pk.*) for map tiles and geocoding. */
    mapboxToken:
        env.VITE_MAPBOX_TOKEN,
} as const;
