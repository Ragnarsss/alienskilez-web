/**
 * Contrato de datos con la Lambda del catálogo de YouTube (ALS-027). Espejo
 * a mano del shape que devuelve `aws/youtube-catalog/index.mjs` — mismo
 * criterio que `features/discografia/discografia.ts` (ALS-026): sin un
 * paquete compartido entre frontend y Lambda, este es el único lugar que
 * describe la forma esperada de la respuesta.
 */
export interface VideoItem {
  readonly id: string
  readonly title: string
  readonly publishedAt: string
  readonly thumbnailUrl: string
  readonly videoUrl: string
  readonly embedUrl: string
}

function isVideoItem(value: unknown): value is VideoItem {
  if (typeof value !== "object" || value === null) return false
  const candidate = value as Record<string, unknown>
  return (
    typeof candidate.id === "string" &&
    typeof candidate.title === "string" &&
    typeof candidate.publishedAt === "string" &&
    typeof candidate.thumbnailUrl === "string" &&
    typeof candidate.videoUrl === "string" &&
    typeof candidate.embedUrl === "string"
  )
}

/**
 * Valida y extrae la lista de videos del body ya parseado de la respuesta —
 * nunca confiar en la forma de una respuesta de red sin chequearla entera,
 * ni siquiera viniendo de una función propia (mismo criterio que
 * `parseDiscographyCatalog`, ver ALS-026: ya cambió de forma una vez por un
 * cambio ajeno). `null` es la señal de "no confiable" — el llamador la trata
 * igual que cualquier otro fallo de red (fallback, ver ALS-045).
 */
export function parseVideoCatalog(body: unknown): readonly VideoItem[] | null {
  if (typeof body !== "object" || body === null) return null
  const videos = (body as Record<string, unknown>).videos
  if (!Array.isArray(videos)) return null
  return videos.every(isVideoItem) ? (videos as VideoItem[]) : null
}
