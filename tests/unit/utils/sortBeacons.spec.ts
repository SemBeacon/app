import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { SortKey, sortBeacons, type SortableBeacon } from '@/utils/sortBeacons';

const beacon = (uid: string, values: Partial<SortableBeacon> = {}): SortableBeacon => ({ uid, ...values });
const uids = (list: SortableBeacon[]) => list.map((b) => b.uid);

describe('sortBeacons', () => {
    it('sorts by first seen, oldest first', () => {
        const list = [beacon('b', { createdTimestamp: 20 }), beacon('a', { createdTimestamp: 10 })];
        expect(uids(sortBeacons(list, SortKey.CREATED))).toEqual(['a', 'b']);
    });

    it('sorts by last seen, most recent first', () => {
        const list = [beacon('a', { lastSeen: 10 }), beacon('b', { lastSeen: 20 })];
        expect(uids(sortBeacons(list, SortKey.MODIFIED))).toEqual(['b', 'a']);
    });

    it('sorts by RSSI, strongest first', () => {
        const list = [beacon('far', { rssi: -90 }), beacon('near', { rssi: -40 })];
        expect(uids(sortBeacons(list, SortKey.RSSI))).toEqual(['near', 'far']);
    });

    it('sorts by distance, nearest first, unknown distances last', () => {
        const list = [beacon('unknown'), beacon('far', { distance: 8 }), beacon('near', { distance: 0.5 })];
        expect(uids(sortBeacons(list, SortKey.DISTANCE))).toEqual(['near', 'far', 'unknown']);
    });

    it('does not mutate the input', () => {
        const list = [beacon('b', { rssi: -80 }), beacon('a', { rssi: -40 })];
        sortBeacons(list, SortKey.RSSI);
        expect(uids(list)).toEqual(['b', 'a']);
    });

    it('gives the same order regardless of input order', () => {
        const arbitraryBeacon = fc.record({
            uid: fc.uuid(),
            createdTimestamp: fc.option(fc.integer({ min: 0, max: 5 }), { nil: undefined }),
            rssi: fc.option(fc.integer({ min: -100, max: -30 }), { nil: undefined }),
        });
        fc.assert(
            fc.property(
                fc.uniqueArray(arbitraryBeacon, { selector: (b) => b.uid }),
                fc.constantFrom(...Object.values(SortKey)),
                (list, key) => {
                    const reversed = [...list].reverse();
                    expect(uids(sortBeacons(reversed, key))).toEqual(uids(sortBeacons(list, key)));
                },
            ),
        );
    });
});
