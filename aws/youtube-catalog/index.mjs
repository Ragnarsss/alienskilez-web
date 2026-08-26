/**
 * ALS-027 — Lambda de solo lectura para el catálogo de YouTube de ALIENSKILEZ.
 *
 * Mismo patrón que ALS-026 (`aws/spotify-catalog/index.mjs`), decisión cerrada en ADR-11:
 *   - AWS Lambda con Function URL, sin API Gateway (un único GET, no hace falta).
 *   - La API key de YouTube Data API v3 vive en AWS Secrets Manager, nunca en el bundle del
 *     frontend — aunque es de menor sensibilidad que el client_secret de Spotify (es de solo
 *     lectura, no Client Credentials), se guarda igual, sin excepción.
 *   - CORS restringido al origen de producción — se configura en la propia Function URL
 *     (consola → Configuración → CORS), no acá, para no repetir esa política en dos lugares.
 *   - Caché en memoria del contenedor de Lambda con TTL: mismo criterio que Spotify, este
 *     volumen de tráfico no justifica DynamoDB/ElastiCache.
 *
 * Función aparte (no un segundo handler dentro de la Lambda de Spotify, aunque ADR-11 dejaba
 * ambas abiertas): mantiene cada función desplegable y revisable de forma independiente, y no
 * obliga a tocar `alienskilez-spotify-catalog` (ya desplegada y verificada) para agregar YouTube.
 *
 * Runtime esperado: Node.js 20.x+ como módulo ESM (`.mjs`). Trae `fetch` global y el AWS SDK v3
 * ya incluido en la imagen base — no hace falta empaquetar dependencias para esta función.
 *
 * Variables de entorno:
 *   YOUTUBE_CHANNEL_ID   — Channel ID de YouTube (no es secreto, se parametriza igual para no
 *                          editar código si cambia).
 *   YOUTUBE_SECRET_NAME  — nombre del secreto en Secrets Manager, formato JSON:
 *                          { "apiKey": "..." }
 *   CACHE_TTL_SECONDS    — opcional, default 3600 (1 hora, mismo criterio que ADR-11).
 *   YOUTUBE_MAX_RESULTS  — opcional, default 50 (máximo permitido por página de la API).
 *
 * Forma de la respuesta (mismo contrato que ALS-044/`useDiscografia`, adaptado a video —
 * ver ALS-045):
 *   {
 *     channelId: string,
 *     updatedAt: string (ISO 8601),
 *     videos: Array<{
 *       id: string,
 *       title: string,
 *       publishedAt: string (ISO 8601),
 *       thumbnailUrl: string,
 *       videoUrl: string,
 *       embedUrl: string,   // youtube.com/embed/{id} — mismo criterio de iframe que
 *                            // embedUrl en el catálogo de Spotify.
 *     }>
 *   }
 *
 * NO DESPLEGADO TODAVÍA (ver docs/backlog.md ALS-027): falta el Channel ID real de YouTube del
 * Productor y una API key restringida del Google Cloud Console para poder configurar y probar
 * esta función contra datos reales. Este archivo es el "paso 0" — código listo, sin depender de
 * esas dos cosas para escribirse, igual que se hizo con ALS-026.
 */

import { SecretsManagerClient, GetSecretValueCommand } from "@aws-sdk/client-secrets-manager"

const secretsClient = new SecretsManagerClient({})

// Caché en memoria del contenedor — mismo criterio que ALS-026: sobrevive entre invocaciones
// mientras Lambda no recicle el contenedor, sin garantía de persistencia, suficiente para este
// volumen de tráfico.
let cache = { data: null, expiresAt: 0 }

async function getYoutubeApiKey() {
  const secretName = process.env.YOUTUBE_SECRET_NAME
  if (!secretName) {
    throw new Error("Falta YOUTUBE_SECRET_NAME en la configuración de la función")
  }
  const response = await secretsClient.send(new GetSecretValueCommand({ SecretId: secretName }))
  const { apiKey } = JSON.parse(response.SecretString)
  if (!apiKey) {
    throw new Error(`El secreto ${secretName} no tiene apiKey`)
  }
  return apiKey
}

