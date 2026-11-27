# Tienda de beats exclusivos — diseño y flujos

Fecha: 2026-11-26
Casos de uso de cada flujo de §4: [`casos-uso-tienda.md`](./casos-uso-tienda.md).
Estado: **Propuesto — no hay una sola línea de código escrita.** Decisión en ADR-17
([`architecture.md`](./architecture.md)); requisitos `RF-CAT/CAR/PAG/ENT/ADM` en
[`rf-rnf-catalogo.md`](./rf-rnf-catalogo.md) §2.3; tickets en la Épica K de
[`backlog.md`](./backlog.md).

## 1. Alcance en una frase

Una tienda **separada de la landing** donde ALIENSKILEZ vende beats **solo en exclusiva**: cada beat
se vende una única vez y sale del catálogo. La landing no cambia su objetivo — sigue existiendo
para que un artista escriba por WhatsApp (ADR-1 sigue vigente para ese embudo).

Lo que **no** es esta tienda, a propósito:

- **Sin licencias no exclusivas** (MP3/WAV lease, trackouts). Decisión del Productor.
- **Sin cuentas de comprador.** Se compra con nombre y email; no hay login público.
- **Sin cantidades.** Un beat entra al carrito una vez o no entra.

## 2. Piezas del sistema

```mermaid
flowchart LR
  subgraph Navegador
    Landing["index.html<br/>(landing, sin cambios)"]
    Cat["catalogo.html<br/>catálogo + carrito + checkout"]
    Adm["admin.html<br/>panel del productor"]
  end

  subgraph AWS["AWS (misma cuenta que ADR-11/16)"]
    API["Express en Lambda<br/>(serverless-http + Function URL)"]
    DB[("DynamoDB<br/>beats · pedidos")]
    S3X["S3 privado (único bucket)<br/>portadas · previews con tag · WAV · stems"]
    SM["Secrets Manager"]
    SES["SES (correo)"]
  end

  PSP["Pasarela<br/>(Mercado Pago o Flow)"]
  G["Google<br/>(Sign-In)"]

  Cat -->|"GET /beats, /beats/:id/portada, /beats/:id/preview, POST /checkout"| API
  Adm -->|"/admin/* (cookie de sesión)"| API
  Adm -.->|"PUT al destino opaco que dio la API (§2.1)"| S3X
  API -->|"lee portadas y previews, firma destinos"| S3X
  API --> DB
  API --> SM
  API --> SES
  API -->|"crear pago / consultar pago"| PSP
  PSP -->|"webhook"| API
  Adm -->|"ID token"| G
```

**Regla de capas en el backend** (mismo principio que "el componente nunca orquesta"): un handler de
Express solo traduce HTTP ↔ dominio. Reserva, cálculo del total, transición de estados y
procesamiento del webhook viven en módulos de dominio puros, testeados sin Express ni AWS.

### 2.1 Regla: la capa de datos está abstraída detrás de la API

**El frontend solo conoce el contrato de la API.** Ningún navegador (catálogo, panel, ni el enlace
de un correo) conoce hosts de S3, keys de objetos, nombres de tablas ni un SDK de AWS. Cambiar S3 por
otro storage, o DynamoDB por otra base, no toca una línea del frontend ni invalida un correo ya
enviado.

Lo que importa es **de quién depende el código, no por dónde viajan los bytes**. Toda URL que usa el
frontend es de la API, y la API decide cómo responder:

| Caso | El frontend pide | La API responde | Flujo |
|---|---|---|---|
| Portada, preview (archivos chicos) | `GET /beats/:id/portada` · `/preview` | Los bytes, leídos de S3 por Express | 4.1 |
| Entregable (cientos de MB) | `GET /descargas/:token/:archivo` | `302` a una URL firmada de S3 que vence en ~1 min | 4.11 |
| Subida desde el panel (cientos de MB) | `POST /admin/beats/:id/subidas` | Un **destino de subida opaco** (`url`, `method`, `headers`) que el panel usa tal cual | 4.8 |

Los archivos grandes no pueden atravesar Lambda: el request tiene un límite de 6 MB y la respuesta
de 6 a 20 MB. Para descarga y subida, la API autoriza y entrega un destino de vida corta, y los bytes
van directo entre el navegador y el storage. El frontend sigue sin saber qué hay detrás: sigue una
redirección o usa una URL que le dieron, sin construirla ni interpretarla.

**Consecuencias:**

