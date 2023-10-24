<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar color="primary">
        <ion-buttons slot="start">
          <ion-back-button></ion-back-button>
        </ion-buttons>
        <ion-title>Beacon details</ion-title>
        <ion-buttons slot="end">
          <ion-button 
            icon-only 
            :style="{ color: '#ffffff' }"
            v-if="beacon && simulated" 
            @click="enabled = !enabled"
          >
            <ion-icon :name="enabled ? 'save-sharp' : 'create-sharp'"></ion-icon>
          </ion-button>
          <ion-button 
            icon-only 
            :style="{ color: '#ffffff' }"
            v-if="beacon && beacon.position" 
            @click="showOnMap"
          >
            <ion-icon name="locate-outline"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <template v-if="beacon">
        <!-- <ion-card>
          <ion-card-content>
            <ion-input size="20" label-placement="floating" v-model="beacon.displayName">
              <div slot="label">Name</div>
            </ion-input>
          </ion-card-content>
        </ion-card> -->

        <ion-card>
          <ion-card-content>
            <ion-grid class="compact">
              <ion-row>
                <ion-col size='2'>
                  <ion-thumbnail v-if="beaconIcon">
                    <img :alt="beaconType()" :src="beaconIcon" />
                  </ion-thumbnail>
                </ion-col>
                <ion-col size='10'>
                  <ion-grid>
                    <ion-row>
                      <ion-col size='10'>
                        <h1>{{ beaconType() }}</h1>
                      </ion-col>
                    </ion-row>
                    <ion-row :key="key">
                      <ion-col size="12">
                        <h2>RSSI: {{ beacon.rssi }} <small>dBm</small></h2>
                      </ion-col>
                      <ion-col size="6" v-if="beacon.distance">
                        <h3>Distance: {{ beacon.distance }} <small>m</small></h3>
                      </ion-col>
                      <ion-col size="6" v-else>
                        <h3>Distance: -</h3>
                      </ion-col>
                      <ion-col size="6">
                        <h3>Last seen: {{ lastSeen() }}</h3>
                      </ion-col>
                      </ion-row>
                  </ion-grid>
                </ion-col>
              </ion-row>
            </ion-grid>
          </ion-card-content>
        </ion-card>

        <ion-grid>
          <ion-row>
            <ion-col size='12' v-if="beacon.address">
              <ion-input :disabled="!enabled" size="20" label-placement="stacked" :value="beacon.address.toString()">
                <div slot="label">MAC Address</div>
              </ion-input>
            </ion-col>
            <ion-col size='12' v-if="beacon.manufacturerData">
              <ion-input :disabled="!enabled" size="20" label-placement="stacked" :value="manufacturer">
                <div slot="label">Manufacturer</div>
              </ion-input>
            </ion-col>
            <template v-if="beaconType().startsWith('Eddystone')">
              <ion-col size="12" v-if="beacon.calibratedRSSI">
                <ion-input 
                  :disabled="!enabled"
                  label-placement="floating" 
                  fill="solid"
                  placeholder="-12"
                  :value="beacon.getCalibratedRSSI(0)">
                  <div slot="label">Calibrated RSSI at 0m</div>
                </ion-input>
              </ion-col>
            </template>
            <template v-else>
              <ion-col size="12" v-if="beacon.calibratedRSSI">
                <ion-input 
                  :disabled="!enabled" 
                  label-placement="floating" 
                  fill="solid"
                  placeholder="-56"
                  :value="beacon.calibratedRSSI">
                  <div slot="label">Calibrated RSSI at 1m</div>
                </ion-input>
              </ion-col>
            </template>
            <template v-if="beaconType() === 'SemBeacon'">
                <ion-col size="12">
                  <ion-input 
                    fill="solid"
                    :disabled="!enabled"
                    label-placement="floating"
                    v-maskito="uuid128Options"
                    placeholder="00000000-0000-0000-0000-000000000000"
                    :value="beacon.namespaceId.toString()">
                    <div slot="label">Namespace ID</div>
                  </ion-input>
                </ion-col>
                <ion-col size="12">
                  <ion-input 
                    fill="solid"
                    :disabled="!enabled" 
                    label-placement="floating"
                    v-maskito="uuid32Options" 
                    placeholder="00000000"
                    :value="beacon.instanceId.toString(false)">
                    <div slot="label">
                      Instance ID
                    </div>
                  </ion-input>
                </ion-col>
                <ion-col size="12">
                  <ion-input 
                    fill="solid"
                    :disabled="!enabled" 
                    label-placement="floating"
                    placeholder="www.example.com"
                    @change="() => {
                      beacon.resourceUri = undefined; // Invalidate
                      resolveSemBeacon();
                    }"
                    v-model="beacon.shortResourceUri">
                    <div slot="label">
                      Short resource URI
                    </div>
                  </ion-input>
                </ion-col>
                <ion-col size="12" v-if="beacon.resourceUri">
                  <ion-input 
                    :disabled="!enabled" 
                    fill="solid"
                    label-placement="floating" 
                    @ionChange="() => resolveSemBeacon()"
                    v-model="beacon.resourceUri">
                    <div slot="label">
                      Resource URI
                    </div>
                  </ion-input>
                </ion-col>
                <ion-col size="12">
                  <ion-label position="floating" class="chip-label">Beacon flags</ion-label>
                  <div class="chip-container">
                    <ion-chip color="primary" v-if="beacon.hasFlag(BLESemBeacon.FLAGS.SEMBEACON_FLAG_HAS_POSITION)">
                      <ion-label>HAS_POSITION</ion-label>
                      <ion-icon v-if="enabled" icon="close-circle-outline"></ion-icon>
                    </ion-chip>
                    <ion-chip color="primary" v-if="beacon.hasFlag(BLESemBeacon.FLAGS.SEMBEACON_FLAG_PRIVATE)">
                      <ion-label>IS_PRIVATE</ion-label>
                      <ion-icon v-if="enabled" icon="close-circle-outline"></ion-icon>
                    </ion-chip>
                    <ion-chip color="primary" v-if="beacon.hasFlag(BLESemBeacon.FLAGS.SEMBEACON_FLAG_MOVING)">
                      <ion-label>IS_MOVING</ion-label>
                      <ion-icon v-if="enabled" icon="close-circle-outline"></ion-icon>
                    </ion-chip>
                    <ion-chip color="primary" v-if="beacon.hasFlag(BLESemBeacon.FLAGS.SEMBEACON_FLAG_HAS_SYSTEM)">
                      <ion-label>HAS_SYSTEM</ion-label>
                      <ion-icon v-if="enabled" icon="close-circle-outline"></ion-icon>
                    </ion-chip>
                    <ion-chip color="primary" v-if="beacon.hasFlag(BLESemBeacon.FLAGS.SEMBEACON_FLAG_HAS_TELEMETRY)">
                      <ion-label>HAS_TELEMETRY</ion-label>
                      <ion-icon v-if="enabled" icon="close-circle-outline"></ion-icon>
                    </ion-chip>
                    <ion-chip color="danger" v-if="beacon.flags === 0x00">
                      No SemBeaocn flags
                    </ion-chip>
                  </div>
                </ion-col>
            </template>
            <template v-else-if="beaconType() === 'iBeacon' || beaconType() === 'AltBeacon'">
              <ion-col size="12">
                <ion-input 
                  :disabled="!enabled" 
                  label-placement="floating" 
                  fill="solid"
                  v-maskito="uuid128Options"
                  placeholder="00000000-0000-0000-0000-000000000000"
                  :value="beacon.proximityUUID.toString()">
                  <div slot="label">Proximity UUID</div>
                </ion-input>
              </ion-col>
              <ion-col size="12">
                <ion-grid>
                  <ion-row>
                    <ion-col size="6">
                      <ion-input 
                        :disabled="!enabled"
                        label-placement="floating" 
                        fill="solid"
                        :value="beacon.major ?? 0">
                        <div slot="label">Major</div>
                      </ion-input>
                    </ion-col>
                    <ion-col size="6">
                      <ion-input 
                        :disabled="!enabled"
                        label-placement="floating" 
                        fill="solid"
                        :value="beacon.minor ?? 0">
                        <div slot="label">Minor</div>
                      </ion-input>
                    </ion-col>
                  </ion-row>
                </ion-grid>
              </ion-col>
            </template>
            <template v-else-if="beaconType() === 'Eddystone-URL'">
              <ion-col size="12">
                <ion-input 
                  :disabled="!enabled" 
                  label-placement="floating" 
                  fill="solid"
                  placeholder="www.example.com"
                  :value="beacon.url">
                  <div slot="label">URL</div>
                </ion-input>
              </ion-col>
            </template>
            <template v-else-if="beaconType() === 'Eddystone-UID'">
              <ion-col size="12">
                <ion-input 
                  :disabled="!enabled"
                  label-placement="floating" 
                  fill="solid"
                  v-maskito="uuid80Options"
                  placeholder="0000000000000000000"
                  :value="beacon.namespaceId.toString()">
                  <div slot="label">Namespace ID</div>
                </ion-input>
              </ion-col>
              <ion-col size="12">
                <ion-input 
                  :disabled="!enabled"
                  label-placement="floating" 
                  fill="solid"
                  :value="beacon.instanceId.toString()">
                  <div slot="label">Instance ID</div>
                </ion-input>
              </ion-col>
            </template>
            <template v-else-if="beaconType() === 'Eddystone-TLM'">
              <ion-col size="12">
                <ion-grid>
                  <ion-row>
                    <ion-col size="6">
                      <ion-input 
                        :disabled="!enabled" 
                        label-placement="floating" 
                        fill="solid"
                        :value="beacon.voltage + ' mV'">
                        <div slot="label">Voltage</div>
                      </ion-input>
                    </ion-col>
                    <ion-col size="6" v-if="beacon.temperature">
                      <ion-input 
                        :disabled="!enabled"
                        label-placement="floating" 
                        fill="solid"
                        :value="beacon.temperature.value + ' &deg;C'">
                        <div slot="label">Temperature</div>
                      </ion-input>
                    </ion-col>
                  </ion-row>
                </ion-grid>
              </ion-col>
            </template>
            <template v-else-if="beaconType() === 'Eddystone'">
              
            </template>
            <template v-else>
              
            </template>
            <ion-col size="12" v-if="beacon && beacon.position">
              <ion-input 
                :disabled="!enabled" 
                label-placement="stacked" 
                :value="`${beacon.position.latitude}, ${beacon.position.longitude}`">
                <div slot="label">Position</div>
              </ion-input>
            </ion-col>
          </ion-row>
        </ion-grid>
      </template>
            
      <ion-fab v-if="!simulated" slot="fixed" horizontal="end" vertical="bottom">
        <ion-fab-button @click="toggleScan" :color="this.beaconStore.isScanning ? 'danger' : 'primary'">
          <ion-spinner name="circular" v-if="loading"></ion-spinner>
          <ion-icon :name="this.beaconStore.isScanning ? 'stop' : 'search'" v-if="!loading"></ion-icon>
        </ion-fab-button>
      </ion-fab>
    </ion-content>
  </ion-page>
