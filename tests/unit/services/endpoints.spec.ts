import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

/**
 * The scanner worker is plain JavaScript, is copied verbatim to `public/js/workers` and
 * cannot import app modules, so it repeats the public service URLs from `src/config.ts`.
 * These values are public identifiers (not secrets); this test fails when the two copies
 * drift, which would make a key rotation or URL change only half-applied.
 */
const DEFAULT_SHORTENER = 'https://s.sembeacon.org/shorten?api=Y5Y2SRZ2zo';
const DEFAULT_PROXY = 'https://proxy.sembeacon.org/?api=xWzD9b4eRBdWz&uri=';

describe('service endpoint defaults', () => {
    it('keeps the worker in sync with src/config.ts', () => {
        const config = readFileSync('src/config.ts', 'utf8');
        const worker = readFileSync('src/workers/BLEScannerWorker.worker.js', 'utf8');
        expect(config).toContain(DEFAULT_SHORTENER);
        expect(config).toContain(DEFAULT_PROXY);
        expect(worker).toContain(DEFAULT_SHORTENER);
        expect(worker).toContain(DEFAULT_PROXY);
    });
});