- **Un solo bucket, 100% privado**, con prefijos `portadas/`, `previews/` y `entregables/`.
- Las respuestas de la API nunca exponen keys de S3, solo IDs de beat o pedido y tokens opacos.
- **En el backend, el mismo corte:** el dominio no importa el SDK de AWS. Depende de dos módulos,
  `beatsRepo`/`pedidosRepo` (datos) y `archivos` (almacenamiento: leer, destino de subida, destino de
  descarga), con un adaptador DynamoDB/S3 y uno en memoria para los tests. El de memoria es la
  segunda implementación real que exige la regla de honestidad de `engineering-guidelines.md` §2,
  así que el corte no es ceremonia.

**Si algún día se exige que ni un byte vaya directo al storage**, la única salida es sacar Express
de Lambda a un contenedor (App Runner, ECS o Lightsail), que no tiene esos límites. El contrato de la
API no cambiaría, así que el frontend tampoco.

## 3. Modelo de datos

### Tabla `beats`

| Campo | Tipo | Nota |
|---|---|---|
| `id` | string | PK |
| `titulo`, `bpm`, `tonalidad`, `genero` | string / number | Metadatos públicos |
| `precioClp` | number | Entero en pesos. **Lo carga el Productor** (ADR-6) |
| `estado` | `borrador \| disponible \| reservado \| vendido \| archivado` | Ver §3.1 |
| `reservadoHasta` | number (epoch ms) | Solo con `estado = reservado` |
| `pedidoId` | string | Pedido que lo reservó o compró |
| `portadaKey`, `previewKey` | string | Objetos del bucket privado; solo se sirven a través de la API (4.1). Nunca salen en una respuesta |
| `entregaKeys` | string[] | Objetos del bucket **privado** |
| `vendidoPor` | `sitio \| externo` | Externo = WhatsApp, Instagram, en persona |

### Tabla `pedidos`

| Campo | Tipo | Nota |
|---|---|---|
| `id` | string | PK; viaja a la pasarela como referencia externa |
| `beatIds` | string[] | |
| `totalClp` | number | Calculado en el servidor desde `beats.precioClp` |
| `comprador` | `{ nombre, email }` | Dato personal — Ley 21.719 |
| `estado` | `pendiente \| pagado \| rechazado \| expirado \| reembolso_requerido` | |
| `pagoId` | string | ID del pago en la pasarela; base de la idempotencia |
| `tokenDescarga`, `tokenVenceEn` | string / number | Token opaco de los enlaces del correo (4.11); reenviar lo reemplaza |
| `creadoEn`, `pagadoEn` | number | |

### 3.1 Estados de un beat

```mermaid
stateDiagram-v2
  [*] --> borrador: el productor lo crea
  borrador --> disponible: publicar
  disponible --> reservado: un comprador inicia el pago
  reservado --> disponible: vence la reserva o se rechaza el pago
  reservado --> vendido: webhook confirma el pago
  disponible --> vendido: el productor lo vendió por fuera
  disponible --> borrador: despublicar
  vendido --> archivado
  borrador --> archivado
```

**La reserva vence sola, sin cron.** No hay un proceso que "libere" beats: un beat con
`estado = reservado` y `reservadoHasta < ahora` se trata como disponible. La escritura condicional
de la reserva acepta `estado = disponible OR (estado = reservado AND reservadoHasta < :ahora)`.
(El TTL nativo de DynamoDB borra ítems, no los actualiza, así que no sirve para esto.)

## 4. Diagramas de secuencia

Participantes comunes: **C** comprador (navegador) · **F** frontend del catálogo · **API** Express
en Lambda · **DB** DynamoDB · **S3** · **PSP** pasarela de pago · **SES** correo · **P** productor
(navegador) · **AF** frontend del panel · **G** Google.

### 4.1 Explorar el catálogo y escuchar una preview

```mermaid
sequenceDiagram
  actor C as Comprador
  participant F as catalogo.html
  participant API as Express
  participant DB as DynamoDB
  participant S3 as S3 privado

  C->>F: abre /catalogo
  F->>API: GET /beats
  API->>DB: beats con estado disponible o reservado
  DB-->>API: lista
  API->>API: marca como reservado solo si reservadoHasta es futuro
  API-->>F: beats públicos (sin keys de S3)
  F-->>C: grilla con BPM, tonalidad, precio
  loop por cada portada que entra en pantalla (loading lazy)
    F->>API: GET /beats/id/portada
    API->>DB: estado y portadaKey del beat
    alt beat público
      API->>S3: GetObject portadaKey
      S3-->>API: imagen
      API-->>F: 200 imagen con Cache-Control largo
    else borrador, vendido o inexistente
      API-->>F: 404
    end
  end
  F-->>C: portadas visibles
  C->>F: filtra por género o BPM
  F-->>C: filtrado en el cliente, sin red
  C->>F: play en un beat
  F->>F: pausa el que estaba sonando
  F->>API: GET /beats/id/preview (preload none, recién ahora, con Range si el navegador lo pide)
  API->>DB: estado y previewKey del beat
  alt borrador, vendido o inexistente
    API-->>F: 404
    F-->>C: preview no disponible
  else beat público
    API->>S3: GetObject previewKey, reenviando el Range
    S3-->>API: bytes del audio
    API-->>F: 200 o 206 con Content-Type audio, Content-Range y Cache-Control
    F-->>C: reproduce
  end
```

