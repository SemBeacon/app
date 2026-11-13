import { describe, expect, it } from 'vitest';
import { Parser, Store } from '@openhps/rdf';
import type { BLESemBeacon } from '@sembeacon/openhps';
import { parseSemBeaconSemantics } from '@/utils/SemBeaconProperties';

const DEVICE = 'https://example.org/iot.ttl#device';

const TTL = `
@prefix : <https://example.org/iot.ttl#>.
@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#>.
@prefix xsd: <http://www.w3.org/2001/XMLSchema#>.
@prefix sosa: <http://www.w3.org/ns/sosa/>.
@prefix ssn: <http://www.w3.org/ns/ssn/>.
@prefix qudt: <http://qudt.org/schema/qudt/>.
@prefix unit: <http://qudt.org/vocab/unit/>.

:device a sosa:FeatureOfInterest, ssn:System;
    rdfs:label "Demo device"@en;
    ssn:hasProperty :temperature, :lamp.

:temperature a sosa:ObservableProperty;
    rdfs:label "Temperature"@en.

:lamp a sosa:ActuatableProperty;
    rdfs:label "Lamp"@en.

:temperature_observation a sosa:Observation;
    sosa:observedProperty :temperature;
    sosa:hasResult [
        a qudt:QuantityValue;
        qudt:numericValue "21.5"^^xsd:double;
        qudt:unit unit:DEG_C
    ];
    sosa:resultTime "2025-02-01T10:00:00Z"^^xsd:dateTime.

:temperature_observation_old a sosa:Observation;
    sosa:observedProperty :temperature;
    sosa:hasSimpleResult 19.0;
    sosa:resultTime "2025-02-01T09:00:00Z"^^xsd:dateTime.

:lamp_actuation a sosa:Actuation;
    sosa:actsOnProperty :lamp;
    sosa:hasSimpleResult false;
    sosa:resultTime "2025-02-01T10:01:00Z"^^xsd:dateTime.
`;

function parseStore(ttl: string): Store {
    return new Store(new Parser({ format: 'text/turtle' }).parse(ttl));
}

function parse(ttl: string) {
    return parseSemBeaconSemantics({
        resourceUri: DEVICE,
        resourceData: parseStore(ttl),
    } as unknown as BLESemBeacon);
}

describe('parseSemBeaconSemantics', () => {
    it('returns undefined without a resource or properties', () => {
        expect(
            parseSemBeaconSemantics({ resourceUri: DEVICE } as unknown as BLESemBeacon),
        ).toBeUndefined();
        expect(parse('@prefix : <https://example.org/>. :device a :Thing .')).toBeUndefined();
    });

    it('reads the system and both property types', () => {
        const semantics = parse(TTL);
        expect(semantics).toBeDefined();
        expect(semantics.system).toMatchObject({ label: 'Demo device' });
        expect(semantics.properties.map((property) => property.label)).toEqual([
            'Temperature',
            'Lamp',
        ]);
        expect(semantics.properties[0]).toMatchObject({
            observable: true,
            actuatable: false,
        });
        expect(semantics.properties[1]).toMatchObject({
            observable: false,
            actuatable: true,
        });
    });

    it('returns the latest quantity observation with its unit', () => {
        const temperature = parse(TTL).properties.find(
            (property) => property.label === 'Temperature',
        );
        expect(temperature.lastObservation).toMatchObject({
            value: '21.5 DEG C',
            literal: 21.5,
            unit: 'DEG C',
        });
        expect(temperature.lastObservation.time?.toISOString()).toBe('2025-02-01T10:00:00.000Z');
    });

    it('returns the latest simple actuation result', () => {
        const lamp = parse(TTL).properties.find((property) => property.label === 'Lamp');
        expect(lamp.lastActuation).toMatchObject({ value: 'false', literal: false });
    });
});
