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
 * - YouTube: construido desde el mismo seudónimo asumiendo handle moderno
 *   (@alienskilez). Verificar que la URL resuelva antes del deploy.
 * - Spotify: la URL de artista usa un ID opaco que no se puede derivar del
 *   nombre. `pending: true` hace que el enlace NO se renderice hasta tener
 *   la URL real, en vez de publicar un link roto.
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
    // TODO: reemplazar por la URL real del perfil de artista en Spotify.
    url: "",
    pending: true,
  },
] as const
