import { defineStore } from 'pinia';
import { Preferences } from '@capacitor/preferences';

export interface SettingsState {
    version: number;
    data: {
        theme: 'LIGHT' | 'DARK' | 'SYSTEM';
    };
}

export const useSettings = defineStore('settings', {
    state: (): SettingsState => ({
        version: 1,
        data: {
            theme: 'SYSTEM'
        }
    }),
    actions: {
        save(): Promise<void> {
            return new Promise((resolve, reject) => {
                Preferences.set({
                    key: "settings",
                    value: JSON.stringify(this.data)
                }).then(() => {
                    resolve();
                }).catch(reject);
            });
        },
        load(): Promise<void> {
            return new Promise((resolve, reject) => {
                Preferences.get({
                    key: "settings",
                }).then(result => {
                    try {
                        const data = JSON.parse(result.value);
                        this.data = data;
                        resolve();
                    } catch (err) {
                        reject(err);
                    }
                }).catch(reject);
            });
        }
    },
});
