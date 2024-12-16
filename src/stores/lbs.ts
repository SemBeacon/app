import {
    DataFactory,
    DefaultEngine,
    IriString,
    NamedNode,
    RDFSerializer,
    SPARQLDataDriver,
    Store,
    Thing,
    schema,
} from '@openhps/rdf';
import { defineStore } from 'pinia';
import { DataSerializer, GeographicalPosition } from '@openhps/core';
import { Preferences } from '@capacitor/preferences';
import { toRaw } from 'vue';
import { PiniaDataService } from '@/utils/PiniaDataService';
import { MapObject } from '@/models/MapObject';

export interface LBSState {

}

export const useLBSStore = defineStore('lbs', {
    state: (): LBSState => ({

    }),
    getters: {

    },
    actions: {

    },
});
