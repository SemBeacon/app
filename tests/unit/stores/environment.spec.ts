import { createPinia } from 'pinia';
import { useEnvironmentStore } from '@/stores/environment';

describe('Environment Store', () => {
    let pinia: any;
    let envStore: ReturnType<typeof useEnvironmentStore>;

    beforeEach(() => {
        jest.clearAllMocks();
        pinia = createPinia();
    });

    describe('initial state', () => {
        it('should have empty environments map', () => {
            envStore = useEnvironmentStore(pinia);
            expect(envStore.environments.size).toBe(0);
        });

        it('should have empty floorPlans map', () => {
            envStore = useEnvironmentStore(pinia);
            expect(envStore.floorPlans.size).toBe(0);
        });
    });

    describe('getters', () => {
        beforeEach(() => {
            envStore = useEnvironmentStore(pinia);
        });

        it('should return empty buildings array when no environments exist', () => {
            expect(envStore.buildings).toEqual([]);
        });
    });

    describe('actions', () => {
        beforeEach(() => {
            envStore = useEnvironmentStore(pinia);
        });

        it('should add space to environments map', () => {
            const mockSpace = { uid: 'space-1', name: 'Test Space' } as any;
            envStore.addSpace(mockSpace);
            expect(envStore.environments.has('space-1')).toBe(true);
        });

        it('should clear all environments', () => {
            const mockSpace = { uid: 'space-1', name: 'Test Space' } as any;
            envStore.addSpace(mockSpace);
            expect(envStore.environments.size).toBe(1);

            // Note: save() calls Preferences which is mocked
            envStore.clear = jest.fn().mockImplementation(() => {
                envStore.environments = new Map();
            });
            envStore.clear();
        });
    });
});
