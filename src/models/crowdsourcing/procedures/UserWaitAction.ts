import { TimeUnit } from '@openhps/core';
import { UserAction } from './UserAction';
import { SerializableObject } from "@openhps/core";

@SerializableObject({
    rdf: {
        
    }
})
export class UserWaitAction extends UserAction {
    duration: number;
    durationUnit: TimeUnit;
}
