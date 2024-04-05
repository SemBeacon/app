import { defineStore } from 'pinia';
import { SolidClientService, SolidSession } from '@openhps/solid/browser';
import { LocalStorageDriver } from '@openhps/localstorage';
import { Browser } from '@capacitor/browser';
import { IriString, Subject, User } from '@openhps/rdf';
import { rdfs, RDFSerializer } from '@openhps/rdf';
import { BLESemBeacon, BLESemBeaconBuilder } from '@sembeacon/openhps';

const DEBUG = true;
const CLIENT_NAME = 'SemBeacon Application';
const CLIENT_ID = DEBUG ? 'https://sembeacon.org/id_debug.jsonld' : 'https://sembeacon.org/id.jsonld';

export interface UserState {
    service: SolidClientService;
    user: User;
    beacons: BLESemBeacon[];
    ready: boolean;
}

export const useUserStore = defineStore('user', {
    state: (): UserState => ({
        service: undefined,
        user: undefined,
        beacons: [],
        ready: false
    }),
    getters: {
        webId(): string {
            return this.service && this.service.session.info.webId;
        },
        session(): SolidSession {
            return this.service && this.service.session;
        },
        isLoggedIn(): boolean {
            return this.session && this.session.info.isLoggedIn;
        },
    },
    actions: {
        once(event: string, callback: (...args: any[]) => void) {
            this.service.once(event, callback);
        },
        initialize(): Promise<void> {
            return new Promise((resolve) => {
                const redirectUrl = window.location.origin + '/login';
                const service = new SolidClientService({
                    clientId: CLIENT_ID,
                    dataServiceDriver: new LocalStorageDriver<string, string>(String as any, {
                        namespace: CLIENT_NAME.toLowerCase().replace(/\s/g, '_'),
                    }),
                    redirectUrl,
                    restorePreviousSession: true,
                    handleRedirect: (redirectUrl: string) => {
                        // Use @capacitor/browser
                        Browser.open({
                            url: redirectUrl,
                            windowName: '_self'
                        });
                    },
                });
                this.service = service;
                service.on('login', (session: SolidSession) => {
                    console.log(`Logged in ${session.info.webId}`);
                    this.fetchProfile(session);
                });
                service.once('ready', () => {
                    console.log('Solid service is ready');	
                    resolve();
                });
                service.on('error', err => {
                    // Show a toast message with the login error
                    
                    console.error(err);
                })
                service.emitAsync('build');
            });
        },
        authenticate(issuer: string, remember?: boolean): Promise<void> {
            return new Promise((resolve, reject) => {
                const service: any = this.service;
                if (remember) {
                    console.log("remember me");
                }
                service
                    .login(issuer, remember)
                    .then(() => resolve())
                    .catch(reject);
            });
        },
        logout(): Promise<void> {
            return new Promise((resolve, reject) => {
                const service: SolidClientService = this.service;
                service
                    .logout(this.session)
                    .then(() => {
                        this.user = undefined;
                        resolve();
                    })
                    .catch(reject);
            });
        },
        fetchProfile(session: SolidSession = this.session): Promise<User> {
            return new Promise((resolve, reject) => {
                const service: SolidClientService = this.service;
                if (!session.info.isLoggedIn) {
                    return reject(new Error(`User is not logged in!`));
                }
                service
                    .getThing(session, session.info.webId)
                    .then((card) => {
                        const user = RDFSerializer.deserializeFromSubjects(card.url as IriString, [card as Subject]) as User;
                        if (!user.name && card.predicates[rdfs.seeAlso]) {
                            // Get extended profile
                            const extendedProfile = card.predicates[rdfs.seeAlso].namedNodes[0];
                            return service.getThing(this.session, extendedProfile);
                        } else {
                            this.user = user;
                            resolve(user);
                            return;
                        }
                    })
                    .then((profile) => {
                        if (profile) {
                            this.user = RDFSerializer.deserializeFromSubject(
                                this.profile
                            );
                            resolve(this.user);
                        } else {
                            reject(new Error(`User profile is not accessible!`));
                        }
                    })
                    .catch(reject);
            });
        },
        createBeacon(): Promise<BLESemBeacon> {
            return new Promise((resolve, reject) => {
                const user: User = this.user;
                BLESemBeaconBuilder.create()
                    .resourceUri(this.service.session.info.webId)
                    .displayName(user.name)
                    //.namespaceId(BLEUUID.fromString(''))
                    .instanceId(0x01)
                    .build().then((beacon) => {
                        resolve(beacon);
                    }).catch(reject);
            });
        }
    },
});