</template>

<script lang="ts">
import { Vue, Options } from 'vue-property-decorator';
import { 
  IonGrid,
  IonCol,
  IonRow,
  IonCardContent,
  IonCard,
  IonChip,
  IonButtons, 
  IonContent, 
  IonHeader, 
  IonBackButton, 
  IonPage, 
  IonTitle, 
  IonToolbar, 
  IonList, 
  IonItem, 
  IonLabel,
  IonFab,
  IonFabButton,
  IonSpinner,
  IonButton,
  IonIcon,
  IonThumbnail,
  IonInput,
  IonText
} from '@ionic/vue';
import { useRoute } from 'vue-router';
import { BLEBeaconObject, BLEEddystoneTLM, BLEEddystoneUID, BLEEddystoneURL } from '@openhps/rf';
import { Beacon, useBeaconStore } from '../stores/beacon.scanning';
import { BLESemBeacon } from '../models/BLESemBeacon';
import { BLEiBeacon, BLEEddystone, BLEAltBeacon } from '@openhps/rf';
import moment from 'moment';
import { Ref, ref } from 'vue';
import { TimeService } from '@openhps/core';
import { maskito } from '@maskito/vue';
import { useBeaconAdvertisingStore } from '../stores/beacon.advertising';
const BLECompanies = require('../models/BLECompanies.json'); // eslint-disable-line

