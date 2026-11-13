import { Capacitor } from '@capacitor/core';
import { AppIntegrity } from '@capawesome/capacitor-app-integrity';
import { config } from '@/config';

/** Version prefix of the canonical payload, shared with the shortener. */
export const INTEGRITY_PAYLOAD_VERSION = 'sembeacon-shorten-v1';

let preparePromise: Promise<void>;

/**
 * Whether Play Integrity can be used on this platform and installation. On the
 * web, in demo mode, in emulators and when no Cloud project is configured the
 * app keeps using the anonymous shortener tier.
 */
export function isIntegritySupported(): boolean {
    return Capacitor.getPlatform() === 'android' && config.playIntegrityCloudProject > 0;
}

/**
 * Build the canonical payload that the shortener verifies against the integrity
 * request hash. Keep in sync with `SemBeacon/shortener` (`src/integrity.ts`).
 */
export function canonicalShortenPayload(apiKey: string, uri: string, timestamp: string): string {
    return [INTEGRITY_PAYLOAD_VERSION, apiKey, uri, timestamp].join('\n');
}

/** Base64url encode bytes without padding. */
function toBase64Url(bytes: Uint8Array): string {
    let binary = '';
    bytes.forEach((byte) => {
        binary += String.fromCharCode(byte);
    });
    return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/** SHA-256 of a payload as a base64url digest. */
export async function hashPayload(payload: string): Promise<string> {
    const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(payload));
    return toBase64Url(new Uint8Array(digest));
}

/**
 * Prepare the Play Integrity token provider once. Preparation takes a few
 * seconds, so it is started at app start-up and awaited before the first token.
 */
export function prepareIntegrity(): Promise<void> {
    if (!isIntegritySupported()) {
        return Promise.resolve();
    }
    if (preparePromise === undefined) {
        preparePromise = AppIntegrity.prepareIntegrityToken({
            cloudProjectNumber: config.playIntegrityCloudProject,
        }).catch((error) => {
            // Allow a later request to retry the preparation.
            preparePromise = undefined;
            console.warn('Play Integrity provider could not be prepared', error);
        });
    }
    return preparePromise;
}

async function requestHeaders(apiKey: string, uri: string): Promise<Record<string, string>> {
    await prepareIntegrity();
    const timestamp = String(Date.now());
    const requestHash = await hashPayload(canonicalShortenPayload(apiKey, uri, timestamp));
    const { token } = await AppIntegrity.requestIntegrityToken({ requestHash });
    if (!token) {
        return {};
    }
    return {
        'X-Integrity-Token': token,
        'X-Request-Timestamp': timestamp,
    };
}

/**
 * Headers for a shortener request, or an empty object when integrity is not
 * available. Never throws: a missing token only means the anonymous tier.
 */
export async function getShortenIntegrityHeaders(
    apiKey: string,
    uri: string,
): Promise<Record<string, string>> {
    if (!apiKey || !isIntegritySupported()) {
        return {};
    }
    try {
        return await requestHeaders(apiKey, uri);
    } catch (error) {
        const code = (error as { code?: string } | undefined)?.code;
        if (code !== 'INTEGRITY_TOKEN_PROVIDER_INVALID') {
            console.warn('Play Integrity token could not be requested', error);
            return {};
        }
        // The prepared provider expired: prepare again and retry once.
        preparePromise = undefined;
        try {
            return await requestHeaders(apiKey, uri);
        } catch (retryError) {
            console.warn('Play Integrity token could not be requested', retryError);
            return {};
        }
    }
}
