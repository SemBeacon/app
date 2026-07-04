import { ControllerState } from '@/stores/types';

describe('ControllerState Enum', () => {
    it('should have READY state', () => {
        expect(ControllerState.READY).toBe(0);
    });

    it('should have INITIALIZING state', () => {
        expect(ControllerState.INITIALIZING).toBe(1);
    });

    it('should have PENDING state', () => {
        expect(ControllerState.PENDING).toBe(2);
    });

    it('should have NO_PERMISSION state', () => {
        expect(ControllerState.NO_PERMISSION).toBe(3);
    });

    it('should have NOT_SUPPORTED state', () => {
        expect(ControllerState.NOT_SUPPORTED).toBe(4);
    });

    it('should have DISABLED state', () => {
        expect(ControllerState.DISABLED).toBe(5);
    });

    it('should have 6 states total', () => {
        const stateValues = Object.values(ControllerState).filter(v => typeof v === 'number');
        expect(stateValues.length).toBe(6);
    });
});
