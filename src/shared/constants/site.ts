/**
 * Datos de identidad del negocio. Único lugar donde viven nombre, ciudad y
 * redes — ningún componente debe hardcodearlos.
 */
export const SITE = {
  NAME: "ALIENSKILEZ",
  TAGLINE: "Productor musical",
  CITY: "La Serena",
  COUNTRY: "Chile",
  LOCATION: "La Serena, Chile",
} as const

/**
 * Redes sociales.
 *
 * PENDIENTE DE VERIFICAR ANTES DE PUBLICAR:
 * - Instagram: handle confirmado por el cliente (@alienskilez).
 * - YouTube: resuelto (2026-08-25) — @alienskilez es un canal real y activo,
 *   verificado contra la página pública (no solo asumido por el seudónimo).
 *   Channel ID real `UCTEBjTNvuyP9APPGqFxRtWw`, para configurar ALS-027 —
 *   ver `aws/youtube-catalog/README.md`.
 * - Spotify: resuelto (2026-08-25, ALS-002) — mismo Artist ID confirmado por
 *   el cliente que usa la Lambda del catálogo (ALS-026).
 */
export const SOCIALS = [
  {
    id: "instagram",
    label: "Instagram",
    handle: "@alienskilez",
    url: "https://instagram.com/alienskilez",
    pending: false,
  },
  {
    id: "youtube",
    label: "YouTube",
    handle: "@alienskilez",
    url: "https://youtube.com/@alienskilez",
    pending: false,
  },
  {
    id: "spotify",
    label: "Spotify",
    handle: "ALIENSKILEZ",
    url: "https://open.spotify.com/artist/4ECRbTEyjiRHTs4c7CuwbD",
    pending: false,
  },
] as const
