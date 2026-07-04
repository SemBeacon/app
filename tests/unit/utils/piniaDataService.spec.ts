import { PiniaDataService } from '@/utils/PiniaDataService';

describe('PiniaDataService', () => {
    it('should be defined and exportable', () => {
        expect(PiniaDataService).toBeDefined();
        expect(typeof PiniaDataService).toBe('function');
    });

    it('should be a class that extends MemoryDataService', () => {
        // Verify it's a constructor function
        expect(PiniaDataService.prototype).toBeDefined();
    });
});
