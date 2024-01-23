import { SensorType } from '@openhps/core';
import { defineStore } from 'pinia';

export interface CrowdsourcingState {}

export const useCrowdsourcing = defineStore('crowdsourcing', {
    state: (): CrowdsourcingState => ({}),
    getters: {},
    actions: {
        /**
         * Get supported devices of the user
         *
         * @param {SensorType[]} [sensors] Sensors that should be available
         * @returns {Promise<any[]>} Promise with list of devices
         */
        getDevices(sensors?: SensorType[]): Promise<any[]> {
            return new Promise((resolve) => {});
        },
        /**
         * Add a devie to the user
         *
         * @param {any} device Device to add
         * @returns {Promise<void>} Promise of adding
         */
        addDevice(device: any): Promise<void> {
            return new Promise((resolve) => {});
        },
    },
});