// El catálogo se arma en dos pasos, igual de baratos en cuota que el auth+catálogo de Spotify:
// 1) resolver el playlist de "subidos" del canal (channels.list, 1 unidad de cuota),
// 2) paginar ese playlist (playlistItems.list, 1 unidad por página).
// Evita search.list (100 unidades por llamada) que agotaría la cuota diaria gratuita en pocos
// refrescos de caché.
async function getUploadsPlaylistId(apiKey, channelId) {
  const url =
    `https://www.googleapis.com/youtube/v3/channels` +
    `?part=contentDetails&id=${channelId}&key=${apiKey}`

  const response = await fetch(url)
  if (!response.ok) {
    const detail = await response.text()
    throw new Error(`YouTube channels request falló: ${response.status} — ${detail}`)
  }
  const body = await response.json()
  const playlistId = body.items?.[0]?.contentDetails?.relatedPlaylists?.uploads
  if (!playlistId) {
    throw new Error(`No se encontró el playlist de subidos para el canal ${channelId}`)
  }
  return playlistId
}

async function fetchAllPlaylistItems(apiKey, playlistId, maxResults) {
  const items = []
  let pageToken = ""

  do {
    const url =
      `https://www.googleapis.com/youtube/v3/playlistItems` +
      `?part=snippet&playlistId=${playlistId}&maxResults=${maxResults}&key=${apiKey}` +
      (pageToken ? `&pageToken=${pageToken}` : "")

    const response = await fetch(url)
    if (!response.ok) {
      const detail = await response.text()
      throw new Error(`YouTube playlistItems request falló: ${response.status} — ${detail}`)
    }
    const page = await response.json()
    items.push(...page.items)
    pageToken = page.nextPageToken ?? ""
  } while (pageToken)

  return items
}

function mapItemToVideo(item) {
  const snippet = item.snippet
  const videoId = snippet.resourceId?.videoId ?? ""
  const thumbnail =
    snippet.thumbnails?.maxres?.url ??
    snippet.thumbnails?.high?.url ??
    snippet.thumbnails?.medium?.url ??
    snippet.thumbnails?.default?.url ??
    ""
  return {
    id: videoId,
    title: snippet.title,
    publishedAt: snippet.publishedAt,
    thumbnailUrl: thumbnail,
    videoUrl: `https://www.youtube.com/watch?v=${videoId}`,
    embedUrl: `https://www.youtube.com/embed/${videoId}`,
  }
}

function dedupeAndSort(items) {
  // El playlist de "subidos" no debería repetir video, pero se dedupea por id igual que
  // Spotify por consistencia y por si la API pagina con un ítem solapado en el borde.
  const byId = new Map()
  for (const item of items) {
    const videoId = item.snippet?.resourceId?.videoId
    if (videoId && !byId.has(videoId)) {
      byId.set(videoId, item)
    }
  }
  return [...byId.values()]
    .map(mapItemToVideo)
    .sort((a, b) => (a.publishedAt < b.publishedAt ? 1 : -1))
}

export const handler = async () => {
  const now = Date.now()

  if (cache.data && cache.expiresAt > now) {
    return jsonResponse(200, cache.data)
  }

  const channelId = process.env.YOUTUBE_CHANNEL_ID
  if (!channelId) {
    return jsonResponse(500, { error: "Falta YOUTUBE_CHANNEL_ID en la configuración de la función" })
  }
  const maxResults = Number(process.env.YOUTUBE_MAX_RESULTS ?? 50)
  const ttlSeconds = Number(process.env.CACHE_TTL_SECONDS ?? 3600)

  try {
    const apiKey = await getYoutubeApiKey()
    const playlistId = await getUploadsPlaylistId(apiKey, channelId)
    const rawItems = await fetchAllPlaylistItems(apiKey, playlistId, maxResults)
    const videos = dedupeAndSort(rawItems)

    const data = {
      channelId,
      updatedAt: new Date().toISOString(),
      videos,
    }

    cache = { data, expiresAt: now + ttlSeconds * 1000 }

    return jsonResponse(200, data)
  } catch (error) {
    console.error("Fallo al construir el catálogo de YouTube:", error)
    // 502: le indica al frontend que el productor de datos falló, para que muestre el
    // fallback (mismo criterio "degradar, no romper" que ALS-044/ALS-045) en vez de un
    // catálogo vacío sin explicación.
    return jsonResponse(502, { error: "No se pudo obtener el catálogo de YouTube" })
  }
}

function jsonResponse(statusCode, body) {
  return {
    statusCode,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  }
}
