<template>
    <ion-card v-if="hasSemantics">
        <ion-card-header>
            <ion-card-title>Semantic data</ion-card-title>
            <ion-card-subtitle v-if="semantics.system">
                {{ semantics.system.label }}
            </ion-card-subtitle>
        </ion-card-header>
        <ion-card-content>
            <div v-if="semantics.system" class="system">
                <h2>System</h2>
                <p v-if="semantics.system.subsystems.length > 0" class="secondary">
                    Subsystems: {{ semantics.system.subsystems.join(', ') }}
                </p>
                <p v-else class="secondary">This beacon describes a semantic system.</p>
            </div>

            <div v-if="observables.length > 0">
                <h2>Observable properties</h2>
                <ion-list lines="none">
                    <ion-item v-for="property in observables" :key="property.id">
                        <ion-label>
                            <h3>{{ property.label }}</h3>
                            <p v-if="property.lastObservation">
                                {{ property.lastObservation.value }}
                                <span v-if="property.lastObservation.time" class="secondary">
                                    · {{ formatTime(property.lastObservation.time) }}
                                </span>
                            </p>
                            <p v-else class="secondary">No observation available</p>
                        </ion-label>
                    </ion-item>
                </ion-list>
            </div>

            <div v-if="actuatables.length > 0">
                <h2>Actuatable properties</h2>
                <ion-list lines="none">
                    <ion-item
                        v-for="property in actuatables"
                        :key="property.id"
                        :disabled="!demoMode"
                    >
                        <ion-label>
                            <h3>{{ property.label }}</h3>
                            <p v-if="property.lastActuation">
                                {{ property.lastActuation.value }}
                                <span v-if="property.lastActuation.time" class="secondary">
                                    · {{ formatTime(property.lastActuation.time) }}
                                </span>
                            </p>
                            <p v-else class="secondary">No actuation available</p>
                        </ion-label>
                        <ion-toggle
                            v-if="demoMode && isBoolean(property)"
                            :checked="property.lastActuation?.literal === true"
                            aria-label="Actuate the property"
                            @ionChange="(event) => actuate(property, event.detail.checked)"
                        ></ion-toggle>
                    </ion-item>
                </ion-list>
                <p v-if="!demoMode" class="secondary actuation-note">
                    Actuation is only available for the built-in demo device.
                </p>
            </div>

            <ion-button fill="clear" size="small" :disabled="loading" @click="refresh">
                <ion-icon slot="start" :icon="refreshOutline"></ion-icon>
                Refresh
            </ion-button>
        </ion-card-content>
    </ion-card>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-facing-decorator';
import {
    IonButton,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardSubtitle,
    IonCardTitle,
    IonIcon,
    IonItem,
    IonLabel,
    IonList,
    IonToggle,
} from '@ionic/vue';
import { BLESemBeacon } from '@sembeacon/openhps';
import { Beacon, useBeaconStore } from '@/stores/beacon.scanning';
import {
    parseSemBeaconSemantics,
    SemanticProperty,
    SemanticResult,
} from '@/utils/SemBeaconProperties';
import { addIcons } from 'ionicons';
import { refreshOutline } from 'ionicons/icons';

addIcons({
    refreshOutline,
});

@Component({
    components: {
        IonButton,
        IonCard,
        IonCardContent,
        IonCardHeader,
        IonCardSubtitle,
        IonCardTitle,
        IonIcon,
        IonItem,
        IonLabel,
        IonList,
        IonToggle,
    },
})
export default class SemBeaconInteractionComponent extends Vue {
    @Prop() beacon: BLESemBeacon & Beacon;
    @Prop() loading: boolean = false;
    /** Local changes made by the demo actuation control. */
    overrides: Record<string, SemanticResult> = {};
    beaconStore = useBeaconStore();

    get semantics(): ReturnType<typeof parseSemBeaconSemantics> {
        return parseSemBeaconSemantics(this.beacon);
    }

    get hasSemantics(): boolean {
        return (
            this.semantics !== undefined &&
            (this.semantics.system !== undefined || this.semantics.properties.length > 0)
        );
    }

    get properties(): SemanticProperty[] {
        return (this.semantics?.properties ?? []).map((property) => ({
            ...property,
            lastActuation: this.overrides[property.id] ?? property.lastActuation,
        }));
    }

    get observables(): SemanticProperty[] {
        return this.properties.filter((property) => property.observable);
    }

    get actuatables(): SemanticProperty[] {
        return this.properties.filter((property) => property.actuatable);
    }

    get demoMode(): boolean {
        return this.beaconStore.demoMode;
    }

    isBoolean(property: SemanticProperty): boolean {
        return typeof property.lastActuation?.literal === 'boolean';
    }

    formatTime(time: Date): string {
        return new Date(time).toLocaleString();
    }

    actuate(property: SemanticProperty, value: boolean): void {
        if (!this.demoMode) {
            return;
        }
        this.overrides = {
            ...this.overrides,
            [property.id]: {
                value: String(value),
                literal: value,
                time: new Date(),
            },
        };
    }

    refresh(): void {
        this.$emit('refresh');
    }
}
</script>

<style scoped lang="scss">
h2 {
    margin-top: 1em;
    margin-bottom: 0.25em;
    font-size: 1rem;
    font-weight: bold;
}

.secondary {
    color: var(--ion-color-medium-shade);
}

.actuation-note {
    margin: 0.25em 0 0;
    font-size: 0.85rem;
}

ion-item {
    --padding-start: 0;
    --inner-padding-end: 0;
}
</style>
