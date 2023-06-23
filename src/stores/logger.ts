import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { defineStore } from 'pinia';

export interface LogEntry {
    timestamp: number;
    level: string;
    message: string;
}

const start = Date.now();

export const useLogger = defineStore('logging', {
    state: () => ({
        logs: []
    }),
    getters: { 

    },
    actions: {
        initialize() {
            Filesystem.requestPermissions().then(() => {
                Filesystem.mkdir({
                    path: "sembeacon",
                    directory:  Directory.Documents
                }).catch(console.error);    
            });
        },
        log(level: string, message: string) {
            const timestamp = Date.now();
            this.logs.push({
                timestamp,
                level,
                message
            });
            console.log(level, message);
            this.save();
        },
        save(): Promise<void> {
            return new Promise((resolve, reject) => {
                Filesystem.writeFile({
                    path: `sembeacon/${start}_log.txt`,
                    data: this.logs.map((log: LogEntry) => {
                        return `[${new Date(log.timestamp)}][${log.level}] ${log.message}`;
                    }).join("\n"),
                    directory: Directory.Documents,
                    encoding: Encoding.UTF8,
                }).then(() => resolve()).catch(reject);
            });
        }
    }
});
