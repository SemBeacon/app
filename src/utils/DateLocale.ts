import type { FormatDistanceFn, FormatDistanceLocale } from 'date-fns';

type FormatDistanceTokenValue =
    | string
    | {
          one: string;
          other: string;
      };

const formatDistanceLocale: FormatDistanceLocale<FormatDistanceTokenValue> = {
    lessThanXSeconds: {
        one: 'less than a second',
        other: 'less than {{count}} second',
    },

    xSeconds: {
        one: '1s',
        other: '{{count}}s',
    },

    halfAMinute: 'half a minute',

    lessThanXMinutes: {
        one: 'less than a min',
        other: 'less than {{count}} min',
    },

    xMinutes: {
        one: '1 min',
        other: '{{count}} min',
    },

    aboutXHours: {
        one: 'about 1 hour',
        other: 'about {{count}} hours',
    },

    xHours: {
        one: '1 hour',
        other: '{{count}} hours',
    },

    xDays: {
        one: '1 day',
        other: '{{count}} days',
    },

    aboutXWeeks: {
        one: 'about 1 week',
        other: 'about {{count}} weeks',
    },

    xWeeks: {
        one: '1 week',
        other: '{{count}} weeks',
    },

    aboutXMonths: {
        one: 'about 1 month',
        other: 'about {{count}} months',
    },

    xMonths: {
        one: '1 month',
        other: '{{count}} months',
    },

    aboutXYears: {
        one: 'about 1 year',
        other: 'about {{count}} years',
    },

    xYears: {
        one: '1 year',
        other: '{{count}} years',
    },

    overXYears: {
        one: 'over 1 year',
        other: 'over {{count}} years',
    },

    almostXYears: {
        one: 'almost 1 year',
        other: 'almost {{count}} years',
    },
};

export const formatDistance: FormatDistanceFn = (token, count, options) => {
    let result;

    const tokenValue = formatDistanceLocale[token];
    if (typeof tokenValue === 'string') {
        result = tokenValue;
    } else if (count === 1) {
        result = tokenValue.one;
    } else {
        result = tokenValue.other.replace('{{count}}', count.toString());
    }

    if (options?.addSuffix) {
        if (options.comparison && options.comparison > 0) {
            return 'in ' + result;
        } else {
            return result + ' ago';
        }
    }

    return result;
};