**Por qué portadas y previews pasan por Express:** regla §2.1. La API decide qué se puede ver y
escuchar: un beat vendido o en borrador deja de mostrarse y de sonar en el mismo momento en que
cambia su estado, y nadie puede listar el bucket ni enlazar archivos directo desde S3.

**Restricciones que esto impone:**

- **Tamaño de la respuesta de Lambda:** 6 MB con respuesta normal y hasta 20 MB con *response
  streaming*. Una preview con tag en MP3 de 128 kbps pesa ~1 MB por minuto, y una portada debe pesar
  bastante menos, así que se fija un tamaño máximo para ambas y se valida al publicar (RF-ADM-004).
- **`Range`:** el navegador lo usa para adelantar la reproducción. Express tiene que reenviarlo a
  S3 y responder `206` con `Content-Range`; si no, el reproductor no permite adelantar.
- **Binario a través de la Function URL:** `serverless-http` tiene que configurarse para responder
  binario (`audio/mpeg`) sin corromperlo.
- **Costo y latencia:** cada portada y cada play es una invocación de Lambda más una lectura de
  DynamoDB. `Cache-Control` evita que el navegador vuelva a pedir lo que ya tiene. Si el volumen lo
  pide, un CloudFront delante de la **API** (no del bucket) puede cachear las portadas sin romper la
  regla §2.1.

### 4.2 Carrito: agregar y validar antes de pagar

```mermaid
sequenceDiagram
  actor C as Comprador
  participant F as catalogo.html
  participant LS as localStorage
  participant API as Express
  participant DB as DynamoDB

  C->>F: agregar beat al carrito
  F->>LS: guarda ids (sin duplicar)
  Note over F,LS: se lee con useSyncExternalStore,<br/>sobrevive a recargas
  C->>F: abre el carrito
  F->>API: POST /carrito/validar con los ids
  API->>DB: estado y precio actual de cada id
  DB-->>API: beats
  API-->>F: disponibles, no disponibles y total calculado en el servidor
  alt algún beat ya no está disponible
    F->>LS: lo quita
    F-->>C: aviso, el beat se vendió o está reservado
  else todo disponible
    F-->>C: carrito con total, botón Pagar habilitado
  end
```

### 4.3 Checkout: reserva atómica y creación del pago

```mermaid
sequenceDiagram
  actor C as Comprador
  participant F as catalogo.html
  participant API as Express
  participant DB as DynamoDB
  participant PSP as Pasarela

  C->>F: nombre, email, acepta términos, Pagar
  F->>F: valida con zod
  F->>API: POST /checkout con ids, nombre, email
  API->>API: valida con zod (otra vez, nunca confiar en el cliente)
  API->>DB: precios actuales de los ids
  API->>API: calcula total en el servidor
  API->>DB: TransactWriteItems - crea pedido pendiente y reserva cada beat<br/>con condición disponible o reserva vencida
  alt otro comprador ganó algún beat
    DB-->>API: TransactionCanceled
    API-->>F: 409 con los ids que se perdieron
    F-->>C: esos beats ya no están disponibles
  else reserva exitosa (todos o ninguno)
    DB-->>API: ok
    API->>PSP: crear pago con monto, referencia del pedido,<br/>notification_url, back_url y vencimiento igual al de la reserva
    PSP-->>API: URL de pago
    API-->>F: URL de pago
    F->>PSP: redirige el navegador
    PSP-->>C: página de pago de la pasarela
  end
```

### 4.4 Confirmación por webhook y entrega (pago aprobado)

