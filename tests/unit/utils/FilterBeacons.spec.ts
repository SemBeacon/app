import { describe, expect, it } from 'vitest';
import {
    emptyBeaconFilter,
    filterBeacons,
    isFilterActive,
    matchesFilter,
} from '@/utils/FilterBeacons';

const MOVING = 0x04;
const OBSERVABLE = 0x10;
const POSITION = 0x01;

function beacon(flags?: number) {
    return {
        uid: `beacon-${flags}`,
        flags,
        hasFlag(flag: number) {
            return flags !== undefined && (flags & flag) !== 0;
        },
    };
}

describe('filterBeacons', () => {
    it('shows every beacon without a filter', () => {
        const beacons = [
            beacon(POSITION),
            beacon(MOVING),
            { uid: 'other', flags: undefined, hasFlag: undefined },
        ];
        expect(isFilterActive(emptyBeaconFilter())).toBe(false);
        expect(filterBeacons(beacons, emptyBeaconFilter())).toEqual(beacons);
    });

    it('only shows SemBeacons that have all selected flags', () => {
        const beacons = [beacon(MOVING), beacon(MOVING | OBSERVABLE), beacon(POSITION)];
        const result = filterBeacons(beacons, { flags: [MOVING, OBSERVABLE] });
        expect(result.map((entry) => entry.uid)).toEqual([beacon(MOVING | OBSERVABLE).uid]);
    });

    it('hides non-SemBeacon beacons while a flag is selected', () => {
        const beacons = [
            beacon(MOVING),
            { uid: 'iBeacon', flags: undefined, hasFlag: undefined },
            { uid: 'eddystone', flags: undefined, hasFlag: undefined },
        ];
        expect(filterBeacons(beacons, { flags: [MOVING] })).toHaveLength(1);
    });

    it('treats beacons without flags as not matching', () => {
        const beacons = [beacon(undefined), beacon(0), beacon(MOVING)];
        expect(filterBeacons(beacons, { flags: [MOVING] })).toHaveLength(1);
    });

    it('matches a beacon by its hasFlag implementation', () => {
        const entry = beacon(MOVING | OBSERVABLE);
        expect(matchesFilter(entry, { flags: [MOVING] })).toBe(true);
        expect(matchesFilter(entry, { flags: [MOVING, POSITION] })).toBe(false);
    });

    it('does not mutate the input', () => {
        const beacons = [beacon(MOVING), beacon(POSITION)];
        const copy = [...beacons];
        filterBeacons(beacons, { flags: [MOVING] });
        expect(beacons).toEqual(copy);
    });
});
