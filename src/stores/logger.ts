import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { defineStore } from 'pinia';

export interface LogEntry {
    timestamp: number;
    level: string;
    message: string;
    error?: Error;
}

/** Number of entries kept in memory; older entries only remain in the log file. */
export const MAX_LOG_ENTRIES = 500;
/** Log lines are written in batches instead of rewriting the file per line. */
export const FLUSH_DELAY_MS = 1000;

const LOG_DIRECTORY = 'sembeacon';
const LOG_FILE = `${LOG_DIRECTORY}/${Date.now()}_log.txt`;

// Write buffer: not reactive state, only used to batch file writes
let pending: LogEntry[] = [];
let flushTimer: ReturnType<typeof setTimeout> | undefined;
let flushing: Promise<void> = Promise.resolve();

function formatEntry(entry: LogEntry): string {
    return `[${new Date(entry.timestamp).toISOString()}][${entry.level}] ${entry.message}`;
}

export const useLogger = defineStore('logging', {
    state: () => ({
        logs: [] as LogEntry[],
    }),
    actions: {
        async initialize(): Promise<void> {
            try {
                await Filesystem.requestPermissions();
                await Filesystem.mkdir({
                    path: LOG_DIRECTORY,
                    directory: Directory.Documents,
                    recursive: true,
                });
            } catch (err) {
                // Already existing directory or no file access: logging to the console still works
                console.warn('Unable to create the SemBeacon log directory.', err);
            }
        },
        log(level: string, message: string | any, error?: Error): void {
            const entry: LogEntry = { timestamp: Date.now(), level, message, error };
            this.logs.push(entry);
            if (this.logs.length > MAX_LOG_ENTRIES) {
                this.logs.splice(0, this.logs.length - MAX_LOG_ENTRIES);
            }
            console.log(level, message);
            if (error) {
                console.error(error.stack);
            }
            pending.push(entry);
            if (flushTimer === undefined) {
                flushTimer = setTimeout(() => {
                    flushTimer = undefined;
                    this.save();
                }, FLUSH_DELAY_MS);
            }
        },
        /**
         * Append pending entries to the log file. Writes are chained so they never overlap,
         * and failures are reported to the console instead of becoming unhandled rejections.
         */
        save(): Promise<void> {
            const entries = pending;
            pending = [];
            if (entries.length === 0) {
                return flushing;
            }
            flushing = flushing
                .then(() =>
                    Filesystem.appendFile({
                        path: LOG_FILE,
                        data: entries.map(formatEntry).join('\n') + '\n',
                        directory: Directory.Documents,
                        encoding: Encoding.UTF8,
                    }),
                )
                .catch((err) => console.warn('Unable to write the SemBeacon log file.', err));
            return flushing;
        },
    },
});
