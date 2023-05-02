import { BLESemBeacon } from "@/models/BLESemBeacon";
import { DataObjectService, Service } from "@openhps/core";
import { RDFSerializer } from "@openhps/rdf";
import axios, { AxiosResponse } from 'axios';

export class SemBeaconService extends DataObjectService<BLESemBeacon> {
    
    insertObject(object: BLESemBeacon): Promise<BLESemBeacon> {
        return new Promise((resolve, reject) => {
            this.fetchData(object).then(obj => {
                return super.insertObject(obj);
            }).then(resolve).catch(reject);
        });
    }

    protected fetchData(beacon: BLESemBeacon): Promise<any> {
        return new Promise((resolve, reject) => {
            axios.get(beacon.resourceUri, {
                headers: {
                    Accept: "text/turtle"
                }
            }).then((result: AxiosResponse) => {
                const deserialized = RDFSerializer.deserializeFromString(beacon.resourceUri, result.data);
                if (deserialized instanceof BLESemBeacon) {
                    // SemBeacon
                    console.log(deserialized);
                }
                resolve(beacon);
            }).catch(reject);
        });
    }

}
