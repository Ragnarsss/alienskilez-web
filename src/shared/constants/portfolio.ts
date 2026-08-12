/**
 * Trabajos destacados, en formato de línea de tiempo (no grilla plana):
 * cuenta una progresión de capacidades, no una lista de logos.
 *
 * Contenido pendiente. Cada entrada corresponde a una línea de servicio real
 * y describe qué tipo de trabajo va ahí, para que reemplazar el placeholder
 * sea solo cambiar strings.
 *
 * `embedUrl` acepta una URL de embed de Spotify (open.spotify.com/embed/...)
 * o YouTube (youtube.com/embed/...). Mientras esté vacía se renderiza un
 * marcador, nunca un iframe roto.
 */
export interface PortfolioItem {
  readonly id: string
  readonly title: string
  readonly artist: string
  readonly role: string
  readonly year: string
  readonly description: string
  readonly embedUrl: string
  readonly pending: boolean
}

export const PORTFOLIO_ITEMS = [
  {
    id: "produccion",
    title: "[Nombre del track o EP]",
    artist: "[Artista]",
    role: "Producción musical",
    year: "[Año]",
    description:
      "[Qué se hizo: dirección de sonido, arreglos, instrumentación — y qué resultado tuvo el lanzamiento]",
    embedUrl: "",
    pending: true,
  },
  {
    id: "mezcla-master",
    title: "[Nombre del track o álbum]",
    artist: "[Artista]",
    role: "Mezcla y masterización",
    year: "[Año]",
    description: "[Punto de partida, qué se corrigió y cómo quedó el material final]",
    embedUrl: "",
    pending: true,
  },
  {
    id: "grabacion",
    title: "[Nombre de la sesión o proyecto]",
    artist: "[Artista]",
    role: "Grabación",
    year: "[Año]",
    description: "[Qué se grabó: voces, instrumentos, cuántas sesiones, qué salió de ahí]",
    embedUrl: "",
    pending: true,
  },
  {
    id: "visuales",
    title: "[Nombre del videoclip o pieza]",
    artist: "[Artista]",
    role: "Visuales",
    year: "[Año]",
    description: "[Concepto visual y su relación con el track]",
    embedUrl: "",
    pending: true,
  },
  {
    id: "show-en-vivo",
    title: "[Nombre del show o gira]",
    artist: "[Artista]",
    role: "Show en vivo",
    year: "[Año]",
    description: "[Armado del set, montaje técnico, tamaño de la instancia]",
    embedUrl: "",
    pending: true,
  },
] as const satisfies readonly PortfolioItem[]

export const HAS_PENDING_PORTFOLIO = PORTFOLIO_ITEMS.some((item) => item.pending)
