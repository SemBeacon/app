<template>
    <ion-item>
        <ion-label>
            <h2>{{ item.displayName }}</h2>
            <p>{{ item.uid }}</p>
        </ion-label>
        <ion-label slot="end">
            <small>{{ item.rssi }}</small>
        </ion-label>
    </ion-item>
</template>


<script lang="ts">
import { Vue, Options, Prop } from 'vue-property-decorator';
import { IonItem, IonLabel } from '@ionic/vue';
import { BLEObject } from '@openhps/rf';

@Options({
  components: {
    IonItem, IonLabel
  }
})
export default class BeaconItemComponent extends Vue {
  @Prop() item: BLEObject;

}
</script>

<style scoped lang="scss">

</style>