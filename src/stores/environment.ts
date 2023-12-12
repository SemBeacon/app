import {
    DataFactory,
    DefaultEngine,
    IriString,
    NamedNode,
    RDFSerializer,
    SPARQLDataDriver,
    Store,
} from '@openhps/rdf';
import { defineStore } from 'pinia';
import { Building, SymbolicSpace, SymbolicSpaceService } from '@openhps/geospatial';
import { DataSerializer, GeographicalPosition, MemoryDataService } from '@openhps/core';
import { Preferences } from '@capacitor/preferences';
import { toRaw } from 'vue';

export interface EnvironmentState {
    environments: Map<string, SymbolicSpace<GeographicalPosition>>;
    service: SymbolicSpaceService<any>;
}

export const useEnvironmentStore = defineStore('environments', {
    state: (): EnvironmentState => ({
        environments: new Map(),
        service: new SymbolicSpaceService(new MemoryDataService(SymbolicSpace)),
    }),
    getters: {
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
            this.environments.set(space.uid, space);
            this.service.insertObject(space);
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
                                this.environments = new Map(Object.entries(environments));
                                this.environments.forEach((space: SymbolicSpace<any>) => {
                                    this.service.insertObject(space);
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
