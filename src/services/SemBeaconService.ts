import { BLESemBeacon } from "@/models/BLESemBeacon";
import { DataObjectService, DataServiceDriver, DataServiceOptions, TimeService } from "@openhps/core";
import { IriString, NamedNode, Parser, Quad, RDFSerializer, SPARQLDataDriver, Store, UrlString } from "@openhps/rdf";
import axios, { AxiosResponse } from 'axios';

export class SemBeaconService extends DataObjectService<BLESemBeacon> {
    protected options: SemBeaconServiceOptions;
    protected queue: Set<string> = new Set();

    constructor(driver?: DataServiceDriver<string, BLESemBeacon>, options?: SemBeaconServiceOptions) {
        super(driver);
        this.options = options ?? { cors: true };
    }

    insert(uid: string, object: BLESemBeacon): Promise<BLESemBeacon> {
        return new Promise((resolve, reject) => {
            ((!object.shortResourceURI && object.resourceUri) ? this.shortenURL(object) : Promise.resolve(object))
                .then((object: BLESemBeacon) => {
                    return this.fetchData(object);
                }).then((fetchedObject: BLESemBeacon) => {
                    if (!fetchedObject.resourceData) {
                        return Promise.resolve(undefined);
                    }
                    return super.insert(uid, fetchedObject);
                }).then(resolve).catch(reject);
        });
    }

    protected fetchAllBeacons(store: Store): Promise<void> {
        return new Promise((resolve, reject) => {
            resolve();
        });
    }

    protected shortenURL(beacon: BLESemBeacon): Promise<BLESemBeacon> {
        return new Promise((resolve, reject) => {
            const accessToken = "2cd7bc12126759042bfb3ebe1160aafda0bc65df";
            axios.post("https://api-ssl.bitly.com/v4/shorten", {
                "group_guid": "4eb083935b1",
                "domain": "bit.ly",
                "long_url": beacon.resourceUri
            }, {
                headers: {
                    "Authorization": `Bearer ${accessToken}`
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
            
            // Get final url
            axios.get("https://proxy.linkeddatafragments.org/" + (beacon.resourceUri ?? beacon.shortResourceURI), {
                    headers: {
                        Accept: "text/turtle"
                    },
                    withCredentials: false,
            }).then((result: AxiosResponse) => {
                let resourceUri = result.request.responseURL;
                if (result.headers['x-final-url']) {
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
                    beacon = this._mergeBeacon(beacon, deserialized);
                    beacon.resourceData = store;
                    resolve(beacon);
                } else {
                    // Query to find the SemBeacon
                    const driver = new SPARQLDataDriver(BLESemBeacon, {
                        sources: [store]
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
                    driver.queryBindings(query).then((bindings) => {
                            if (bindings.length > 0) {
                                const beaconURI = (bindings[0].get("beacon") as NamedNode).id;
                                beacon.resourceUri = beaconURI as IriString;
                                deserialized = RDFSerializer.deserializeFromString(beacon.resourceUri, result.data);
                                beacon = this._mergeBeacon(beacon, deserialized);
                                beacon.resourceData = store;
                            }
                            resolve(beacon);
                        }).catch(reject);
                }
            }).catch(reject).finally(() => {
                this.queue.delete(beacon.uid);
            });
        });
    }

    private _mergeBeacon(beacon: BLESemBeacon, online: BLESemBeacon): BLESemBeacon {
        online.rawAdvertisement = beacon.rawAdvertisement;
        beacon.services.forEach(service => {
            online.addService(service);
        });
        online.txPower = beacon.txPower;
        online.relativePositions = beacon.relativePositions;
        online.manufacturerData = beacon.manufacturerData;
        online.modifiedTimestamp = TimeService.now();
        return online;
    }

}

export interface SemBeaconServiceOptions extends DataServiceOptions {
    cors?: boolean;
}