```mermaid
sequenceDiagram
  participant PSP as Pasarela
  participant API as Express
  participant DB as DynamoDB
  participant S3 as S3 privado
  participant SES as SES
  actor C as Comprador (correo)
  actor P as Productor (correo)

  PSP->>API: POST /webhooks/pago con el id del pago
  API->>PSP: GET estado real del pago con la credencial secreta
  PSP-->>API: aprobado, monto, referencia del pedido
  API->>DB: lee el pedido
  alt el pedido ya está pagado (aviso repetido)
    API-->>PSP: 200, sin hacer nada más (idempotente)
  else el monto no coincide con totalClp
    API->>DB: pedido en revisión
    API->>SES: alerta al productor
    API-->>PSP: 200
  else reserva vigente o beats aún libres
    API->>DB: transacción - pedido pagado y beats vendidos<br/>con condición de que sigan siendo de este pedido
    API->>API: genera contrato PDF del pedido
    API->>S3: guarda el contrato PDF en entregables
    API->>DB: token de descarga opaco del pedido (vence en N días)
    API->>SES: correo con enlaces a la API (/descargas/token/archivo) y contrato
    SES-->>C: correo
    API->>SES: aviso de venta al productor
    SES-->>P: correo
    API-->>PSP: 200
  else la reserva venció y otro compró el beat
    API->>DB: pedido reembolso_requerido
    API->>SES: alerta al productor para reembolsar
    API-->>PSP: 200
  end
```

El último caso es raro (el vencimiento del pago en la pasarela se fija igual al de la reserva), pero
posible si la pasarela confirma tarde. Se resuelve con un reembolso manual, nunca vendiendo el beat
dos veces.

### 4.5 Vuelta del comprador a `/gracias`

Corre **en paralelo** al 4.4 y sin orden garantizado entre ambos.

```mermaid
sequenceDiagram
  actor C as Comprador
  participant PSP as Pasarela
  participant F as catalogo.html (gracias)
  participant API as Express
  participant DB as DynamoDB

  PSP->>F: redirige a /gracias con el id del pedido
  Note over F: el query string no decide nada,<br/>cualquiera puede escribirlo a mano
  loop cada 3 s, hasta 60 s
    F->>API: GET /pedidos/id/estado
    API->>DB: estado del pedido
    DB-->>API: estado
    API-->>F: pendiente, pagado o rechazado (sin datos personales)
  end
  alt pagado
    F->>F: vacía el carrito
    F-->>C: listo, te enviamos los archivos por correo
  else rechazado
    F-->>C: el pago no se completó, tu carrito sigue intacto
  else sigue pendiente al minuto
    F-->>C: te avisaremos por correo cuando se confirme
  end
```

### 4.6 Pago rechazado o abandonado

```mermaid
sequenceDiagram
  actor C as Comprador
  participant PSP as Pasarela
  participant API as Express
  participant DB as DynamoDB

  alt la tarjeta es rechazada
    PSP->>API: POST /webhooks/pago
    API->>PSP: GET estado real
    PSP-->>API: rechazado
    API->>DB: pedido rechazado y beats disponibles<br/>con condición de que sigan siendo de este pedido
    API-->>PSP: 200
  else el comprador cierra la pestaña sin pagar
    Note over API,DB: no llega ningún aviso, no corre ningún proceso
    Note over DB: reservadoHasta pasa y el beat<br/>vuelve a contar como disponible solo
  end
  C->>API: (otro comprador) POST /checkout del mismo beat
  API->>DB: la condición acepta la reserva vencida
  DB-->>API: ok, reservado para el nuevo pedido
```

### 4.7 Inicio de sesión del productor con Google

```mermaid
sequenceDiagram
  actor P as Productor
  participant AF as admin.html
  participant G as Google
  participant API as Express
  participant SM as Secrets Manager

  P->>AF: abre /admin
  AF->>API: GET /admin/sesion
  API-->>AF: 401 sin cookie
  AF-->>P: botón Iniciar sesión con Google
  P->>G: elige la cuenta (Google Identity Services)
  G-->>AF: ID token firmado por Google
  AF->>API: POST /admin/login con el ID token
  API->>API: verifica firma, audiencia (client id) y vencimiento<br/>con google-auth-library
  API->>SM: lista de emails autorizados y secreto de sesión
  alt el email no está autorizado
    API-->>AF: 403
    AF-->>P: esta cuenta no tiene acceso
  else autorizado
    API-->>AF: Set-Cookie de sesión httpOnly, Secure, SameSite
    AF-->>P: panel
  end
  Note over AF,API: desde acá cada llamada /admin/* viaja con la cookie,<br/>nunca un token en localStorage
```

### 4.8 Alta de un beat

