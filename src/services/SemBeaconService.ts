import { BLESemBeacon } from "@/models/BLESemBeacon";
import { DataObjectService, DataServiceDriver, DataServiceOptions, TimeService } from "@openhps/core";
import { DataFactory, DefaultEngine, IriString, NamedNode, Parser, Quad, RDFSerializer, SPARQLDataDriver, Store, UrlString } from "@openhps/rdf";
import { BLEBeaconObject } from "@openhps/rf";
import axios, { AxiosResponse } from 'axios';

/**
 * SemBeacon data object service for persisting and retrieving SemBeacon data
 */
export class SemBeaconService extends DataObjectService<BLEBeaconObject> {
    protected options: SemBeaconServiceOptions;
    protected queue: Set<string> = new Set();
    
    constructor(driver?: DataServiceDriver<string, BLEBeaconObject>, options?: SemBeaconServiceOptions) {
        super(driver);
        this.options = options ?? { cors: true, accessToken: undefined };
    }

    protected _findByUID(uid: string): Promise<BLEBeaconObject> {
        return new Promise((resolve) => {
            this.findByUID(uid)
                .then(beacon => resolve(beacon as BLEBeaconObject))
                .catch(() => {
                    resolve(undefined);
                });
        });
    }

    protected insertRapid(uid: string, object: BLEBeaconObject): Promise<BLEBeaconObject> {
        this.emitAsync('beacon', object);
        return super.insert(uid, object);
    }

    /**
     * Insert a new BLE beacon object
     *
     * @param {string} uid Unique identifier 
     * @param {BLEBeaconObject} object Beacon object 
     * @returns {Promise<BLEBeaconObject>} Beacon promise
     */
    insert(uid: string, object: BLEBeaconObject): Promise<BLEBeaconObject> {
        return new Promise((resolve, reject) => {
            if (object instanceof BLESemBeacon) {
                Promise.all([
                    ((!object.shortResourceURI && object.resourceUri) ? this.shortenURL(object) : Promise.resolve(object)),
                    this._findByUID(object.uid) as Promise<BLESemBeacon>
                ]).then((objects: BLESemBeacon[]) => {
                    if ((objects[1] === undefined || TimeService.now() - objects[1].maxAge > objects[1].modifiedTimestamp) && 
                        (objects[0].resourceUri !== undefined || objects[0].shortResourceURI !== undefined) &&
                        !this.queue.has(objects[0].uid)
                    ) {
                        return this.fetchData(objects[0]);
                    } else {
                        return Promise.resolve(this._mergeBeacon(objects[0], objects[1]))
                    }
                }).then((fetchedObject: BLESemBeacon) => {
                    if (!fetchedObject.resourceData) {
                        this.emitAsync('beacon', fetchedObject);
                        return Promise.resolve(undefined);
                    }
                    this.emitAsync('beacon', fetchedObject);
                    return super.insert(uid, fetchedObject);
                }).then(resolve).catch(reject);
            } else {
                this._findByUID(object.uid).then(beacon => {
                    return super.insert(uid, this._mergeBeacon(object, beacon));
                }).then(beacon => {
                    this.emitAsync('beacon', beacon);
                }).catch(reject);
            }
        });
    }

    protected fetchAllBeacons(beacon: BLESemBeacon, store: Store): Promise<void> {
        return new Promise((resolve, reject) => {
            if (beacon.namespaceId === undefined || store === undefined) {
                return resolve();
            }
            const driver = new SPARQLDataDriver(BLESemBeacon, {
                sources: [store],
                engine: DefaultEngine
            });
            const namespaceIdSantized = beacon.namespaceId.toString().replaceAll("-", "");
            const query = `
                PREFIX sembeacon: <http://purl.org/sembeacon/>
                PREFIX poso: <http://purl.org/poso/>

                SELECT ?beacon {
                    ?beacon a poso:BluetoothBeacon .
                    { 
                        ?beacon sembeacon:namespaceId "${namespaceIdSantized}"^^xsd:hexBinary 
                    } 
                    UNION
                    { 
                        ?beacon sembeacon:namespace ?namespace .
                        ?namespace sembeacon:namespaceId "${namespaceIdSantized}"^^xsd:hexBinary .
                    } .
                }`;
            driver.queryBindings(query).then(bindings => {
                const insertPromises: Promise<any>[] = [];
                bindings.forEach(binding => {
                    const beaconURI = (binding.get("beacon") as NamedNode).id;
                    const deserializedBeacon: BLEBeaconObject = RDFSerializer.deserializeFromStore(DataFactory.namedNode(beaconURI), store);            
                    if (deserializedBeacon instanceof BLEBeaconObject) {
                        if (deserializedBeacon instanceof BLESemBeacon) {
                            deserializedBeacon.namespaceId = beacon.namespaceId;
                            if (deserializedBeacon.instanceId === beacon.instanceId) {
                                return;
                            }
                        }
                        deserializedBeacon.uid = deserializedBeacon.computeUID();
                        insertPromises.push(this.insertRapid(deserializedBeacon.uid, deserializedBeacon));  
                    }
                });
                return Promise.all(insertPromises);
            }).then(() => {
                resolve()
            }).catch(reject);
        });
    }