const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');

@Options({
  components: {
    IonInput,
    IonThumbnail,
    IonGrid,
    IonCol,
    IonRow,
    IonCard,
    IonCardContent,
    IonButtons, 
    IonContent, 
    IonHeader, 
    IonBackButton, 
    IonPage, 
    IonTitle, 
    IonToolbar, 
    IonList, 
    IonItem, 
    IonLabel,
    IonFab,
    IonFabButton,
    IonSpinner,
    IonChip,
    IonButton,
    IonIcon,
    IonText
  },
  data: () => ({
    BLESemBeacon,
  }),
  directives: {
    maskito
  }
})
export default class BeaconPage extends Vue {
  simulated: boolean = false;
  loading = true;
  route = useRoute();
  beaconStore = useBeaconStore();
  beaconSimulatorStore = useBeaconAdvertisingStore();
  beacon: (BLEBeaconObject | BLESemBeacon) & Beacon = undefined;
  key: Ref<string> = ref(TimeService.now().toString() + Math.random());
  enabled: boolean = false;
  
  uuid32Options = {
    mask: [
      ...Array(8).fill(/[a-fA-F0-9]/),
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
  uuid80Options = {
    mask: [
      ...Array(10).fill(/[a-fA-F0-9]/),
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

  created(): void {
    const beaconUID = this.route.params.uid as string;
    console.log("Loading beacon details", beaconUID);

    if (this.route.path.startsWith("/beacon/edit")) {
      // Simulated beacon
      this.simulated = true;
      console.log(this.beaconSimulatorStore)
      const beacon = this.beaconSimulatorStore.findByUID(beaconUID);
      if (!beacon) {
        // Can not find beacon...
        this.$router.push("/beacon/simulator");
        return;
      }
      this.beacon = beacon as BLEBeaconObject as any;
      this.loading = false;
    } else {
      // Scanned beacon
      this.beaconStore.findByUID(beaconUID).then(beacon => {
        if (!beacon) {
          // Can not find beacon...
          this.$router.push("/beacon/scanner");
          return;
        }
        const beaconInfo = this.beaconStore.findBeaconInfo(beaconUID);
        this.beacon = beacon;
        this.beacon.rssi = beaconInfo.rssi;
        this.beacon.lastSeen = beaconInfo.lastSeen;
        this.beacon.distance = beaconInfo.distance;
        this.loading = false;
      }).catch(console.error);
      setInterval(() => {
        if (this.beaconStore.isScanning) {
          const beaconInfo = this.beaconStore.findBeaconInfo(beaconUID);
          this.beacon.rssi = beaconInfo.rssi;
          this.beacon.lastSeen = beaconInfo.lastSeen;
          this.beacon.distance = beaconInfo.distance;
        }
        (this.key as any) = (this.beacon ? this.beacon.uid : "") + TimeService.now();
      }, 500);
    }
  }

   beaconType(): string {
    if (this.beacon instanceof BLESemBeacon) {
      return "SemBeacon";
    } else if (this.beacon instanceof BLEiBeacon) {
      return "iBeacon";
    } else if (this.beacon instanceof BLEAltBeacon) {
      return "AltBeacon";
    } else if (this.beacon instanceof BLEEddystoneURL) {
      return "Eddystone-URL";
    } else if (this.beacon instanceof BLEEddystoneUID) {
      return "Eddystone-UID";
    } else if (this.beacon instanceof BLEEddystoneTLM) {
      return "Eddystone-TLM";
    } else if (this.beacon instanceof BLEEddystone) {
      return "Eddystone";
    } else {
      return "Bluetooth";
    }
  }

  lastSeen(): string {
    if (this.beacon.lastSeen === undefined) {
        return "";
    }
    return moment(this.beacon.lastSeen).fromNow();
  }

  toggleScan(): void {
    if (!this.loading) {
      this.loading = true;
      if (this.beaconStore.isScanning) {
        this.beaconStore.stopScan().then(() => {
          //
        }).catch(err => {
          //
          console.error(err);
        }).finally(() => {
          this.loading = false;
        });
      } else {
        // Start scan
        this.beaconStore.startScan().then(() => {
          //
        }).catch(err => {
          //
          console.error(err);
        }).finally(() => {
          this.loading = false;
        });
      }
    }
  }

  showOnMap(): void {
    this.$router.push(`/map/${this.beacon.uid}`);
  }

  get beaconIcon(): string {
    const beaconType = this.beaconType();
    return `/assets/beacons/${beaconType.toLowerCase()}${prefersDark.matches ? "_alpha" : ""}.svg`;
  }

  get manufacturer(): string {
    if (this.beacon.manufacturerData.size === 0) {
      return undefined;
    }
    const manufacturerId: number = this.beacon.manufacturerData.keys().next().value;
    const manufacturerIdHex = `0x${manufacturerId.toString(16).toUpperCase().padStart(4, "0")}`;
    const companyName = BLECompanies[manufacturerIdHex];
    if (!companyName) {
      return manufacturerIdHex;
    }
    return `${companyName} (${manufacturerIdHex})`
  }

  resolveSemBeacon(): void {
    this.loading = true;
    this.beaconStore.beaconService.resolve(this.beacon as BLESemBeacon, {
      resolveAll: false,
      persistance: false
    })
      .then((beacon: BLESemBeacon) =>{
        console.log("resolved", beacon)
        this.beacon = beacon as any;
        this.loading = false;
      }).catch(console.error);
  }

  saveBeacon(): void {
    
  }
}
</script>

<style scoped lang="scss">
ion-item.info h1,h2,h3,h4,h5 {
  margin-bottom: 0;
  padding-bottom: 0;
  margin-top: 0;
  padding-top: 0;
}
.chip-container {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
}

ion-col ion-thumbnail {
  --size: 32px;
}

ion-grid.compact {
  margin: 0;
  padding: 0;
  width: 100%;

  ion-col {
    margin: 0;
    padding: 0;
  }
}

ion-grid ion-grid {
  margin: 0;
  padding: 0;
  width: 100%;
}

ion-col h1,h2,h3,h4 {
  margin: 0;
  padding: 0;
}

</style>