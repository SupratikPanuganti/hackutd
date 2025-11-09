/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_MAPBOX_ACCESS_TOKEN?: string;
  readonly MAPBOX_ACCESS_TOKEN?: string;
  readonly VITE_VAPI_PUBLIC_KEY?: string;
  readonly VITE_VAPI_ASSISTANT_ID?: string;
  readonly VITE_VAPI_API_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
