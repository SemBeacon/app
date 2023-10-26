import { DataFactory, DefaultEngine, IriString, NamedNode, RDFSerializer, SPARQLDataDriver, Store } from '@openhps/rdf';
import { defineStore } from 'pinia';
import { SymbolicSpace } from '@openhps/geospatial';

export interface Environment {
  id: string;
  name: string;
}

export interface EnvironmentState {
  environments: Map<string, Environment>;
}

export const useEnvironmentStore = defineStore('environments', {
  state: (): EnvironmentState => ({
    environments: new Map(),
  }),
  getters: {},
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
              this.environments.set(space.uid, space);
            });
            resolve();
          })
          .catch(reject);
      });
    },
    clear(): void {
      this.environments = new Map();
    },
  },
});
