<template>
    <ion-fab id="edit-fab" slot="fixed" vertical="top" horizontal="end" :edge="true">
        <ion-fab-button
            color="primary"
        >
            <ion-icon name="create-outline"></ion-icon>
        </ion-fab-button>
         <ion-fab-list side="bottom">
            <ion-fab-button>
                <ion-icon name="create-outline"></ion-icon>
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
        IonFabList
    },
})
export default class EditFabComponent extends Vue {
    mounted(): void {}
}
</script>

<style scoped>

</style>
