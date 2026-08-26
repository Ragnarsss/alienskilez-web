/**
 * Configuración del consumo de la Lambda de catálogo de YouTube (ALS-027,
 * ADR-11, sección Video — ALS-045). Mismo criterio que
 * `constants/discografia.ts` (ALS-026/ALS-044).
 *
 * La Function URL es pública por diseño (endpoint de solo lectura, sin datos
 * de usuario — ver `aws/youtube-catalog/README.md`), pero igual se
 * parametriza por entorno en vez de hardcodearse en el componente: si la
 * función se redespliega y cambia de URL, es una variable de entorno nueva,
 * no un cambio de código.
 */
export const VIDEO_CATALOG_URL = import.meta.env.VITE_YOUTUBE_CATALOG_URL ?? ""

/** `true` mientras no haya una Function URL configurada en este entorno. */
export const IS_VIDEO_CATALOG_CONFIGURED = VIDEO_CATALOG_URL !== ""
