import { BLESemBeacon } from "@/models/BLESemBeacon";
import { Service } from "@openhps/core";
import { RDFSerializer } from "@openhps/rdf";
import axios, { AxiosResponse } from 'axios';

export class SemBeaconService extends Service {
    
    protected fetchData(beacon: BLESemBeacon): Promise<any> {
        return new Promise((resolve, reject) => {
            axios.get(beacon.resourceUri, {
                headers: {
                    Accept: "text/turtle"
                }
            }).then((result: AxiosResponse) => {
                const deserialized = RDFSerializer.deserializeFromString(beacon.resourceUri, result.data);
                console.log(deserialized);
                resolve(undefined);
            }).catch(reject);
        });
    }

}
