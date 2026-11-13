import { DataFactory, Store, Term, rdf, rdfs, sosa, ssn, qudt } from '@openhps/rdf';
import type { BLESemBeacon } from '@sembeacon/openhps';

/** Latest observation or actuation result of a property. */
export interface SemanticResult {
    /** Value as shown to the user, including the unit when known. */
    value: string;
    /** Raw literal value, e.g. for a toggle control. */
    literal?: string | number | boolean;
    unit?: string;
    time?: Date;
}

export interface SemanticProperty {
    id: string;
    label: string;
    observable: boolean;
    actuatable: boolean;
    lastObservation?: SemanticResult;
    lastActuation?: SemanticResult;
}

export interface SystemInfo {
    id: string;
    label: string;
    subsystems: string[];
}

export interface SemBeaconSemantics {
    system?: SystemInfo;
    properties: SemanticProperty[];
}

function termId(term: Term): string {
    return term.value;
}

function labelOf(store: Store, subject: Term, fallback: string): string {
    const labels = store.getQuads(subject, rdfs.label, null, null);
    if (labels.length > 0) {
        return labels[0].object.value;
    }
    try {
        const uri = termId(subject);
        const hash = uri.lastIndexOf('#');
        return hash >= 0 ? uri.substring(hash + 1) : uri.substring(uri.lastIndexOf('/') + 1);
    } catch {
        return fallback;
    }
}

function literalValue(term: Term): string | number | boolean {
    const value = term.value;
    const datatype =
        term.termType === 'Literal'
            ? (term as unknown as { datatype?: { value: string } }).datatype?.value
            : undefined;
    if (datatype === 'http://www.w3.org/2001/XMLSchema#boolean') {
        return value === 'true' || value === '1';
    }
    if (
        datatype === 'http://www.w3.org/2001/XMLSchema#integer' ||
        datatype === 'http://www.w3.org/2001/XMLSchema#int' ||
        datatype === 'http://www.w3.org/2001/XMLSchema#double' ||
        datatype === 'http://www.w3.org/2001/XMLSchema#float' ||
        datatype === 'http://www.w3.org/2001/XMLSchema#decimal'
    ) {
        const number = Number(value);
        return Number.isNaN(number) ? value : number;
    }
    if (/^-?\d+(\.\d+)?$/.test(value)) {
        return Number(value);
    }
    return value;
}

function formatUnit(term: Term): string {
    const uri = termId(term);
    const hash = uri.lastIndexOf('/');
    return hash >= 0 ? uri.substring(hash + 1).replaceAll('_', ' ') : uri;
}

/** Read the value of a `sosa:hasResult` node (quantity value, label or literal). */
function resultValue(store: Store, activity: Term): SemanticResult | undefined {
    const simple = store.getQuads(activity, sosa.hasSimpleResult, null, null);
    if (simple.length > 0) {
        const literal = literalValue(simple[0].object);
        return { value: String(literal), literal };
    }
    const results = store.getQuads(activity, sosa.hasResult, null, null);
    if (results.length === 0) {
        return undefined;
    }
    const result = results[0].object;
    const numeric = store.getQuads(result, qudt.numericValue, null, null);
    if (numeric.length > 0) {
        const literal = literalValue(numeric[0].object);
        const units = store.getQuads(result, qudt.unit, null, null);
        const unit = units.length > 0 ? formatUnit(units[0].object) : undefined;
        return {
            value: unit ? `${literal} ${unit}` : String(literal),
            literal,
            unit,
        };
    }
    const labels = store.getQuads(result, rdfs.label, null, null);
    if (labels.length > 0) {
        return { value: labels[0].object.value, literal: labels[0].object.value };
    }
    const literal = literalValue(result);
    return { value: String(literal), literal };
}

function resultTime(store: Store, activity: Term): Date | undefined {
    const times = store.getQuads(activity, sosa.resultTime, null, null);
    if (times.length === 0) {
        return undefined;
    }
    const date = new Date(times[0].object.value);
    return Number.isNaN(date.getTime()) ? undefined : date;
}