    protected shortenURL(beacon: BLESemBeacon): Promise<BLESemBeacon> {
        return new Promise((resolve, reject) => {
            axios.post("https://api-ssl.bitly.com/v4/shorten", {
                "group_guid": "4eb083935b1",
                "domain": "bit.ly",
                "long_url": beacon.resourceUri
            }, {
                headers: {
                    "Authorization": `Bearer ${this.options.accessToken}`
                }
            }).then(response => {
                beacon.shortResourceURI = response.data.link as UrlString;
                resolve(beacon);
            }).catch(reject);
        });
    }
    
    protected fetchData(beacon: BLESemBeacon): Promise<BLESemBeacon> {
        return new Promise((resolve, reject) => {
            if (this.queue.has(beacon.uid)) {
                return resolve(beacon);
            }
            this.queue.add(beacon.uid);
            axios.get((this.options.cors ? "https://proxy.linkeddatafragments.org/" : "") + 
                (beacon.resourceUri ?? beacon.shortResourceURI), {
                    headers: {
                        Accept: "text/turtle"
                    },
                    withCredentials: false,
            }).then(async (result: AxiosResponse) => {
                const cacheTimeout = this._parseCacheControl(result);
                let resourceUri = result.request.responseURL;
                if (result.headers['x-final-url']) {                // Permanent URL fix
                    resourceUri = result.headers['x-final-url'];
                }
                let deserialized: BLESemBeacon = RDFSerializer.deserializeFromString(resourceUri, result.data);
                const parser = new Parser();
                const quads: Quad[] = parser.parse(result.data);
                const store = new Store(quads);
                if (deserialized instanceof BLESemBeacon) {
                    // SemBeacon
                    if (resourceUri !== beacon.resourceUri) {
                        beacon.resourceUri = resourceUri;
                    }
                    beacon = this._mergeBeacon(beacon, deserialized) as BLESemBeacon;
                    beacon.resourceData = store;
                    beacon.maxAge = cacheTimeout;
                    return Promise.resolve({store, beacon});
                } else {
                    // Query to find the SemBeacon
                    const driver = new SPARQLDataDriver(BLESemBeacon, {
                        sources: [store],
                        engine: DefaultEngine
                    });
                    const namespaceIdSantized = beacon.namespaceId.toString().replaceAll("-", "");
                    const instanceIdSanitzed = beacon.instanceId.toString().replaceAll("-", "");
                    const query = `
                        PREFIX sembeacon: <http://purl.org/sembeacon/>
                        SELECT ?beacon {
                            { 
                                ?beacon sembeacon:namespaceId "${namespaceIdSantized}"^^xsd:hexBinary 
                            } 
                            UNION
                            { 
                                ?beacon sembeacon:namespace ?namespace .
                                ?namespace sembeacon:namespaceId "${namespaceIdSantized}"^^xsd:hexBinary .
                            } .
                            ?beacon sembeacon:instanceId "${instanceIdSanitzed}"^^xsd:hexBinary .
                        }`;
                    const bindings = await driver.queryBindings(query);
                    if (bindings.length > 0) {
                        const beaconURI = (bindings[0].get("beacon") as NamedNode).id;
                        beacon.resourceUri = beaconURI as IriString;
                        deserialized = RDFSerializer.deserializeFromString(beacon.resourceUri, result.data);
                        beacon = this._mergeBeacon(beacon, deserialized) as BLESemBeacon;
                        beacon.maxAge = cacheTimeout;
                        beacon.resourceData = store;
                    }
                    return Promise.resolve({store, beacon});
                }
            }).then((value: { store: Store, beacon: BLESemBeacon }) => {
                return this.fetchAllBeacons(beacon, value.store);
            }).then(() => resolve(beacon)).catch(reject).finally(() => {
                this.queue.delete(beacon.uid);
            });
        });
    }

    private _mergeBeacon(beacon: BLEBeaconObject, online: BLEBeaconObject): BLEBeaconObject {
        if (online === undefined) {
            return beacon;
        }
        online.rawAdvertisement = beacon.rawAdvertisement;
        beacon.services.forEach(service => {
            online.addService(service);
        });
        online.txPower = beacon.txPower;
        online.relativePositions = beacon.relativePositions;
        online.manufacturerData = beacon.manufacturerData;
        if (online instanceof BLESemBeacon && beacon instanceof BLESemBeacon) {
            online.modifiedTimestamp = TimeService.now();
            online.namespaceId = beacon.namespaceId;
            online.instanceId = beacon.instanceId;
        }
        online.uid = online.computeUID();
        return online;
    }

    private _parseCacheControl(response: AxiosResponse): number {
        const header = response.headers['Cache-Control'].toString();
        if (!header) {
            return 30000; // Default cache timeout
        }
        const directives = header
            .toLowerCase()
            .split(",")
            .map(str =>
            str
                .trim()
                .split("=")
                .map(str => str.trim())
            );
        let timeout = 30000;
        for (const [directive, value] of directives) {
            switch (directive) {
                case "max-age": {
                    const maxAge = parseInt(value, 10);
                    if (isNaN(maxAge)) continue;
                    timeout = maxAge;
                    break;
                }
                case "no-store":
                case "no-cache":
                    timeout = 0;
                    break;
            }
        }            
        return timeout;
    }

}

export interface SemBeaconServiceOptions extends DataServiceOptions {
    cors?: boolean;
    accessToken?: string;
}
