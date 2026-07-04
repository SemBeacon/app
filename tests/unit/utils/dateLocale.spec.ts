import { formatDistance } from '@/utils/DateLocale';

describe('DateLocale', () => {
    describe('formatDistance', () => {
        it('should format seconds (singular)', () => {
            const result = formatDistance('xSeconds', 1, undefined);
            expect(result).toBe('1s');
        });

        it('should format seconds (plural)', () => {
            const result = formatDistance('xSeconds', 5, undefined);
            expect(result).toBe('5s');
        });

        it('should format minutes (singular)', () => {
            const result = formatDistance('xMinutes', 1, undefined);
            expect(result).toBe('1 min');
        });

        it('should format minutes (plural)', () => {
            const result = formatDistance('xMinutes', 30, undefined);
            expect(result).toBe('30 min');
        });

        it('should format hours (singular)', () => {
            const result = formatDistance('xHours', 1, undefined);
            expect(result).toBe('1 hour');
        });

        it('should format hours (plural)', () => {
            const result = formatDistance('xHours', 5, undefined);
            expect(result).toBe('5 hours');
        });

        it('should format days', () => {
            const result = formatDistance('xDays', 3, undefined);
            expect(result).toBe('3 days');
        });

        it('should format weeks', () => {
            const result = formatDistance('xWeeks', 2, undefined);
            expect(result).toBe('2 weeks');
        });

        it('should format months', () => {
            const result = formatDistance('xMonths', 6, undefined);
            expect(result).toBe('6 months');
        });

        it('should format years', () => {
            const result = formatDistance('xYears', 2, undefined);
            expect(result).toBe('2 years');
        });

        it('should add suffix "ago" for past times', () => {
            const result = formatDistance('xSeconds', 5, { addSuffix: true, comparison: -1 });
            expect(result).toBe('5s ago');
        });

        it('should add suffix "in" for future times', () => {
            const result = formatDistance('xSeconds', 5, { addSuffix: true, comparison: 1 });
            expect(result).toBe('in 5s');
        });

        it('should not add suffix when addSuffix is false', () => {
            const result = formatDistance('xSeconds', 5, { addSuffix: false });
            expect(result).toBe('5s');
        });

        it('should handle half a minute', () => {
            const result = formatDistance('halfAMinute', 0, undefined);
            expect(result).toBe('half a minute');
        });

        it('should handle less than X seconds', () => {
            const result = formatDistance('lessThanXSeconds', 1, undefined);
            expect(result).toBe('less than a second');

            const result2 = formatDistance('lessThanXSeconds', 5, undefined);
            expect(result2).toBe('less than 5 second');
        });

        it('should handle less than X minutes', () => {
            const result = formatDistance('lessThanXMinutes', 1, undefined);
            expect(result).toBe('less than a min');
        });

        it('should handle about X hours', () => {
            const result = formatDistance('aboutXHours', 3, undefined);
            expect(result).toBe('about 3 hours');
        });

        it('should handle about X weeks', () => {
            const result = formatDistance('aboutXWeeks', 2, undefined);
            expect(result).toBe('about 2 weeks');
        });

        it('should handle about X months', () => {
            const result = formatDistance('aboutXMonths', 1, undefined);
            expect(result).toBe('about 1 month');
        });

        it('should handle about X years', () => {
            const result = formatDistance('aboutXYears', 5, undefined);
            expect(result).toBe('about 5 years');
        });

        it('should handle over X years', () => {
            const result = formatDistance('overXYears', 10, undefined);
            expect(result).toBe('over 10 years');
        });

        it('should handle almost X years', () => {
            const result = formatDistance('almostXYears', 3, undefined);
            expect(result).toBe('almost 3 years');
        });
    });
});
