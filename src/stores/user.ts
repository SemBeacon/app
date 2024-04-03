import { defineStore } from 'pinia';
import { SolidClientService, SolidSession } from '@openhps/solid/browser';
import { LocalStorageDriver } from '@openhps/localstorage';
import { Browser } from '@capacitor/browser';
import { IriString, Subject, User } from '@openhps/rdf';
import { rdfs, RDFSerializer } from '@openhps/rdf';
import { BLESemBeacon, BLESemBeaconBuilder } from '@sembeacon/openhps';
import { BLEUUID } from '@openhps/rf';

const CLIENT_NAME = 'SemBeacon Application';

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
                    clientName: CLIENT_NAME,
                    dataServiceDriver: new LocalStorageDriver<string, string>(String as any, {
                        namespace: CLIENT_NAME.toLowerCase().replace(/\s/g, '_'),
                    }),
                    redirectUrl,
                    restorePreviousSession: true,
                    handleRedirect: (redirectUrl: string) => {
                        // Use @capacitor/browser
                        Browser.open({
                            url: redirectUrl,
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
                service.emit('build');
            });
        },
        authenticate(issuer: string, remember?: boolean): Promise<void> {
            return new Promise((resolve, reject) => {
                const service: SolidClientService = this.service;
                if (remember) {
                    console.log("remember me");
                }
                service
                    .login(issuer)
                    .then(() => resolve())
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
                            console.log(this.user)
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
                    .namespaceId(BLEUUID.fromString(''))
                    .instanceId(0x01)
                    .build().then((beacon) => {
                        resolve(beacon);
                    }).catch(reject);
            });
        }
    },
});
