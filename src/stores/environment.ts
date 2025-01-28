import {
    DataFactory,
    DefaultEngine,
    IriString,
    NamedNode,
    RDFSerializer,
    SPARQLDataDriver,
    Store,
    Thing,
    schema,
} from '@openhps/rdf';
import { defineStore } from 'pinia';
import { Building, Floor, SymbolicSpace, SymbolicSpaceService } from '@openhps/geospatial';
import { DataSerializer, GeographicalPosition } from '@openhps/core';
import { Preferences } from '@capacitor/preferences';
import { toRaw } from 'vue';
import { PiniaDataService } from '@/utils/PiniaDataService';
import { MapObject } from '@/models/MapObject';

let spaceService: SymbolicSpaceService<any>;

export interface EnvironmentState {
    environments: Map<string, SymbolicSpace<GeographicalPosition>>;
    floorPlans: Map<string, MapObject>;
}

export const useEnvironmentStore = defineStore('environments', {
    state: (): EnvironmentState => ({
        environments: new Map(),
        floorPlans: new Map(),
    }),
    getters: {
        service(): SymbolicSpaceService<any> {
            if (!spaceService) {
                spaceService = new SymbolicSpaceService(
                    new PiniaDataService(SymbolicSpace, this.environments),
                );
            }
            return spaceService;
        },
        buildings(): Building[] {
            const buildings: Building[] = [];
            this.environments.forEach((env) => {
                if (env instanceof Building) {
                    buildings.push(env);
                }
            });
            return buildings;
        },
    },
    actions: {
        fetchChildren(parent: SymbolicSpace<any>): Promise<SymbolicSpace<any>[]> {
            return new Promise((resolve, reject) => {
                this.service
                    .findChildren(parent)
                    .then((spaces) => {
                        resolve(spaces);
                    })
                    .catch(reject);
            });
        },
        fetchEnvironments(store: Store): Promise<void> {
            return new Promise((resolve, reject) => {
                const driver = new SPARQLDataDriver(SymbolicSpace, {
                    sources: [store],
                    engine: DefaultEngine,
                });
                const query = `
                    PREFIX sembeacon: <http://purl.org/sembeacon/>
                    PREFIX ssn: <http://www.w3.org/ns/ssn/>
                    PREFIX sosa: <http://www.w3.org/ns/sosa/>
                    PREFIX ogc: <http://www.opengis.net/ont/geosparql#>

                    SELECT ?space {
                        ?space a ssn:Deployment .
                        ?space a ogc:SpatialObject .
                    }`;
                driver
                    .queryBindings(query)
                    .then((bindings) => {
                        bindings.forEach((binding) => {
                            const spaceURI = (binding.get('space') as NamedNode).id as IriString;
                            const space: SymbolicSpace<any> = RDFSerializer.deserializeFromStore(
                                DataFactory.namedNode(spaceURI),
                                store,
                            );
                            this.addSpace(space);
                        });
                        return this.save();
                    })
                    .then(() => {
                        resolve();
                    })
                    .catch(reject);
            });
        },
        addSpace(space: SymbolicSpace<any>): void {
            if (space instanceof Floor && space.rdf && space.rdf.predicates[schema.hasMap]) {
                const mapObject = RDFSerializer.deserialize(
                    space.rdf.predicates[schema.hasMap][0] as Thing,
                    MapObject,
                );
                if (mapObject instanceof MapObject) {
                    this.floorPlans.set(space.uid, mapObject);
                }
            }

            this.environments.set(space.uid, space);
        },
        clear(): void {
            this.environments = new Map();
            this.save();
        },
        load(): Promise<void> {
            return new Promise((resolve, reject) => {
                Preferences.get({
                    key: 'environments',
                })
                    .then((result) => {
                        if (result.value && result.value !== 'undefined') {
                            const data = JSON.parse(result.value);
                            if (data) {
                                const environments: { [k: string]: any } =
                                    DataSerializer.deserialize(data);
                                Object.entries(environments).forEach((entry) => {
                                    this.addSpace(entry[1]);
                                });
                            }
                        }
                        resolve();
                    })
                    .catch(reject);
            });
        },
        save(): Promise<void> {
            return new Promise((resolve, reject) => {
                const serialized = DataSerializer.serialize(
                    Object.fromEntries(toRaw(this.environments).entries()),
                );
                Preferences.set({
                    key: 'environments',
                    value: JSON.stringify(serialized),
                })
                    .then(resolve)
                    .catch(reject);
            });
        },
    },
});
