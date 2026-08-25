/**
 * Contrato de datos con la Lambda del catálogo de Spotify (ALS-026). Espejo
 * a mano del shape que devuelve `aws/spotify-catalog/index.mjs` — sin un
 * paquete compartido entre frontend y Lambda, este es el único lugar que
 * describe la forma esperada de la respuesta.
 */
export interface DiscographyRelease {
  readonly id: string
  readonly title: string
  readonly type: string
  readonly releaseDate: string
  readonly coverUrl: string
  readonly spotifyUrl: string
  readonly embedUrl: string
}

function isDiscographyRelease(value: unknown): value is DiscographyRelease {
  if (typeof value !== "object" || value === null) return false
  const candidate = value as Record<string, unknown>
  return (
    typeof candidate.id === "string" &&
    typeof candidate.title === "string" &&
    typeof candidate.type === "string" &&
    typeof candidate.releaseDate === "string" &&
    typeof candidate.coverUrl === "string" &&
    typeof candidate.spotifyUrl === "string" &&
    typeof candidate.embedUrl === "string"
  )
}

/**
 * Valida y extrae la lista de lanzamientos del body ya parseado de la
 * respuesta — nunca confiar en la forma de una respuesta de red sin
 * chequearla entera, ni siquiera viniendo de una función propia (ver
 * ALS-026: ya cambió de forma una vez por un cambio ajeno, el límite de la
 * API de Spotify). `null` es la señal de "no confiable" — el llamador la
 * trata igual que cualquier otro fallo de red (fallback, ver ALS-044).
 */
export function parseDiscographyCatalog(body: unknown): readonly DiscographyRelease[] | null {
  if (typeof body !== "object" || body === null) return null
  const releases = (body as Record<string, unknown>).releases
  if (!Array.isArray(releases)) return null
  return releases.every(isDiscographyRelease) ? (releases as DiscographyRelease[]) : null
}
