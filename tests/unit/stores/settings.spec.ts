import { createPinia } from 'pinia';
import { useSettings } from '@/stores/settings';

describe('Settings Store', () => {
    let pinia: any;
    let settings: ReturnType<typeof useSettings>;

    beforeEach(() => {
        pinia = createPinia();
    });

    describe('initial state', () => {
        it('should have correct default version', () => {
            settings = useSettings(pinia);
            expect(settings.version).toBe(2);
        });

        it('should have SYSTEM theme by default', () => {
            settings = useSettings(pinia);
            expect(settings.data.theme).toBe('SYSTEM');
        });

        it('should have empty uuids by default', () => {
            settings = useSettings(pinia);
            expect(Object.keys(settings.data.uuids).length).toBe(0);
        });
    });

    describe('getters', () => {
        beforeEach(() => {
            settings = useSettings(pinia);
        });

        it('should return correct accessToken', () => {
            expect(settings.accessToken).toContain('pk.');
        });

        it('should return dark map style when darkMode is true', () => {
            settings.data.theme = 'DARK';
            expect(settings.mapStyle).toBe('mapbox://styles/mapbox/dark-v11');
        });

        it('should return light map style when darkMode is false', () => {
            settings.data.theme = 'LIGHT';
            expect(settings.mapStyle).toBe('mapbox://styles/mapbox/streets-v12');
        });

        it('should return correct darkMode for DARK theme', () => {
            settings.data.theme = 'DARK';
            expect(settings.darkMode).toBe(true);
        });

        it('should return correct darkMode for LIGHT theme', () => {
            settings.data.theme = 'LIGHT';
            expect(settings.darkMode).toBe(false);
        });
    });

    describe('actions', () => {
        beforeEach(() => {
            settings = useSettings(pinia);
        });

        it('should populate default UUIDs', () => {
            settings.populate();
            const uuidKeys = Object.keys(settings.data.uuids);
            expect(uuidKeys.length).toBe(5);
            expect(settings.data.uuids['77f340db-ac0d-20e8-aa3a-f656a29f236c'].name).toBe('SemBeacon DEMO');
            expect(settings.data.uuids['f7826da6-4fa2-4e98-8024-bc5b71e0893e'].name).toBe('Kontakt.io');
            expect(settings.data.uuids['b9407f30-f5f8-466e-aff9-25556b57fe6d'].name).toBe('Estimote');
        });

        it('should add custom UUID', () => {
            settings.populate();
            const newUuid = '12345678-1234-1234-1234-123456789abc';
            settings.data.uuids[newUuid] = { name: 'Custom' };
            expect(settings.data.uuids[newUuid].name).toBe('Custom');
        });
    });
});
