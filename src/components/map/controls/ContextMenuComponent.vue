<template>
    <ol-context-menu-control :items="contextMenuItems" :default-items="false" />
</template>

<script lang="ts">
import { Vue, Component, Inject } from 'vue-facing-decorator';
import type { Map } from 'ol';
import type { Item } from 'ol-contextmenu/dist/types';
import { cloudUploadOutline } from 'ionicons/icons';

@Component({
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
                this.$emit('action:upload', val);
            },
        });
        return items;
    }
}
</script>
