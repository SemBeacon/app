import { defineStore } from 'pinia';
import { Preferences } from '@capacitor/preferences';

export interface SettingsState {
    version: number;
    data: {
        theme: 'LIGHT' | 'DARK' | 'SYSTEM';
    };
}

const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');

Preferences.keys().then((keys) => {
    console.log('Data storage', keys);
});

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
            return this.darkMode
                ? 'mapbox://styles/mapbox/dark-v11'
                : 'mapbox://styles/mapbox/streets-v12';
        },
        darkMode(): boolean {
            return this.data.theme === 'SYSTEM'
                ? prefersDark.matches
                : this.data.theme === 'DARK'
                  ? true
                  : false;
        },
    },
    actions: {
        update(): void {
            this.load()
                .then(() => {
                    if (this.darkMode) {
                        document.body.classList.add('dark');
                    } else {
                        document.body.classList.remove('dark');
                    }
                })
                .catch(console.error);
        },
        save(): Promise<void> {
            return new Promise((resolve, reject) => {
                Preferences.set({
                    key: 'settings',
                    value: JSON.stringify({ version: this.version, data: this.data }),
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
                            const value = JSON.parse(result.value);
                            if (value && value.version === 1) {
                                this.data = value.data;
                                resolve();
                            } else {
                                return this.save();
                            }
                        } catch (err) {
                            reject(err);
                        }
                    })
                    .then(() => {
                        resolve();
                    })
                    .catch(reject);
            });
        },
    },
});
