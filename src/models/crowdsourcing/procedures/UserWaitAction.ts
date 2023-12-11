import { TimeUnit } from "@openhps/core";
import { UserAction } from "./UserAction";

export class UserWaitAction extends UserAction {
    duration: number;
    durationUnit: TimeUnit;
}
