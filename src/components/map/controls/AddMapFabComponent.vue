<template>
    <ion-fab id="edit-fab" slot="fixed" vertical="top" horizontal="end">
        <ion-fab-button color="primary">
            <ion-icon name="add-sharp"></ion-icon>
        </ion-fab-button>
        <ion-fab-list side="bottom">
            <ion-fab-button>
                <ion-icon name="home-sharp"></ion-icon>
            </ion-fab-button>
            <ion-fab-button>
                <ion-icon name="layers-sharp"></ion-icon>
            </ion-fab-button>
        </ion-fab-list>
    </ion-fab>
</template>

<script lang="ts">
import { IonFab, IonFabButton, IonIcon, IonFabList } from '@ionic/vue';
import { Vue, Options } from 'vue-property-decorator';

@Options({
    components: {
        IonFab,
        IonFabButton,
        IonIcon,
        IonFabList,
    },
})
export default class AddMapFabComponent extends Vue {
    mounted(): void {}
}
</script>

<style scoped>

</style>
