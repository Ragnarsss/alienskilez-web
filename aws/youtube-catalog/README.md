# `alienskilez-youtube-catalog` — Lambda de catálogo de YouTube

Implementa el "paso 0" de ALS-027 (ver `docs/backlog.md`): mismo patrón cerrado en ADR-11
(`docs/architecture.md`) que `aws/spotify-catalog/`, aplicado a YouTube Data API v3. Función de
**solo lectura**, sin datos de usuario, que expone el catálogo de videos subidos al canal de
ALIENSKILEZ — el frontend nunca toca la API de YouTube directo, ni la API key viaja al bundle.

## Desplegado (registro real, no instrucción)

- **Cuenta/región:** AWS del Productor, región `us-east-2` (misma cuenta que
  `alienskilez-spotify-catalog`).
- **Función:** `alienskilez-youtube-catalog`, runtime Node.js 20.x+.
- **Archivo desplegado:** `index.mjs` (ESM) vía el editor inline de la consola de Lambda — sin
  build ni dependencias empaquetadas, mismo criterio que Spotify.
- **Secreto:** `alienskilez/youtube` en Secrets Manager (mismo `us-east-2`), formato
  `{ "apiKey": "..." }`.
- **Variables de entorno:** `YOUTUBE_CHANNEL_ID=UCTEBjTNvuyP9APPGqFxRtWw`,
  `YOUTUBE_SECRET_NAME=alienskilez/youtube`.
- **Timeout:** 10 segundos.
- **Permisos:** rol de ejecución con policy inline (`secretsmanager:GetSecretValue`) restringida
  al ARN del secreto.
- **Function URL:** con auth `NONE`, CORS restringido a `https://deotroplaneta.cl` y
  `https://www.deotroplaneta.cl` (más `http://localhost:5173` durante desarrollo — sacar esa
  entrada al cerrar el ciclo de desarrollo de ALS-045).
- **URL real:** `https://rmtwnmstkfe6yn7e4jyj3zgeym0tjufw.lambda-url.us-east-2.on.aws/` — pública
  por diseño, no es un secreto.

## Verificado (2026-08-25)

- `GET` sin credenciales devuelve `200` con el catálogo real del canal `@alienskilez` (9 videos,
  incluye "Kail BRL X Alienskilez - CONVENCETE" del 2026-08-23, no placeholder).
- CORS responde `Access-Control-Allow-Origin: https://deotroplaneta.cl` cuando el `Origin` de la
  petición coincide.

## Cómo se llegó acá (Channel ID)

`UCTEBjTNvuyP9APPGqFxRtWw` — canal `@alienskilez` (el mismo enlazado en el footer del sitio,
`SITE.SOCIALS`). Verificado como canal real y activo, no solo asumido por el seudónimo —
confirmado abriendo `https://youtube.com/@alienskilez` y leyendo el `externalId` embebido en la
página pública (sin login ni API key). La API key salió de una cuenta de Google Cloud del
desarrollador, no de la cuenta del canal — no hace falta esa combinación (ver
`docs/backlog.md` ALS-027).

## Diseño (igual al de Spotify, ver `aws/spotify-catalog/README.md` para el porqué de cada
decisión — no se repite acá lo que ya está ahí)

- AWS Lambda con Function URL, sin API Gateway.
- API key en AWS Secrets Manager, formato `{ "apiKey": "..." }` — nombre de secreto sugerido:
  `alienskilez/youtube`.
- CORS restringido en la propia Function URL al origen de producción (más `localhost:5173`
  durante desarrollo del frontend de ALS-045, a sacar al cerrar ese ciclo).
- Caché en memoria del contenedor con TTL (`CACHE_TTL_SECONDS`, default 3600s).
- Timeout sugerido: 10s (dos llamadas HTTP externas encadenadas — resolver playlist + paginar
  items — igual que Spotify encadena auth + catálogo).
- Permisos: rol de ejecución con policy inline `secretsmanager:GetSecretValue` restringida al
  ARN del secreto — no acceso general a Secrets Manager.

## Por qué función aparte y no un segundo handler en `alienskilez-spotify-catalog`

ADR-11 dejaba ambas opciones abiertas ("puede ser la misma función... no un servicio aparte").
Se eligió función aparte acá: mantiene cada Lambda desplegable y revisable de forma
independiente, y no obliga a re-desplegar/retocar `alienskilez-spotify-catalog` (ya desplegada y
verificada) solo para agregar YouTube. El costo es dos funciones a mantener en vez de una — con
solo dos, no justifica todavía IaC (mismo umbral que ALS-031 ya fijó).

## Cuota de la YouTube Data API v3

El handler resuelve el catálogo en dos llamadas baratas (`channels.list` + `playlistItems.list`,
1 unidad de cuota cada una) en vez de `search.list` (100 unidades por llamada), que agotaría la
cuota diaria gratuita (10.000 unidades/día) en pocos refrescos de caché si el TTL fuera corto.
Con el TTL de 1h por defecto, el consumo diario esperado es trivial de cualquier forma.
