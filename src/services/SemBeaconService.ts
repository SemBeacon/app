import { Service } from "@openhps/core";
import axios from 'axios';

export class SemBeaconService extends Service {

    protected fetchData(): Promise<any> {
        return new Promise((resolve, reject) => {
            axios.get("", {
                headers: {
                    Accept: "text/turtle"
                }
            }).then(() => {
                resolve(undefined);
            }).catch(reject);
        });
    }
}
