import { Vue, Prop } from 'vue-property-decorator';
import { BLEBeaconObject, BLEUUID } from '@openhps/rf';
import { Beacon, useBeaconStore } from '@/stores/beacon.scanning';
import { useBeaconAdvertisingStore } from '@/stores/beacon.advertising';
import moment from 'moment';
import { useSettings } from '@/stores/settings';
import { GeographicalPosition } from '@openhps/core';
import { ref } from 'vue';
import { TimeService } from '@openhps/core';

// List of all companies and their Bluetooth Manufacturer ID
const BLECompanies = require('../../models/BLECompanies.json'); // eslint-disable-line

export abstract class BaseBeaconPage extends Vue {
    // Data
    readonly BLEUUID: typeof BLEUUID = BLEUUID;

    // Props
    @Prop() beacon?: BLEBeaconObject & Beacon;
    @Prop() edit: boolean;
    @Prop() readonly: boolean;
    @Prop() loading: boolean;
    @Prop() type: string;

    // Stores
    beaconStore = useBeaconStore();
    beaconSimulatorStore = useBeaconAdvertisingStore();
    settings = useSettings();

    // Refresher
    key: string = ref(TimeService.now().toString() + Math.random()) as unknown as string;

    mounted() {
        setInterval(() => {
            (this.key as any) = (this.beacon ? this.beacon.uid : '') + TimeService.now();
        }, 500);
    }

    uuid32Options = {
        mask: [...Array(8).fill(/[a-fA-F0-9]/)],
        elementPredicate: (el: HTMLIonInputElement) => {
            return new Promise((resolve) => {
                requestAnimationFrame(async () => {
                    const input = await el.getInputElement();
                    resolve(input);
                });
            });
        },
    };
    uuid80Options = {
        mask: [...Array((80 / 8) * 2).fill(/[a-fA-F0-9]/)],
        elementPredicate: (el: HTMLIonInputElement) => {
            return new Promise((resolve) => {
                requestAnimationFrame(async () => {
                    const input = await el.getInputElement();
                    resolve(input);
                });
            });
        },
    };
    uuid48Options = {
        mask: [...Array((48 / 8) * 2).fill(/[a-fA-F0-9]/)],
        elementPredicate: (el: HTMLIonInputElement) => {
            return new Promise((resolve) => {
                requestAnimationFrame(async () => {
                    const input = await el.getInputElement();
                    resolve(input);
                });
            });
        },
    };
    uuid128Options = {
        mask: [
            ...Array(8).fill(/[a-fA-F0-9]/),
            '-',
            ...Array(4).fill(/[a-fA-F0-9]/),
            '-',
            ...Array(4).fill(/[a-fA-F0-9]/),
            '-',
            ...Array(4).fill(/[a-fA-F0-9]/),
            '-',
            ...Array(12).fill(/[a-fA-F0-9]/),
        ],
        elementPredicate: (el: HTMLIonInputElement) => {
            return new Promise((resolve) => {
                requestAnimationFrame(async () => {
                    const input = await el.getInputElement();
                    resolve(input);
                });
            });
        },
    };

    firstSeen(): string {
        if (this.beacon.createdTimestamp === undefined) {
            return '';
        }
        return moment(this.beacon.createdTimestamp).fromNow();
    }

    lastSeen(): string {
        if (this.beacon.lastSeen === undefined) {
            return '';
        }
        return moment(this.beacon.lastSeen).fromNow();
    }

    get manufacturer(): string {
        if (this.beacon.manufacturerData.size === 0) {
            return undefined;
        }
        const manufacturerId: number = this.beacon.manufacturerData.keys().next().value;
        const manufacturerIdHex = `0x${manufacturerId.toString(16).toUpperCase().padStart(4, '0')}`;
        const companyName = BLECompanies[manufacturerIdHex];
        if (!companyName) {
            return manufacturerIdHex;
        }
        return `${companyName} (${manufacturerIdHex})`;
    }

    beaconType(): string {
        return this.type;
    }

    get beaconIcon(): string {
        const beaconType = this.beaconType();
        return `/assets/beacons/${beaconType.toLowerCase()}${
            this.settings.darkMode ? '_alpha' : ''
        }.svg`;
    }

    get position(): GeographicalPosition {
        return this.beacon.position as GeographicalPosition;
    }
}
