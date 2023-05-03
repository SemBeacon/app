import { BLESemBeacon } from "@/models/BLESemBeacon";
import { DataObjectService, Service } from "@openhps/core";
import { RDFSerializer, UrlString } from "@openhps/rdf";
import axios, { AxiosResponse } from 'axios';

export class SemBeaconService extends DataObjectService<BLESemBeacon> {
    
    insertObject(object: BLESemBeacon): Promise<BLESemBeacon> {
        return new Promise((resolve, reject) => {
            this.fetchData(object).then(obj => {
                return super.insertObject(obj);
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
                beacon.shortUri = response.data.link as UrlString;
                resolve(beacon);
            }).catch(reject);
        });
    }
    
    protected fetchData(beacon: BLESemBeacon): Promise<any> {
        return new Promise((resolve, reject) => {
            axios.get(beacon.resourceUri, {
                headers: {
                    Accept: "text/turtle"
                },
                withCredentials: false,
            }).then((result: AxiosResponse) => {
                const deserialized = RDFSerializer.deserializeFromString(beacon.resourceUri, result.data);
                if (deserialized instanceof BLESemBeacon) {
                    // SemBeacon
                    console.log(deserialized);
                    const resourceUri = "";
                }
                resolve(beacon);
            }).catch(reject);
        });
    }

}
