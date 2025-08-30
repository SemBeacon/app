import { defineStore } from 'pinia';
import { Preferences } from '@capacitor/preferences';

export interface SettingsState {
    version: number;
    data: {
        theme: 'LIGHT' | 'DARK' | 'SYSTEM';
        uuids: Record<string, {
            name: string;
            automatic?: boolean;
        }>
    };
}

const CURRENT_VERSION: number = 2;

const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');

Preferences.keys().then((keys) => {
    console.log('Data storage', keys);
});

export const useSettings = defineStore('settings', {
    state: (): SettingsState => ({
        version: CURRENT_VERSION,
        data: {
            theme: 'SYSTEM',
            uuids: {}
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
                            if (value && value.version === CURRENT_VERSION) {
                                this.data = value.data;
                                resolve();
                            } else {
                                this.populate();
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
        populate(): void {
            // Add uuids
            this.data.uuids = {
                '77f340db-ac0d-20e8-aa3a-f656a29f236c': {
                    name: 'SemBeacon DEMO'
                },
                'f7826da6-4fa2-4e98-8024-bc5b71e0893e': {
                    name: 'Kontakt.io'
                },
                'b9407f30-f5f8-466e-aff9-25556b57fe6d': {
                    name: 'Estimote'
                },
                '2f234454-cf6d-4a0f-adf2-f4911ba9ffa6': {
                    name: 'Radius Networks'
                },
                'e2c56db5-dffb-48d2-b060-d0f5a71096e0': {
                    name: 'Generic'
                },
            };
        }
    },
});
