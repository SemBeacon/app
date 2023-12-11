<template>
    <ol-context-menu-control :items="contextMenuItems" />
</template>

<script lang="ts">
import { Vue, Options, Inject, Watch, Prop } from 'vue-property-decorator';
import type { Map } from 'ol';

@Options({
    components: {},
})
export default class ContextMenuComponent extends Vue {
    get contextMenuItems(): any[] {
        return undefined;
    }
}
</script>
