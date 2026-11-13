/** Flags that the user wants every displayed SemBeacon to have. */
export interface BeaconFilter {
    flags: number[];
}

/** A beacon that may have SemBeacon flags. */
export interface FilterableBeacon {
    flags?: number;
    hasFlag?: (flag: number) => boolean;
}

export function emptyBeaconFilter(): BeaconFilter {
    return { flags: [] };
}

export function isFilterActive(filter: BeaconFilter): boolean {
    return filter.flags.length > 0;
}

/**
 * Whether a beacon matches the filter. With no flags selected everything matches. With flags
 * selected only SemBeacons are shown, and they must have all selected flags (AND).
 */
export function matchesFilter(beacon: FilterableBeacon, filter: BeaconFilter): boolean {
    if (!isFilterActive(filter)) {
        return true;
    }
    if (typeof beacon.hasFlag !== 'function') {
        return false;
    }
    return filter.flags.every((flag) => beacon.hasFlag(flag));
}

/** Filter beacons without mutating the input; order is preserved. */
export function filterBeacons<T extends FilterableBeacon>(
    beacons: readonly T[],
    filter: BeaconFilter,
): T[] {
    if (!isFilterActive(filter)) {
        return [...beacons];
    }
    return beacons.filter((beacon) => matchesFilter(beacon, filter));
}
