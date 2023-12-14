import { SensorType, SerializableObject, TimeUnit } from '@openhps/core';
import { SystemAction } from './SystemAction';

@SerializableObject({
    rdf: {
        
    }
})
export class ObserveAction extends SystemAction {
    sensors: SensorType[];
    duration: number;
    durationUnit: TimeUnit;
    frequency: number;
}
