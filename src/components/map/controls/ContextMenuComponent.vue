<template>
    <ol-context-menu-control :items="contextMenuItems" :default-items="false" />
</template>

<script lang="ts">
import { Vue, Options, Inject } from 'vue-property-decorator';
import type { Map } from 'ol';
import type { Item } from 'ol-contextmenu/dist/types';
import { cloudUploadOutline } from 'ionicons/icons';

@Options({
    components: {},
})
export default class ContextMenuComponent extends Vue {
    @Inject() map: Map;

    get contextMenuItems(): Item[] {
        const items: Item[] = [];
        items.push({
            text: 'Add a Marker',
            callback: (val) => {
                console.log(val);
            },
        });
        // Floor controls
        items.push('-');
        items.push({
            text: 'Upload floor plan',
            icon: cloudUploadOutline,
            callback: (val) => {
                console.log(val);
            },
        });
        return items;
    }
}
</script>
