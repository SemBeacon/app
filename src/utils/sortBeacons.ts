export enum SortKey {
    RSSI = 'rssi',
    CREATED = 'created',
    MODIFIED = 'modified',
    DISTANCE = 'distance',
}

export interface SortableBeacon {
    uid: string;
    createdTimestamp?: number;
    lastSeen?: number;
    rssi?: number;
    distance?: number;
}

const missingLast = (value: number | undefined, fallback: number) => value ?? fallback;

const comparators: Record<SortKey, (a: SortableBeacon, b: SortableBeacon) => number> = {
    // Oldest first, so newly detected beacons are appended instead of shifting the list
    [SortKey.CREATED]: (a, b) => missingLast(a.createdTimestamp, Infinity) - missingLast(b.createdTimestamp, Infinity),
    // Most recently seen first
    [SortKey.MODIFIED]: (a, b) => missingLast(b.lastSeen, -Infinity) - missingLast(a.lastSeen, -Infinity),
    // Strongest signal first
    [SortKey.RSSI]: (a, b) => missingLast(b.rssi, -Infinity) - missingLast(a.rssi, -Infinity),
    // Nearest first
    [SortKey.DISTANCE]: (a, b) => missingLast(a.distance, Infinity) - missingLast(b.distance, Infinity),
};

/**
 * Sort beacons for display without mutating the input. Ties are broken by UID so the
 * order is stable no matter in which order beacons were detected or resolved.
 */
export function sortBeacons<T extends SortableBeacon>(beacons: readonly T[], key: SortKey): T[] {
    const compare = comparators[key];
    return [...beacons].sort((a, b) => compare(a, b) || (a.uid < b.uid ? -1 : a.uid > b.uid ? 1 : 0));
}
