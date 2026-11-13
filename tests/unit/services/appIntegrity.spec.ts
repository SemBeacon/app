import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
    platform: 'android',
    prepare: vi.fn(),
    request: vi.fn(),
}));

vi.mock('@capacitor/core', async (importOriginal) => {
    const actual = await importOriginal<typeof import('@capacitor/core')>();
    return {
        ...actual,
        Capacitor: { ...actual.Capacitor, getPlatform: () => mocks.platform },
    };
});

vi.mock('@capawesome/capacitor-app-integrity', () => ({
    AppIntegrity: {
        prepareIntegrityToken: mocks.prepare,
        requestIntegrityToken: mocks.request,
    },
}));

vi.mock('@/config', () => ({
    config: { playIntegrityCloudProject: 123456789012 },
}));

const API_KEY = 'Y5Y2SRZ2zo';
const URI = 'https://example.com/profile#me';
const NOW = 1700000000000;
const CANONICAL = ['sembeacon-shorten-v1', API_KEY, URI, String(NOW)].join('\n');
const HASH = 'XuSHw6PaYh5caTd9AkF-UNePyCTnf59QjiCCpQsYm9A';

async function load() {
    vi.resetModules();
    return import('@/services/appIntegrity');
}

beforeEach(() => {
    mocks.platform = 'android';
    mocks.prepare.mockReset().mockResolvedValue(undefined);
    mocks.request.mockReset().mockResolvedValue({ token: 'token-123' });
    vi.spyOn(Date, 'now').mockReturnValue(NOW);
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
});

afterEach(() => {
    vi.restoreAllMocks();
});

describe('app integrity', () => {
    it('matches the shortener canonical payload fixture', async () => {
        const { canonicalShortenPayload, hashPayload } = await load();
        expect(canonicalShortenPayload(API_KEY, URI, String(NOW))).toBe(CANONICAL);
        expect(await hashPayload(CANONICAL)).toBe(HASH);
    });

    it('returns integrity headers for a shortener request', async () => {
        const { getShortenIntegrityHeaders } = await load();
        await expect(getShortenIntegrityHeaders(API_KEY, URI)).resolves.toEqual({
            'X-Integrity-Token': 'token-123',
            'X-Request-Timestamp': String(NOW),
        });
        expect(mocks.prepare).toHaveBeenCalledTimes(1);
        expect(mocks.request).toHaveBeenCalledWith({ requestHash: HASH });
    });

    it('prepares the provider only once', async () => {
        const { prepareIntegrity } = await load();
        await prepareIntegrity();
        await prepareIntegrity();
        expect(mocks.prepare).toHaveBeenCalledTimes(1);
    });

    it('returns no headers on the web', async () => {
        mocks.platform = 'web';
        const { getShortenIntegrityHeaders } = await load();
        await expect(getShortenIntegrityHeaders(API_KEY, URI)).resolves.toEqual({});
        expect(mocks.prepare).not.toHaveBeenCalled();
        expect(mocks.request).not.toHaveBeenCalled();
    });

    it('returns no headers when the plugin fails', async () => {
        mocks.request.mockRejectedValue(new Error('no Play Services'));
        const { getShortenIntegrityHeaders } = await load();
        await expect(getShortenIntegrityHeaders(API_KEY, URI)).resolves.toEqual({});
    });

    it('retries once when the token provider expired', async () => {
        mocks.request
            .mockRejectedValueOnce(
                Object.assign(new Error('expired'), { code: 'INTEGRITY_TOKEN_PROVIDER_INVALID' }),
            )
            .mockResolvedValueOnce({ token: 'token-456' });
        const { getShortenIntegrityHeaders } = await load();
        await expect(getShortenIntegrityHeaders(API_KEY, URI)).resolves.toEqual({
            'X-Integrity-Token': 'token-456',
            'X-Request-Timestamp': String(NOW),
        });
        expect(mocks.prepare).toHaveBeenCalledTimes(2);
    });
});