/** Get the latest activity of a property (by `sosa:resultTime`). */
function latestActivity(
    store: Store,
    property: Term,
    predicate: typeof sosa.observedProperty | typeof sosa.actsOnProperty,
): SemanticResult | undefined {
    const activities = store
        .getQuads(null, predicate, property, null)
        .map((quad) => quad.subject)
        .map((activity) => ({
            activity,
            result: resultValue(store, activity),
            time: resultTime(store, activity),
        }))
        .filter((entry) => entry.result !== undefined)
        .sort((a, b) => (b.time?.getTime() ?? 0) - (a.time?.getTime() ?? 0));
    if (activities.length === 0) {
        return undefined;
    }
    return { ...activities[0].result, time: activities[0].time };
}

function findSubject(beacon: Pick<BLESemBeacon, 'resourceUri' | 'resourceData'>): Term | undefined {
    const store = beacon.resourceData;
    if (!store) {
        return undefined;
    }
    if (beacon.resourceUri) {
        const subject = DataFactory.namedNode(beacon.resourceUri);
        if (store.getQuads(subject, ssn.hasProperty, null, null).length > 0) {
            return subject;
        }
    }
    // Fall back to any feature/system in the resource that has properties
    const candidates = store
        .getQuads(null, ssn.hasProperty, null, null)
        .map((quad) => quad.subject)
        .filter(
            (subject, index, all) =>
                all.findIndex((other) => termId(other) === termId(subject)) === index,
        );
    return candidates.length > 0 ? candidates[0] : undefined;
}

/**
 * Extract SemBeacon 1.1 semantic data (system, observable and actuatable properties) from the
 * RDF resource of a beacon. Returns undefined when the resource contains no such data.
 */
export function parseSemBeaconSemantics(
    beacon: Pick<BLESemBeacon, 'resourceUri' | 'resourceData'>,
): SemBeaconSemantics | undefined {
    const store = beacon.resourceData;
    if (!store) {
        return undefined;
    }
    const subject = findSubject(beacon);
    if (!subject) {
        return undefined;
    }

    const propertyTerms = new Map<string, Term>();
    store.getQuads(subject, ssn.hasProperty, null, null).forEach((quad) => {
        propertyTerms.set(termId(quad.object), quad.object);
    });
    // Some resources use the inverse property instead
    store.getQuads(null, ssn.isPropertyOf, subject, null).forEach((quad) => {
        propertyTerms.set(termId(quad.subject), quad.subject);
    });

    const properties: SemanticProperty[] = Array.from(propertyTerms.values()).map((property) => {
        const types = store
            .getQuads(property, rdf.type, null, null)
            .map((quad) => termId(quad.object));
        const observable =
            types.includes(sosa.ObservableProperty) ||
            store.getQuads(property, sosa.isObservedBy, null, null).length > 0 ||
            store.getQuads(null, sosa.observedProperty, property, null).length > 0;
        const actuatable =
            types.includes(sosa.ActuatableProperty) ||
            store.getQuads(property, sosa.isActedOnBy, null, null).length > 0 ||
            store.getQuads(null, sosa.actsOnProperty, property, null).length > 0;
        return {
            id: termId(property),
            label: labelOf(store, property, 'Property'),
            observable,
            actuatable,
            lastObservation: observable
                ? latestActivity(store, property, sosa.observedProperty)
                : undefined,
            lastActuation: actuatable
                ? latestActivity(store, property, sosa.actsOnProperty)
                : undefined,
        };
    });

    const isSystem = store.getQuads(subject, rdf.type, ssn.System, null).length > 0;
    const system = isSystem
        ? {
              id: termId(subject),
              label: labelOf(store, subject, 'System'),
              subsystems: store
                  .getQuads(subject, ssn.hasSubSystem, null, null)
                  .map((quad) => labelOf(store, quad.object, termId(quad.object))),
          }
        : undefined;

    if (properties.length === 0 && !system) {
        return undefined;
    }
    return { system, properties };
}
