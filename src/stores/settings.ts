import { defineStore } from 'pinia';
import { Preferences } from '@capacitor/preferences';
import { config } from '@/config';

export interface SettingsState {
    version: number;
    data: {
        theme: 'LIGHT' | 'DARK' | 'SYSTEM';
        uuids: Record<
            string,
            {
                name: string;
                automatic?: boolean;
            }
        >;
    };
}

const CURRENT_VERSION: number = 2;

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

/** Normalise user or beacon input to a lowercase UUID; undefined when it is not a UUID. */
export function normalizeUuid(input: string): string | undefined {
    const uuid = input.trim().toLowerCase();
    return UUID_PATTERN.test(uuid) ? uuid : undefined;
}

const prefersDark = () => window.matchMedia('(prefers-color-scheme: dark)').matches;

export const useSettings = defineStore('settings', {
    state: (): SettingsState => ({
        version: CURRENT_VERSION,
        data: {
            theme: 'SYSTEM',
            uuids: {},
        },
    }),
    getters: {
        accessToken(): string {
            return config.mapboxToken;
        },
        mapStyle(): string {
            return this.darkMode
                ? 'mapbox://styles/mapbox/dark-v11'
                : 'mapbox://styles/mapbox/streets-v12';
        },
        darkMode(): boolean {
            return this.data.theme === 'SYSTEM' ? prefersDark() : this.data.theme === 'DARK';
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
        async save(): Promise<void> {
            await Preferences.set({
                key: 'settings',
                value: JSON.stringify({ version: this.version, data: this.data }),
            });
        },
        async load(): Promise<void> {
            const { value } = await Preferences.get({ key: 'settings' });
            const stored = value ? JSON.parse(value) : undefined;
            if (stored?.version === CURRENT_VERSION) {
                this.data = stored.data;
            } else {
                // Nothing stored yet, or an older format: start from the defaults
                this.populate();
                await this.save();
            }
        },
        /**
         * Add a UUID entered by the user.
         * @returns false when the input is not a UUID or the UUID is already known
         */
        async addUuid(input: string, name: string): Promise<boolean> {
            const uuid = normalizeUuid(input);
            if (!uuid || this.data.uuids[uuid]) {
                return false;
            }
            this.data.uuids[uuid] = { name: name.trim() || uuid };
            await this.save();
            return true;
        },
        async removeUuid(uuid: string): Promise<void> {
            delete this.data.uuids[uuid];
            await this.save();
        },
        /**
         * Remember the namespace of a detected SemBeacon, so iOS can range for it. Existing
         * entries (and names the user chose) are kept.
         * @returns true when the UUID was new
         */
        async registerUuid(input: string): Promise<boolean> {
            const uuid = normalizeUuid(input);
            if (!uuid || this.data.uuids[uuid]) {
                return false;
            }
            this.data.uuids[uuid] = { name: `SemBeacon ${uuid}`, automatic: true };
            await this.save();
            return true;
        },
        populate(): void {
            // Add uuids
            this.data.uuids = {
                '77f340db-ac0d-20e8-aa3a-f656a29f236c': {
                    name: 'SemBeacon DEMO',
                },
                'f7826da6-4fa2-4e98-8024-bc5b71e0893e': {
                    name: 'Kontakt.io',
                },
                'b9407f30-f5f8-466e-aff9-25556b57fe6d': {
                    name: 'Estimote',
                },
                '2f234454-cf6d-4a0f-adf2-f4911ba9ffa6': {
                    name: 'Radius Networks',
                },
                'e2c56db5-dffb-48d2-b060-d0f5a71096e0': {
                    name: 'Generic',
                },
            };
        },
    },
});
