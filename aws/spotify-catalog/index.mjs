/**
 * ALS-026 — Lambda de solo lectura para el catálogo de Spotify de ALIENSKILEZ.
 *
 * Diseño cerrado en ADR-11 (docs/architecture.md):
 *   - AWS Lambda con Function URL, sin API Gateway (un único GET, no hace falta).
 *   - client_id/client_secret viven en AWS Secrets Manager, nunca en el bundle del frontend.
 *   - CORS restringido al origen de producción — se configura en la propia Function URL
 *     (consola → Configuración → CORS), no acá, para no repetir esa política en dos lugares.
 *   - Caché en memoria del contenedor de Lambda con TTL: a este volumen de tráfico no
 *     justifica DynamoDB/ElastiCache.
 *
 * Runtime esperado: Node.js 20.x+ como módulo ESM (`.mjs` — el default del editor inline en
 * runtimes recientes). Trae `fetch` global y el AWS SDK v3 ya incluido en la imagen base — no
 * hace falta empaquetar dependencias para esta función.
 *
 * Variables de entorno:
 *   SPOTIFY_ARTIST_ID     — Artist ID de Spotify (no es secreto, pero se parametriza igual
 *                           para no tener que editar código si cambia).
 *   SPOTIFY_SECRET_NAME   — nombre del secreto en Secrets Manager, formato JSON:
 *                           { "clientId": "...", "clientSecret": "..." }
 *   CACHE_TTL_SECONDS     — opcional, default 3600 (1 hora, ver ADR-11).
 *   SPOTIFY_MARKET        — opcional, default "CL".
 *
 * Forma de la respuesta (contrato con el frontend, ver ALS-044):
 *   {
 *     artistId: string,
 *     updatedAt: string (ISO 8601),
 *     releases: Array<{
 *       id: string,
 *       title: string,
 *       type: "album" | "single" | "compilation",
 *       releaseDate: string,   // "YYYY-MM-DD" o "YYYY" según la precisión que da Spotify
 *       coverUrl: string,
 *       spotifyUrl: string,
 *       embedUrl: string,      // open.spotify.com/embed/album/{id} — mismo campo embedUrl
 *                               // que ya usa PortfolioItem, mismo contrato de iframe.
 *     }>
 *   }
 */

import { SecretsManagerClient, GetSecretValueCommand } from "@aws-sdk/client-secrets-manager"

const secretsClient = new SecretsManagerClient({})

// Caché en memoria del contenedor — sobrevive entre invocaciones mientras Lambda no recicle
// el contenedor. No es garantía de persistencia, es exactamente lo que ADR-11 pide: barato,
// sin infraestructura extra, suficiente para este volumen.
let cache = { data: null, expiresAt: 0 }

// El token de Spotify también se cachea aparte: dura ~1h y no tiene sentido pedirlo en cada
// invocación si el caché de catálogo ya lo cubre, pero conviene que sobreviva un cache miss
// puntual (ej. alguien fuerza refresh) sin gastar una llamada de auth de más.
let tokenCache = { accessToken: null, expiresAt: 0 }

async function getSpotifyCredentials() {
  const secretName = process.env.SPOTIFY_SECRET_NAME
  if (!secretName) {
    throw new Error("Falta SPOTIFY_SECRET_NAME en la configuración de la función")
  }
  const response = await secretsClient.send(new GetSecretValueCommand({ SecretId: secretName }))
  const { clientId, clientSecret } = JSON.parse(response.SecretString)
  if (!clientId || !clientSecret) {
    throw new Error(`El secreto ${secretName} no tiene clientId/clientSecret`)
  }
  return { clientId, clientSecret }
}

async function getAccessToken() {
  const now = Date.now()
  if (tokenCache.accessToken && tokenCache.expiresAt > now) {
    return tokenCache.accessToken
  }

  const { clientId, clientSecret } = await getSpotifyCredentials()
  const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64")

  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${basicAuth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  })

  if (!response.ok) {
    const detail = await response.text()
    throw new Error(`Spotify token request falló: ${response.status} — ${detail}`)
  }

  const body = await response.json()
  tokenCache = {
    accessToken: body.access_token,
    // Restamos 60s de margen para no usar un token a punto de vencer.
    expiresAt: now + (body.expires_in - 60) * 1000,
  }
  return tokenCache.accessToken
}

async function fetchAllAlbums(accessToken, artistId, market) {
  const albums = []
  let url =
    `https://api.spotify.com/v1/artists/${artistId}/albums` +
    `?include_groups=album,single,compilation&market=${market}&limit=10`

  while (url) {
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
    if (!response.ok) {
      const detail = await response.text()
      throw new Error(`Spotify albums request falló: ${response.status} — ${detail}`)
    }
    const page = await response.json()
    albums.push(...page.items)
    url = page.next
  }

  return albums
}

function mapAlbumToRelease(album) {
  const cover = album.images?.[0]?.url ?? ""
  return {
    id: album.id,
    title: album.name,
    type: album.album_type,
    releaseDate: album.release_date,
    coverUrl: cover,
    spotifyUrl: album.external_urls?.spotify ?? "",
    embedUrl: `https://open.spotify.com/embed/album/${album.id}`,
  }
}

function dedupeAndSort(albums) {
  // Spotify devuelve el mismo álbum una vez por mercado en el que fue reeditado — nos
  // quedamos con la primera aparición por id.
  const byId = new Map()
  for (const album of albums) {
    if (!byId.has(album.id)) {
      byId.set(album.id, album)
    }
  }
  return [...byId.values()]
    .map(mapAlbumToRelease)
    .sort((a, b) => (a.releaseDate < b.releaseDate ? 1 : -1))
}

export const handler = async () => {
  const now = Date.now()

  if (cache.data && cache.expiresAt > now) {
    return jsonResponse(200, cache.data)
  }

  const artistId = process.env.SPOTIFY_ARTIST_ID
  if (!artistId) {
    return jsonResponse(500, { error: "Falta SPOTIFY_ARTIST_ID en la configuración de la función" })
  }
  const market = process.env.SPOTIFY_MARKET ?? "CL"
  const ttlSeconds = Number(process.env.CACHE_TTL_SECONDS ?? 3600)

  try {
    const accessToken = await getAccessToken()
    const rawAlbums = await fetchAllAlbums(accessToken, artistId, market)
    const releases = dedupeAndSort(rawAlbums)

    const data = {
      artistId,
      updatedAt: new Date().toISOString(),
      releases,
    }

    cache = { data, expiresAt: now + ttlSeconds * 1000 }

    return jsonResponse(200, data)
  } catch (error) {
    console.error("Fallo al construir el catálogo de Spotify:", error)
    // 502: le indica al frontend que el productor de datos falló, para que muestre el
    // fallback (ver criterio "degradar, no romper" de ALS-044) en vez de un catálogo vacío
    // sin explicación.
    return jsonResponse(502, { error: "No se pudo obtener el catálogo de Spotify" })
  }
}

function jsonResponse(statusCode, body) {
  return {
    statusCode,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  }
}
