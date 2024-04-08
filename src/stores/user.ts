import { defineStore } from 'pinia';
import { SolidClientService, SolidSession } from '@openhps/solid/browser';
import { LocalStorageDriver } from '@openhps/localstorage';
import { Browser } from '@capacitor/browser';
import { IriString, Subject, User } from '@openhps/rdf';
import { rdfs, RDFSerializer } from '@openhps/rdf';
import { BLESemBeacon, BLESemBeaconBuilder, SEMBEACON_FLAG_MOVING } from '@sembeacon/openhps';
import { useBeaconAdvertisingStore } from './beacon.advertising';

const DEBUG = false;
const CLIENT_NAME = 'SemBeacon Application';
const CLIENT_ID = DEBUG
    ? 'https://sembeacon.org/id_debug.jsonld'
    : 'https://sembeacon.org/id.jsonld';

export interface UserState {
    service: SolidClientService;
    user: User;
    ready: boolean;
}

export const useUserStore = defineStore('user', {
    state: (): UserState => ({
        service: undefined,
        user: undefined,
        ready: false,
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
        on(event: string, callback: (...args: any[]) => void) {
            this.service.on(event, callback);
        },
        handleLogin(): void {
            this.service.handleLogin().then((session) => {
                console.log('HANDLE LOGIN', session);	
            }).catch((err) => {
                // Do not handle
                console.error("HANDLE LOGIN", err);
            });
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
                            windowName: '_self',
                        });
                    },
                });
                this.service = service;
                service.on('login', (session: SolidSession) => {
                    console.log(`Logged in ${session.info.webId}`);
                    this.fetchProfile(session, session.info.webId)
                        .then(() => {
                            return this.createBeacon();
                        })
                        .then((beacon) => {
                            console.log("Created user beacon", beacon);
                            const beaconStore = useBeaconAdvertisingStore();
                            beaconStore.addSimulatedBeacon(beacon.uid, beacon);
                        })
                        .catch((err) => {
                            console.error(err);
                        });
                });
                service.once('ready', () => {
                    console.log('Solid service is ready');
                    resolve();
                });
                service.emitAsync('build');
            });
        },
        authenticate(issuer: string, remember?: boolean): Promise<void> {
            return new Promise((resolve, reject) => {
                const service: SolidClientService = this.service;
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
        fetchProfile(session: SolidSession, webId: IriString): Promise<User> {
            return new Promise((resolve, reject) => {
                const service: SolidClientService = this.service;
                service
                    .getThing(session, webId)
                    .then((card) => {
                        const user = RDFSerializer.deserializeFromSubjects(card.url as IriString, [
                            card as Subject,
                        ]) as User;
                        if (!user.name && card.predicates[rdfs.seeAlso]) {
                            // Get extended profile
                            const extendedProfile = card.predicates[rdfs.seeAlso].namedNodes[0];
                            return service.getThing(session, extendedProfile);
                        } else {
                            this.user = user;
                            resolve(user);
                            return;
                        }
                    })
                    .then((profile) => {
                        if (profile) {
                            this.user = RDFSerializer.deserializeFromSubject(this.profile);
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
                if (user === undefined) {
                    return resolve(undefined);
                }
                BLESemBeaconBuilder.create({
                    bitly: {
                        accessToken: '5acd0aa037c74dd34287db2e914246603d97c84a',
                        groupGuid: "Bo46fA1eqqx"
                    },
                })
                    .resourceUri(user.id as IriString)
                    .displayName(user.name)
                    .flag(SEMBEACON_FLAG_MOVING)
                    .instanceId(0x01)
                    .build()
                    .then((beacon) => {
                        beacon.object = user;
                        beacon.uid = beacon.computeUID();
                        resolve(beacon);
                    })
                    .catch(reject);
            });
        },
    },
});
