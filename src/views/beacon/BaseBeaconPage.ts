import { Vue, Prop, ComponentBase } from 'vue-facing-decorator';
import { BLEBeaconObject, BLEUUID } from '@openhps/rf';
import { Beacon, useBeaconStore } from '@/stores/beacon.scanning';
import { SimulatedBeacon, useBeaconAdvertisingStore } from '@/stores/beacon.advertising';
import { formatDistanceStrict } from 'date-fns';
import { useSettings } from '@/stores/settings';
import { GeographicalPosition } from '@openhps/core';
import { ref } from 'vue';
import { TimeService } from '@openhps/core';
import BLECompanies from '@/models/BLECompanies.json';

export { BLECompanies };

@ComponentBase({
    
})
export abstract class BaseBeaconPage extends Vue {
    // Data
    readonly BLEUUID: typeof BLEUUID = BLEUUID;

    // Props
    @Prop() beacon?: BLEBeaconObject & (Beacon | SimulatedBeacon);
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
        return formatDistanceStrict(new Date(this.beacon.createdTimestamp), new Date(), {
            addSuffix: true,
        });
    }

    lastSeen(): string {
        if ((this.beacon as Beacon).lastSeen === undefined) {
            return '';
        }
        return formatDistanceStrict(new Date((this.beacon as Beacon).lastSeen), new Date(), {
            addSuffix: true,
        });
    }

    get manufacturer(): string {
        const manufacturerId: number = this.beacon.manufacturerId;
        const manufacturerIdHex = `0x${manufacturerId.toString(16).toUpperCase().padStart(4, '0')}`;
        return manufacturerIdHex;
    }

    set manufacturer(value: string) {
        // Convert value hex string (0x1234) to number
        const manufacturerId = parseInt(value, 16);
        this.beacon.manufacturerId = manufacturerId;
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

export interface IBLECompanies {
    [key: `0x${string}`]: string;
}
