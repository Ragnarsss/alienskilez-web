# `alienskilez-spotify-catalog` — Lambda de catálogo de Spotify

Implementa ALS-026 (ver `docs/backlog.md`) y el diseño cerrado en ADR-11
(`docs/architecture.md`). Función de **solo lectura**, sin datos de usuario, que expone el
catálogo real de ALIENSKILEZ en Spotify vía Client Credentials — el frontend nunca toca la Web
API de Spotify directo, ni el `client_secret` viaja al bundle.

## Desplegado (registro real, no instrucción)

- **Cuenta/región:** AWS del Productor, región `us-east-2`.
- **Función:** `alienskilez-spotify-catalog`, runtime Node.js (24.x en el momento del deploy;
  el código no depende de nada específico de esa versión — cualquier Node.js 20.x+ sirve).
- **Archivo desplegado:** `index.mjs` (ESM) vía el editor inline de la consola de Lambda — sin
  build ni dependencias empaquetadas, el AWS SDK v3 y `fetch` ya vienen en el runtime.
- **Secreto:** `alienskilez/spotify` en Secrets Manager (mismo `us-east-2`), formato
  `{ "clientId": "...", "clientSecret": "..." }`.
- **Variables de entorno:** `SPOTIFY_ARTIST_ID=4ECRbTEyjiRHTs4c7CuwbD`,
  `SPOTIFY_SECRET_NAME=alienskilez/spotify`.
- **Timeout:** 10 segundos (el default de 3s no alcanza para las dos llamadas HTTP externas
  encadenadas — auth + catálogo).
- **Permisos:** rol de ejecución con una policy inline (`secretsmanager:GetSecretValue`)
  restringida al ARN del secreto — no acceso general a Secrets Manager.
- **Function URL:** con auth `NONE` (endpoint público de solo lectura), CORS restringido a
  `https://deotroplaneta.cl` y `https://www.deotroplaneta.cl` (más `http://localhost:5173`
  durante desarrollo — sacar esa entrada de CORS al cerrar el ciclo de desarrollo del frontend
  si ya no hace falta).
- **URL real:** `https://i4vptq5uyekm6tcy7sto6awwei0ifxep.lambda-url.us-east-2.on.aws/` — pública
  por diseño (ver ADR-11), no es un secreto.

## Verificado (2026-08-25)

- `GET` sin credenciales devuelve `200` con el catálogo real (`releases` no vacío, incluye al
  menos el single "20te", 2025-02-07).
- CORS responde `Access-Control-Allow-Origin: https://deotroplaneta.cl` cuando el `Origin` de la
  petición coincide.
- Caché en memoria confirmada por `updatedAt` estable entre pedidos dentro del TTL de 1h
  (`CACHE_TTL_SECONDS`, default).

## Bug real encontrado y corregido durante el despliegue

El diseño original de ADR-11/el primer borrador del handler pedía `limit=50` en
`GET /v1/artists/{id}/albums`, que era el máximo histórico documentado de ese endpoint. Spotify
devolvía `400 Invalid limit` incluso con `limit=20`. Se confirmó contra la documentación viva de
Spotify (no memoria/entrenamiento) que el máximo actual de ese endpoint es **10** — el código ya
usa ese valor. Si Spotify vuelve a cambiar el contrato, el síntoma es el mismo: `400 Invalid
limit` en los logs de CloudWatch de esta función.

## Deploy manual (por ahora)

Desplegado a mano desde la consola de AWS, no con IaC — decisión ya prevista y aceptada en
ALS-031 ("empezar manual... es una secuencia razonable" mientras sea una sola función con un
secreto). Migrar a IaC (SAM/CDK/Terraform) si se suman más funciones (ALS-027, YouTube) o el
proceso manual empieza a doler.
