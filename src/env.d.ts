/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_SHORTENER_URL?: string;
    readonly VITE_CORS_PROXY_URL?: string;
    readonly VITE_MAPBOX_TOKEN?: string;
    readonly VITE_DEMO_MODE?: 'true' | 'false';
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}
