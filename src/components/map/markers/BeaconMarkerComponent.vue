<template>
    <div>
        <ol-vector-layer
            ref="markerLayer"
            :z-index="4"
            :update-while-animating="true"
            :update-while-interacting="true"
        >
            <ol-source-vector ref="sourceRef">
                <ol-feature v-for="beacon in beacons" :key="beacon.uid">
                    <ol-geom-point :coordinates="coordinates(beacon)" />
                    <ol-style>
                        <ol-style-icon
                            :src="markerIcon(beacon)"
                            :scale="40 / 639.13"
                            :anchor="[13 / 40, 39 / 40]"
                        >
                        </ol-style-icon>
                    </ol-style>
                </ol-feature>
            </ol-source-vector>
        </ol-vector-layer>
        <ol-overlay
            v-if="selectedBeacon.position"
            ref="overlayRef"
            :position="[coordinates(selectedBeacon)[0], coordinates(selectedBeacon)[1]]"
        >
            <div class="ol-popup">
                <span class="key">{{ selectedBeacon.displayName }}</span
                ><br />
                <div v-if="selectedBeacon.lastSeen">
                    <span class="key">Last seen: </span
                    ><span class="value">{{ lastSeen(selectedBeacon) }}</span
                    ><br />
                    <span class="key">RSSI: </span
                    ><span class="value">{{ selectedBeacon.rssi }} dBm</span><br />
                    <span class="key">Distance: </span
                    ><span class="value">{{ selectedBeacon.distance }} m</span>
                </div>
            </div>
        </ol-overlay>
    </div>
</template>

<script lang="ts">
import { Vue, Options, Prop, Ref, Watch, Inject } from 'vue-property-decorator';
import { BLEAltBeacon, BLEBeaconObject, BLEEddystone, BLEiBeacon } from '@openhps/rf';
import { BLESemBeacon } from '@sembeacon/openhps';
import { isProxy, toRaw } from 'vue';
import { Beacon, useBeaconStore } from '../../../stores/beacon.scanning';
import moment from 'moment';
import type { Coordinate } from 'ol/coordinate';
import { fromLonLat } from 'ol/proj';
import type { Vector } from 'ol/layer';
import type Overlay from 'ol/Overlay';
import type { Style } from 'ol/style';
import type VectorSource from 'ol/source/Vector';
import type { Feature } from 'ol';
import type { Point } from 'ol/geom';
import type { Map as OlMap } from 'ol';

@Options({
    components: { },
})
export default class BeaconMarkerComponent extends Vue {
    @Prop() beacons: Array<BLEBeaconObject & Beacon>;
    @Prop() visible: boolean;
    beaconStore = useBeaconStore();
    @Ref('markerLayer') markerLayer: { vectorLayer: Vector<any> };
    @Ref('overlayRef') overlayRef: { overlay: Overlay };
    @Ref('sourceRef') sourceRef: { source: VectorSource };
    @Ref('interactionRef') interacitonRef: { select: any };
    selectedBeacon: BLEBeaconObject & Beacon = {} as any;
    @Inject() map: OlMap;

    @Watch('visible')
    onVisibilityChange(visible: boolean): void {
        this.markerLayer.vectorLayer.setVisible(visible);
    }

    getBeaconByMarker(marker: Feature<Point>): BLEBeaconObject & Beacon {
        if (marker === undefined || marker === null) {
            return undefined;
        }
        const candidates = this.beacons
            .map((b) => {
                return {
                    beacon: b,
                    coordinates: this.coordinates(b),
                };
            })
            .filter((b) => {
                const coord = marker.getGeometry().getCoordinates();
                return b.coordinates[0] === coord[0] && b.coordinates[1] === coord[1];
            });
        if (candidates.length > 0) {
            return candidates[0].beacon;
        } else {
            return undefined;
        }
    }

