declare module '@vue/runtime-core' {
    export interface GlobalComponents {
        BIconWifiOff: typeof import('bootstrap-icons-vue')['BIconWifiOff'];
        OlMap: typeof import('vue3-openlayers')['Map']['OlMap'];
        OlView: typeof import('vue3-openlayers')['Map']['OlView'];
        OlSourceVector: typeof import('vue3-openlayers')['Sources']['OlSourceVector'];
        OlVectorLayer: typeof import('vue3-openlayers')['Layers']['OlVectorLayer'];
        OlFeature: typeof import('vue3-openlayers')['Map']['OlFeature'];
        OlStyle: typeof import('vue3-openlayers')['Styles']['OlStyle'];
        OlStyleIcon: typeof import('vue3-openlayers')['Styles']['OlStyleIcon'];
        OlStyleFill: typeof import('vue3-openlayers')['Styles']['OlStyleFill'];
        OlStyleStroke: typeof import('vue3-openlayers')['Styles']['OlStyleStroke'];
        OlGeomPolygon: typeof import('vue3-openlayers')['Geometries']['OlGeomPolygon'];
        OlGeomPoint: typeof import('vue3-openlayers')['Geometries']['OlGeomPoint'];
        OlContextMenuControl: typeof import('vue3-openlayers')['MapControls']['OlContextMenuControl'];
        OlDrawInteraction: typeof import('vue3-openlayers')['Interactions']['OlInteractionDraw'];
        OlModifyInteraction: typeof import('vue3-openlayers')['Interactions']['OlInteractionModify'];
        OlOverlay: typeof import('vue3-openlayers')['Map']['OlOverlay'];
    }
  }
  
  export {}
