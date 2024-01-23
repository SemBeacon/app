import { defineStore } from 'pinia';
import { useSettings } from './settings';
import axios from 'axios';
import { Coordinate } from 'ol/coordinate';

export interface GeocoderState {
    accessToken: string;
}

interface GeocoderResult {
    text: string;
    relevance: number;
}

/**
 * MapBox Geocoder
 */
export const useGeocoder = defineStore('geocoder', {
    state: (): GeocoderState => ({
        accessToken: undefined,
    }),
    getters: {},
    actions: {
        initialize(): void {
            const settings = useSettings();
            this.accessToken = settings.accessToken;
        },
        search(query: string): Promise<GeocoderResult[]> {
            return new Promise((resolve, reject) => {
                const querySanitized = query.replace(/[\u00A0-\u9999<>\&]/g, function (i) {
                    return '&#' + i.charCodeAt(0) + ';';
                });
                const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${querySanitized}.json?access_token=${this.accessToken}`;
                axios
                    .get(url)
                    .then((response) => {
                        const features = response.data.features as GeocoderResult[];
                        resolve(features);
                    })
                    .catch(reject);
            });
        },
    },
});
