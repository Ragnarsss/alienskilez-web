/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Measurement ID de GA4 (ALS-023). Ver .env.example. */
  readonly VITE_GA_MEASUREMENT_ID?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
