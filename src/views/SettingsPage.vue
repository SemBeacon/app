<template>
    <ion-page>
        <ion-header>
            <ion-toolbar>
                <ion-buttons slot="start">
                    <ion-menu-button></ion-menu-button>
                </ion-buttons>
                <ion-title>Settings</ion-title>
            </ion-toolbar>
        </ion-header>

        <ion-content :fullscreen="true">
            <ion-card>
                <ion-card-header>
                    <ion-card-title>Why do we need UUIDs?</ion-card-title>
                </ion-card-header>
                <ion-card-content>
                    We need UUIDs on iOS because it can only scan for beacons with known UUIDs (iBeacon). SemBeacons will automatically resolve and be added to this list.
                </ion-card-content>
            </ion-card>
            <ion-list>
                <ion-item-sliding v-for="(uuidObj, uuid) in uuids()" :key="uuid">
                    <ion-item>
                        <ion-label>
                            <h2>{{ uuidObj.name }}</h2>
                            <p>{{ uuid }}</p>
                        </ion-label>
                    </ion-item>
                    <ion-item-options side="end">
                        <ion-item-option color="danger" @click="removeUUID(uuid as string)">
                            Delete
                        </ion-item-option>
                    </ion-item-options>
                </ion-item-sliding>
            </ion-list>

            <ion-fab slot="fixed" horizontal="end" vertical="bottom">
                <ion-fab-button
                    @click="addUUID"
                >
                    <ion-icon name="add-outline"></ion-icon>
                </ion-fab-button>
            </ion-fab>
        </ion-content>
    </ion-page>
</template>

<script lang="ts">
import { actionSheetController } from '@ionic/vue';
import { Vue, Component } from 'vue-facing-decorator';
import {
    IonButtons,
    IonContent,
    IonHeader,
    IonMenuButton,
    IonPage,
    IonTitle,
    IonToolbar,
    IonList,
    IonItem,
    IonLabel,
    IonSelect,
    IonSelectOption,
    IonButton,
    IonRow,
    IonCol,
} from '@ionic/vue';
import { useSettings } from '@/stores/settings';
import { useLogger } from '@/stores/logger';
import { Toast } from '@capacitor/toast';
import { addOutline } from 'ionicons/icons';
import { addIcons } from 'ionicons';

addIcons({
    addOutline,
});

@Component({
    components: {
        IonButtons,
        IonContent,
        IonHeader,
        IonMenuButton,
        IonPage,
        IonTitle,
        IonToolbar,
        IonList,
        IonItem,
        IonLabel,
        IonSelect,
        IonSelectOption,
        IonButton,
        IonRow,
        IonCol,
    },
})
export default class SettingsPage extends Vue {
    settings = useSettings();
    logger = useLogger();
    uuids(): { [key: string]: { name: string } } {
        return this.settings.data.uuids;
    }

    async addUUID(): Promise<void> {
        const uuid = prompt('Enter UUID:');
        if (!uuid) return;
        const name = prompt('Enter Name for UUID:');
        if (!name) return;
        if (this.settings.data.uuids[uuid]) {
            await Toast.show({ text: 'UUID already exists.' });
            return;
        }
        this.settings.data.uuids[uuid] = { name };
        this.settings.save().then(() => {
            Toast.show({ text: `Added UUID ${uuid}` });
        }).catch(err => {
            this.logger.log('error', `Failed to add UUID: ${err.message}`);
        });
    }

    removeUUID(uuid: string) {
        delete this.settings.data.uuids[uuid];
        this.settings.save().then(() => {
            Toast.show({
                text: `Removed UUID ${uuid}`,
            });
        }).catch(err => {
            this.logger.log('error', `Failed to remove UUID: ${err.message}`);
        });
    }

    mounted() {

    }
}
</script>

<style scoped lang="scss">

</style>
