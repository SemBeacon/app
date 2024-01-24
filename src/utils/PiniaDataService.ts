import { Constructor, DataServiceOptions, MemoryDataService } from "@openhps/core";
import { toRaw } from "vue";

export class PiniaDataService<I, T>  extends MemoryDataService<I, T> {
    constructor(dataType: Constructor<T>, data: Map<I, T>, options?: DataServiceOptions<T>) {
        super(dataType, options);
        this._data = new Map(Object.entries(Object.fromEntries(toRaw(data).entries()))) as Map<I, T>;
        // No serialization
        this.options.deserialize = (d) => d;
        this.options.serialize = (d) => d;
    }
}
