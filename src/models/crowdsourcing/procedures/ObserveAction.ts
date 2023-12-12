import { SensorType, TimeUnit } from '@openhps/core';
import { SystemAction } from './SystemAction';

export class ObserveAction extends SystemAction {
    sensors: SensorType[];
    duration: number;
    durationUnit: TimeUnit;
    frequency: number;
}
