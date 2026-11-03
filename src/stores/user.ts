import { defineStore } from 'pinia';
import { SolidClientService, SolidSession } from '@openhps/solid/browser';
import { LocalStorageDriver } from '@openhps/localstorage';
import { Browser } from '@capacitor/browser';
import { IriString, Subject, User } from '@openhps/rdf';
import { rdfs, RDFSerializer } from '@openhps/rdf';
import { BLESemBeacon, BLESemBeaconBuilder, SEMBEACON_FLAG_MOVING } from '@sembeacon/openhps';
import { useBeaconAdvertisingStore } from './beacon.advertising';
import type { Raw } from 'vue';
import fetch from 'cross-fetch';
import { Toast } from '@capacitor/toast';
import { useLogger } from './logger';
import { shortenUrl } from '@/services/semBeacon';

const CLIENT_NAME = 'SemBeacon Application';
const CLIENT_ID = 'https://sembeacon.org/id.jsonld';

export interface UserState {
    // Raw<> keeps the class type (Pinia's state typing would unwrap it)
    user: Raw<User>;
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
    handleRedirect: (redirectUrl: string, callback: (error?: Error) => void) => {
        const logger = useLogger();
        // Use @capacitor/browser
        Browser.addListener('browserFinished', () => {
            logger.log('info', 'Browser finished');
            callback(new Error('User cancelled login'));
        });
        logger.log('info', `Opening browser for login at ${redirectUrl}`);
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
                    this.fetchProfile(session, session.info.webId as IriString)
                        .then(() => this.createBeacon())
                        .then((beacon) => {
                            if (!beacon) {
                                return;
                            }
                            // Advertise the user's WebID with a lower power and rate
                            return useBeaconAdvertisingStore().addSimulatedBeacon(
                                beacon.uid,
                                Object.assign(beacon, {
                                    latency: 'balanced',
                                    power: 'medium',
                                } as const),
                            );
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
                            this.user = RDFSerializer.deserializeFromSubject(
                                profile as Subject & { url: IriString },
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
                if (user === undefined) {
                    return resolve(undefined);
                }
                BLESemBeaconBuilder.create({ urlShortener: shortenUrl })
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
