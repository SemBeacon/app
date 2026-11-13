import { describe, expect, it } from 'vitest';
import { isNetworkError, isOnline } from '@/services/Network';

describe('network', () => {
    it('reports the browser online state', () => {
        expect(typeof isOnline()).toBe('boolean');
    });

    it.each([
        new TypeError('Failed to fetch'),
        new TypeError('Load failed'),
        Object.assign(new Error('The operation timed out'), { name: 'AbortError' }),
        new Error('fetch failed'),
    ])('classifies %s as a network error', (error) => {
        expect(isNetworkError(error)).toBe(true);
    });

    it('does not classify unsupported data as a network error', () => {
        expect(isNetworkError(new Error('Unable to deserialize SemBeacon data'))).toBe(false);
        expect(isNetworkError(undefined)).toBe(false);
    });
});
