/**
 * Configuración del consumo de la Lambda de catálogo de Spotify (ALS-026,
 * ADR-11, sección Discografía — ALS-044).
 *
 * La Function URL es pública por diseño (endpoint de solo lectura, sin datos
 * de usuario — ver `aws/spotify-catalog/README.md`), pero igual se
 * parametriza por entorno en vez de hardcodearse en el componente: si la
 * función se redespliega y cambia de URL, es una variable de entorno nueva,
 * no un cambio de código.
 */
export const SPOTIFY_CATALOG_URL = import.meta.env.VITE_SPOTIFY_CATALOG_URL ?? ""

/** `true` mientras no haya una Function URL configurada en este entorno. */
export const IS_SPOTIFY_CATALOG_CONFIGURED = SPOTIFY_CATALOG_URL !== ""
