import { defineStore } from 'pinia';
import { SolidClientService, SolidSession } from '@openhps/solid/browser';
import { LocalStorageDriver } from '@openhps/localstorage';
import { Browser } from '@capacitor/browser';

const CLIENT_NAME = "SemBeacon Application";

export interface UserState {
    service: SolidClientService;
}
  
export const useUserStore = defineStore('user', {
    state: (): UserState => ({
        service: undefined,
    }),
    getters: {
        session(): SolidSession {
            return this.service && this.service.session;
        },
        isLoggedIn(): boolean {
            return this.session && this.session.info.isLoggedIn;
        }
    },
    actions: {
        initialize(): Promise<void> {
            return new Promise((resolve) => {
                const redirectUrl = window.location.origin + "/login";
                const service = new SolidClientService({
                    clientName: CLIENT_NAME,
                    dataServiceDriver: new LocalStorageDriver<string, string>(String as any, {
                        namespace: CLIENT_NAME.toLowerCase().replace(/\s/g, '_'),
                    }),
                    redirectUrl,
                    restorePreviousSession: true,
                    handleRedirect: (redirectUrl: string) => {
                        // Use @capacitor/browser
                        Browser.open({
                            url: redirectUrl
                        });
                    }
                });
                service.emit('build');
                service.on('login', (session: SolidSession) => {
                    console.log(`Logged in ${session.info.webId}`);
                    this.fetchProfile();
                });
                this.service = service;
                service.once('ready', () => {
                    resolve();
                });
            });
        },
        authenticate(issuer: string): Promise<void> {
            return new Promise((resolve, reject) => {
                const service: SolidClientService = this.service;
                service.login(issuer).then(() => resolve()).catch(reject);
            });
        },
        fetchProfile(): Promise<void> {
            return new Promise((resolve, reject) => {
                const service: SolidClientService = this.service;
                service.getThing(this.session, this.session.info.webId).then(card => {
                    console.log(card);
                    resolve();
                }).catch(reject);
            });
        }
    }
});