    coordinates(beacon: BLEBeaconObject): Coordinate {
        if (!beacon.position) {
            return undefined;
        }
        const array = beacon.position.toVector3().toArray();
        if (array && array[1]) {
            return fromLonLat([array[0], array[1]]);
        } else {
            return undefined;
        }
    }

    mounted() {
        this.map.on('singleclick', (e) => {
            const features: Feature[] = [];
            this.map.forEachFeatureAtPixel(
                e.pixel,
                (feature: Feature) => {
                    if (
                        this.sourceRef &&
                        this.sourceRef.source.getFeatureByUid((feature as any).ol_uid) !== undefined
                    ) {
                        features.push(feature);
                    }
                },
                {
                    hitTolerance: 10,
                },
            );
            if (features) {
                this.onClick(features);
            }
        });

        // Modify the opacity of markers when not seen for a while
        setInterval(() => {
            this.sourceRef.source.getFeatures().forEach((marker: Feature<Point>) => {
                const image = (marker.getStyle() as Style).getImage();
                if (image) {
                    image.setOpacity(this.opacity(this.getBeaconByMarker(marker)));
                }
                this.markerLayer.vectorLayer.changed();
            });
        }, 1000);
    }

    opacity(beacon: BLEBeaconObject & Beacon): number {
        if (beacon.lastSeen === undefined) {
            return 0.5;
        } else if (Date.now() - beacon.lastSeen > 30000) {
            return 0.5;
        } else if (Date.now() - beacon.lastSeen > 15000) {
            return 0.75;
        } else if (Date.now() - beacon.lastSeen > 5000) {
            return 0.85;
        } else {
            return 1;
        }
    }

    onClick(features: Feature[]) {
        if (features.length === 0) {
            this.selectedBeacon = {} as any;
            return;
        }
        const selectedMarker = this.sourceRef.source.getFeatureByUid((features[0] as any).ol_uid);
        const selectedBeacon = this.getBeaconByMarker(selectedMarker as Feature<Point>);
        if (selectedBeacon) {
            this.selectedBeacon = selectedBeacon;
        } else {
            this.selectedBeacon = {} as any;
        }
    }

    lastSeen(beacon: Beacon): string {
        if (beacon.lastSeen === undefined) {
            return '';
        }
        return moment(beacon.lastSeen).fromNow();
    }

    markerIcon(beacon: BLEBeaconObject): string {
        let rawBeacon = beacon;
        if (isProxy(rawBeacon)) {
            rawBeacon = toRaw(rawBeacon);
        }

        if (rawBeacon instanceof BLESemBeacon) {
            return '/assets/beacons/sembeacon_marker.svg';
        } else if (rawBeacon instanceof BLEiBeacon) {
            return '/assets/beacons/ibeacon_marker.svg';
        } else if (rawBeacon instanceof BLEEddystone) {
            return '/assets/beacons/eddystone_marker.svg';
        } else if (rawBeacon instanceof BLEAltBeacon) {
            return '/assets/beacons/altbeacon_marker.svg';
        } else {
            return '/assets/beacons/bluetooth_marker.svg';
        }
    }
}
</script>

<style scoped>
span.key {
    font-weight: bold;
}
.ol-popup {
    position: absolute;
    background-color: white;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.2);
    padding: 15px;
    border-radius: 10px;
    border: 1px solid #cccccc;
    bottom: 12px;
    left: -50px;
    min-width: 170px;
    color: black;
    opacity: 0.75;
}
.ol-popup:after,
.ol-popup:before {
    top: 100%;
    border: solid transparent;
    content: ' ';
    height: 0;
    width: 0;
    position: absolute;
    pointer-events: none;
}
.ol-popup:after {
    border-top-color: white;
    border-width: 10px;
    left: 48px;
    margin-left: -10px;
}
.ol-popup:before {
    border-top-color: #cccccc;
    border-width: 11px;
    left: 48px;
    margin-left: -11px;
}
.ol-popup-closer {
    text-decoration: none;
    position: absolute;
    top: 2px;
    right: 8px;
}
.ol-popup-closer:after {
    content: '✖';
}
</style>
