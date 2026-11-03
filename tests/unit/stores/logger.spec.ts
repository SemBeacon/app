import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Filesystem } from '@capacitor/filesystem';
import { FLUSH_DELAY_MS, MAX_LOG_ENTRIES, useLogger } from '@/stores/logger';

// Capacitor plugins are proxies that cannot be spied on; replace the module instead
vi.mock('@capacitor/filesystem', () => ({
    Directory: { Documents: 'DOCUMENTS', External: 'EXTERNAL' },
    Encoding: { UTF8: 'utf8' },
    Filesystem: { appendFile: vi.fn(), mkdir: vi.fn(), requestPermissions: vi.fn() },
}));

beforeEach(() => {
    vi.mocked(Filesystem.appendFile).mockReset().mockResolvedValue();
    vi.spyOn(console, 'log').mockImplementation(() => undefined);
});

afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
});

describe('logger store', () => {
    it('batches log lines into a single append', async () => {
        vi.useFakeTimers();
        const append = vi.mocked(Filesystem.appendFile);
        const logger = useLogger();
        logger.log('info', 'first');
        logger.log('warn', 'second');
        expect(append).not.toHaveBeenCalled();

        await vi.advanceTimersByTimeAsync(FLUSH_DELAY_MS);
        expect(append).toHaveBeenCalledTimes(1);
        const { data } = append.mock.calls[0][0];
        expect(data).toMatch(/\[info\] first\n.*\[warn\] second\n$/);
    });

    it('does not reject when the file cannot be written', async () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
        vi.mocked(Filesystem.appendFile).mockRejectedValue(new Error('no access'));
        const logger = useLogger();
        logger.log('info', 'message');
        await expect(logger.save()).resolves.toBeUndefined();
        expect(warn).toHaveBeenCalled();
    });

    it('keeps a bounded history in memory', () => {
        const logger = useLogger();
        for (let i = 0; i < MAX_LOG_ENTRIES + 10; i++) {
            logger.log('debug', `line ${i}`);
        }
        expect(logger.logs).toHaveLength(MAX_LOG_ENTRIES);
        expect(logger.logs.at(-1)?.message).toBe(`line ${MAX_LOG_ENTRIES + 9}`);
    });

    it('initialize() tolerates an existing log directory', async () => {
        vi.mocked(Filesystem.requestPermissions).mockResolvedValue({ publicStorage: 'granted' });
        vi.mocked(Filesystem.mkdir).mockRejectedValue(new Error('exists'));
        vi.spyOn(console, 'warn').mockImplementation(() => undefined);
        await expect(useLogger().initialize()).resolves.toBeUndefined();
    });
});
