import { defineStore } from 'pinia';
import { SolidClientService, SolidSession } from '@openhps/solid/browser';
import { LocalStorageDriver } from '@openhps/localstorage';
import { Browser } from '@capacitor/browser';
import { IriString, Subject, User } from '@openhps/rdf';
import { rdfs, RDFSerializer } from '@openhps/rdf';
import { BLESemBeacon, BLESemBeaconBuilder, SEMBEACON_FLAG_MOVING } from '@sembeacon/openhps';
import { SimulatedBeacon, useBeaconAdvertisingStore } from './beacon.advertising';
import fetch from 'cross-fetch';
import { Toast } from '@capacitor/toast';

const CLIENT_NAME = 'SemBeacon Application';
const CLIENT_ID = 'https://sembeacon.org/id.jsonld';

export interface UserState {
    user: User;
    ready: boolean;
}

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
        Browser.addListener('browserFinished', () => {
            console.log('Browser finished');
            throw new Error('User cancelled login');
        });
        Browser.open({
            url: redirectUrl,
            windowName: '_self',
            presentationStyle: 'popover',
        });
    },
});

export const useUserStore = defineStore('user', {
    state: (): UserState => ({
        user: undefined,
        ready: false,
    }),
    getters: {
        webId(): string {
            return service && service.session.info.webId;
        },
        session(): SolidSession {
            return service && service.session;
        },
        isLoggedIn(): boolean {
            return this.session && this.session.info.isLoggedIn;
        },
        fetch(): typeof _fetch {
            return this.session ? this.session.fetch : fetch;
        },
    },
    actions: {
        once(event: string, callback: (...args: any[]) => void) {
            service.once(event, callback);
        },
        on(event: string, callback: (...args: any[]) => void) {
            service.on(event, callback);
        },
        handleLogin(): void {
            service
                .handleLogin()
                .then((session) => {
                    console.log('HANDLE LOGIN', session);
                })
                .catch((err) => {
                    // Do not handle
                    console.error('HANDLE LOGIN', err);
                });
        },
        initialize(): Promise<void> {
            return new Promise((resolve) => {
                service.on('login', (session: SolidSession) => {
                    console.log(`Logged in ${session.info.webId}`);
                    this.fetchProfile(session, session.info.webId)
                        .then(() => {
                            return this.createBeacon();
                        })
                        .then((beacon: SimulatedBeacon) => {
                            console.log('Created user beacon', beacon);
                            const beaconStore = useBeaconAdvertisingStore();
                            beacon.latency = 'balanced';
                            beacon.power = 'medium';
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
                service
                    .login(issuer, remember)
                    .then(() => resolve())
                    .catch(reject);
            });
        },
        logout(): Promise<void> {
            return new Promise((resolve, reject) => {
                service
                    .logout(this.session)
                    .then(() => {
                        this.user = undefined;
                        Toast.show({
                            text: `Logged out from ${this.session.info.webId}`,
                        });
                        resolve();
                    })
                    .catch(reject);
            });
        },
        fetchProfile(session: SolidSession, webId: IriString): Promise<User> {
            return new Promise((resolve, reject) => {
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
                    urlShortener: (url: string): Promise<string> => {
                        return new Promise((resolve, reject) => {
                            fetch(`https://s.sembeacon.org/shorten?api=Y5Y2SRZ2zo&uri=${url}`)
                                .then((response) => {
                                    resolve(response.text());
                                })
                                .catch(reject);
                        });
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
