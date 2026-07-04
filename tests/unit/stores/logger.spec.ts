import { createPinia } from 'pinia';
import { useLogger } from '@/stores/logger';

describe('Logger Store', () => {
    let pinia: any;
    let logger: ReturnType<typeof useLogger>;

    beforeEach(() => {
        jest.clearAllMocks();
        pinia = createPinia();
    });

    describe('initial state', () => {
        it('should have empty logs array', () => {
            logger = useLogger(pinia);
            expect(logger.logs).toEqual([]);
        });
    });

    describe('actions', () => {
        beforeEach(() => {
            logger = useLogger(pinia);
        });

        it('should add log entry with correct structure', () => {
            const originalConsoleLog = console.log;
            console.log = jest.fn();

            logger.log('info', 'Test message');

            expect(logger.logs.length).toBe(1);
            expect(logger.logs[0].level).toBe('info');
            expect(logger.logs[0].message).toBe('Test message');
            expect(logger.logs[0].timestamp).toBeDefined();
            expect(typeof logger.logs[0].timestamp).toBe('number');

            console.log = originalConsoleLog;
        });

        it('should add log entry with error', () => {
            const originalConsoleLog = console.log;
            const originalConsoleError = console.error;
            console.log = jest.fn();
            console.error = jest.fn();

            const testError = new Error('Test error');
            logger.log('error', 'Something failed', testError);

            expect(logger.logs.length).toBe(1);
            expect(logger.logs[0].level).toBe('error');
            expect(logger.logs[0].error).toBe(testError);
            expect(console.error).toHaveBeenCalled();

            console.log = originalConsoleLog;
            console.error = originalConsoleError;
        });

        it('should support different log levels', () => {
            const originalConsoleLog = console.log;
            console.log = jest.fn();

            logger.log('debug', 'Debug message');
            logger.log('info', 'Info message');
            logger.log('warn', 'Warning message');
            logger.log('error', 'Error message');

            expect(logger.logs.length).toBe(4);
            expect(logger.logs[0].level).toBe('debug');
            expect(logger.logs[1].level).toBe('info');
            expect(logger.logs[2].level).toBe('warn');
            expect(logger.logs[3].level).toBe('error');

            console.log = originalConsoleLog;
        });

        it('should log multiple entries', () => {
            const originalConsoleLog = console.log;
            console.log = jest.fn();

            logger.log('info', 'First message');
            logger.log('info', 'Second message');

            expect(logger.logs.length).toBe(2);
            expect(logger.logs[0].message).toBe('First message');
            expect(logger.logs[1].message).toBe('Second message');

            console.log = originalConsoleLog;
        });
    });
});
