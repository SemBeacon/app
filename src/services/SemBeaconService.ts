import { BLESemBeacon } from "@/models/BLESemBeacon";
import { Service } from "@openhps/core";
import axios from 'axios';

export class SemBeaconService extends Service {

    protected fetchData(beacon: BLESemBeacon): Promise<any> {
        return new Promise((resolve, reject) => {
            axios.get(beacon.resourceUri, {
                headers: {
                    Accept: "text/turtle"
                }
            }).then(() => {
                resolve(undefined);
            }).catch(reject);
        });
    }

}
