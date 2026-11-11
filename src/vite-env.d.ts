/// <reference types="vite/client" />

/** From package.json, baked in at build time (see vite.config.ts). */
declare const __APP_VERSION__: string;
/** The short commit hash the build came from. */
declare const __APP_COMMIT__: string;
/** When the build was made (ISO date). */
declare const __APP_BUILT__: string;