```mermaid
sequenceDiagram
  actor P as Productor
  participant AF as admin.html
  participant API as Express
  participant DB as DynamoDB
  participant S3 as S3 privado

  P->>AF: completa título, BPM, tonalidad, género, precio
  AF->>API: POST /admin/beats (cookie)
  API->>DB: crea beat en borrador
  API-->>AF: id del beat
  AF->>API: POST /admin/beats/id/subidas con tipo (portada, preview, entregable),<br/>nombre y tamaño de cada archivo
  API->>API: valida tipo y tamaño máximo, elige la key (el panel no la conoce)
  API->>DB: registra subidas pendientes con id de subida
  API-->>AF: por cada archivo, id de subida y destino opaco (url, method, headers)
  par por cada archivo
    AF->>S3: usa el destino tal cual
    S3-->>AF: 200
  end
  Note over AF,S3: el panel no construye ni interpreta la URL,<br/>los archivos grandes no caben en un request a Lambda
  AF->>API: POST /admin/beats/id/subidas/confirmar con los ids de subida
  API->>S3: verifica que cada objeto exista y su tamaño
  API->>DB: asocia las keys al beat
  P->>AF: publicar
  AF->>API: POST /admin/beats/id/publicar
  API->>API: valida que tenga precio, preview (bajo el tamaño máximo) y entregables
  API->>DB: estado disponible
  API-->>AF: ok
  AF-->>P: el beat ya aparece en el catálogo
```

### 4.9 Venta por fuera del sitio

```mermaid
sequenceDiagram
  actor P as Productor
  participant AF as admin.html
  participant API as Express
  participant DB as DynamoDB

  Note over P: vendió el beat por WhatsApp o en persona
  P->>AF: marcar como vendido por fuera
  AF->>API: POST /admin/beats/id/vendido-externo
  API->>DB: estado vendido, vendidoPor externo<br/>con condición estado disponible
  alt el beat estaba reservado por un comprador en el sitio
    DB-->>API: condición fallida
    API-->>AF: 409, hay un pago en curso
    AF-->>P: esperar a que termine o venza la reserva
  else disponible
    DB-->>API: ok
    API-->>AF: ok
    AF-->>P: ya no aparece en el catálogo
  end
```

**Regla de operación:** si el Productor negocia un beat por otro canal, lo marca como vendido
**antes** de cerrar el trato. El sitio es la única fuente de verdad del inventario.

### 4.10 Reenviar la descarga de un pedido

```mermaid
sequenceDiagram
  actor P as Productor
  participant AF as admin.html
  participant API as Express
  participant DB as DynamoDB
  participant SES as SES
  actor C as Comprador (correo)

  Note over C: el enlace de descarga venció o no llegó el correo
  C-->>P: le escribe por WhatsApp
  P->>AF: pedidos, busca el pedido, reenviar descarga
  AF->>API: POST /admin/pedidos/id/reenviar
  API->>DB: lee pedido
  alt el pedido no está pagado
    API-->>AF: 409
  else pagado
    API->>DB: token de descarga nuevo (invalida el anterior)
    API->>SES: correo con enlaces nuevos a la API al email del pedido
    SES-->>C: correo
    API-->>AF: ok
  end
```

### 4.11 Descarga de un entregable

```mermaid
sequenceDiagram
  actor C as Comprador
  participant API as Express
  participant DB as DynamoDB
  participant S3 as S3 privado

  C->>API: clic en el enlace del correo, GET /descargas/token/archivo
  API->>DB: busca el pedido por token
  alt token inexistente, vencido o reemplazado
    API-->>C: página "enlace vencido, pide uno nuevo por WhatsApp"
  else pedido pagado y el archivo es parte del pedido
    API->>API: firma un destino de descarga de ~1 min para esa key
    API->>DB: registra la descarga (fecha, archivo)
    API-->>C: 302 al destino firmado
    C->>S3: el navegador sigue la redirección
    S3-->>C: archivo (Content-Disposition attachment)
  end
  Note over C,API: el correo solo contiene URLs de la API,<br/>cambiar de storage no invalida enlaces ya enviados
```

## 5. Decisiones abiertas (del Productor)

| Decisión | Afecta |
|---|---|
| Mercado Pago o Flow | 4.3, 4.4, 4.6 |
| Los beats vendidos se ocultan o se muestran como "Vendido" | 4.1, RF-CAT-005 |
| Qué se entrega (WAV, stems, proyecto) y la plantilla del contrato | 4.4, 4.8, RF-ENT-003 |
| Precios reales y beats disponibles para el lanzamiento | RNF-INT-004 |
| Duración de la reserva (propuesta: 15 min) | 4.3, 4.6 |
| Cómo se emite la boleta (manual o integrada) | RNF-LEG-002 |
| Canal del aviso de venta al Productor (correo o WhatsApp) | 4.4, RF-ENT-004 |
