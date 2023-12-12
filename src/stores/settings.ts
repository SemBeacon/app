import { defineStore } from 'pinia';
import { Preferences } from '@capacitor/preferences';

export interface SettingsState {
    version: number;
    data: {
        theme: 'LIGHT' | 'DARK' | 'SYSTEM';
    };
}

const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');

export const useSettings = defineStore('settings', {
    state: (): SettingsState => ({
        version: 1,
        data: {
            theme: 'SYSTEM',
        },
    }),
    getters: {
        accessToken(): string {
            return 'pk.eyJ1IjoibWF4aW12ZHciLCJhIjoiY2xnbnJmc3Q3MGFyZzNtcGp0eGNuemp5eCJ9.yUAGNxEFSIxHIXqk0tGoxw';
        },
        mapStyle(): string {
            return this.darkMode ? 'mapbox://styles/mapbox/dark-v11' : 'mapbox://styles/mapbox/streets-v12';
        },
        darkMode(): boolean {
            return prefersDark.matches;
        }
    },
    actions: {
        save(): Promise<void> {
            return new Promise((resolve, reject) => {
                Preferences.set({
                    key: 'settings',
                    value: JSON.stringify(this.data),
                })
                    .then(() => {
                        resolve();
                    })
                    .catch(reject);
            });
        },
        load(): Promise<void> {
            return new Promise((resolve, reject) => {
                Preferences.get({
                    key: 'settings',
                })
                    .then((result) => {
                        try {
                            const data = JSON.parse(result.value);
                            this.data = data;
                            resolve();
                        } catch (err) {
                            reject(err);
                        }
                    })
                    .catch(reject);
            });
        },
    },
});
