import { BLESemBeacon } from "@/models/BLESemBeacon";
import { DataObjectService, DataServiceDriver, DataServiceOptions } from "@openhps/core";
import { RDFSerializer, UrlString } from "@openhps/rdf";
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
                }).then(obj => {
                    return super.insert(uid, obj);
                }).then(resolve).catch(reject);
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
    
    protected fetchData(beacon: BLESemBeacon): Promise<any> {
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
                const resourceUri = result.request.responseURL;
                const deserialized = RDFSerializer.deserializeFromString(resourceUri, result.data);
                if (deserialized instanceof BLESemBeacon) {
                    // SemBeacon
                    if (resourceUri !== beacon.resourceUri) {
                        beacon.resourceUri = resourceUri;
                    }
                }
                resolve(beacon);
            }).catch(reject).finally(() => {
                this.queue.delete(beacon.uid);
            });
        });
    }

}

export interface SemBeaconServiceOptions extends DataServiceOptions {
    cors?: boolean;
}
