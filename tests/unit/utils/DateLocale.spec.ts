import { describe, expect, it } from 'vitest';
import { formatDistanceStrict } from 'date-fns';
import { formatDistance } from '@/utils/DateLocale';

const locale = { formatDistance };
const now = new Date('2025-02-01T12:00:00Z');

describe('DateLocale.formatDistance', () => {
    it('uses the short unit forms', () => {
        const date = new Date(now.getTime() - 5 * 60_000);
        expect(formatDistanceStrict(date, now, { locale })).toBe('5 min');
    });

    it('adds "ago" for past dates and "in" for future dates', () => {
        const past = new Date(now.getTime() - 3_000);
        const future = new Date(now.getTime() + 3_000);
        expect(formatDistanceStrict(past, now, { locale, addSuffix: true })).toBe('3s ago');
        expect(formatDistanceStrict(future, now, { locale, addSuffix: true })).toBe('in 3s');
    });

    it('uses the singular form for a count of one', () => {
        const date = new Date(now.getTime() - 1_000);
        expect(formatDistanceStrict(date, now, { locale })).toBe('1s');
    });
});
