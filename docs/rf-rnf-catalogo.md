# Catálogo RF-RNF — ALIENSKILEZ web

Fecha: 2026-08-12
Fuente: especificación del Productor (dueño del negocio) + decisiones registradas en
[`architecture.md`](./architecture.md).

## 1. Convenciones

- **RF:** `RF-MOD-001` · **RNF:** `RNF-CAT-001`
- **Prioridad:** Alta, Media, Baja
- **Estado:** Propuesto, Aprobado, Implementado, **Verificado**

> **Sobre el estado "Verificado":** significa que el criterio se comprobó de verdad (build, test o
> prueba manual sobre el sitio corriendo). Lo que está construido pero **no** se pudo comprobar
> todavía queda como **Implementado**, con el motivo dicho. No se marca Verificado por optimismo.

Módulos: **NAV** navegación · **EST** el estudio · **SRV** servicios · **POR** portfolio ·
**TRA** trayectoria · **PRO** proceso · **FAQ** preguntas · **BKG** agendamiento · **SEO**.

## 2. Catálogo de Requisitos Funcionales

| ID | Mód. | Requisito funcional | Prioridad | Criterio de verificación | HU | CU | Estado |
|---|---|---|---|---|---|---|---|
| RF-NAV-001 | NAV | El sitio debe ser una sola página recorrible por scroll, con navegación por anclas a cada sección y un CTA persistente visible en todo momento. | Alta | El navbar queda fijo al scrollear y cada enlace lleva a su sección sin quedar tapado por la barra (CP-NAV-001). | HU-NAV-001 | CU-NAV-001 | Verificado |
| RF-NAV-002 | NAV | En viewport móvil la navegación debe colapsar en un menú desplegable operable con teclado. | Alta | A <768px aparece el botón de menú; abre/cierra con Enter y refleja el estado en `aria-expanded` (CP-NAV-002). | HU-NAV-001 | CU-NAV-001 | Verificado |
| RF-EST-001 | EST | El sitio debe comunicar quién es ALIENSKILEZ y qué lo diferencia, antes de pedir cualquier acción. | Alta | Existe una sección de identidad ubicada entre el hero y los servicios, con el diferencial explícito (CP-EST-001). | HU-EST-001 | CU-EST-001 | Verificado |
| RF-SRV-001 | SRV | El sitio debe listar las 10 líneas de servicio con una descripción que permita entender el alcance de cada una. | Alta | Las 10 entradas de `SERVICES` se renderizan con etiqueta y descripción (CP-SRV-001). | HU-SRV-001 | CU-SRV-001 | Verificado |
| RF-SRV-002 | SRV | Cada servicio debe ofrecer el CTA que corresponde a su naturaleza: agendar sesión o cotizar proyecto. | Alta | El CTA de cada card se deriva de `tier`; los 6 de tipo sesión muestran "Agenda tu sesión" y los 4 de proyecto "Cotiza tu proyecto" (CP-SRV-002). | HU-SRV-001 | CU-SRV-001 | Verificado |
| RF-SRV-003 | SRV | El sitio **no** debe publicar tarifas. | Alta | No existe ningún precio en el sitio; el copy explica que el valor depende del alcance (CP-SRV-003). | HU-SRV-001 | CU-SRV-001 | Verificado |
| RF-POR-001 | POR | El sitio debe mostrar trabajos destacados en formato de progresión temporal, con reproductor embebido cuando exista la pista. | Media | La línea de tiempo renderiza las entradas de `PORTFOLIO_ITEMS`; con `embedUrl` presente monta el iframe, y sin ella un marcador — nunca un iframe vacío (CP-POR-001). | HU-POR-001 | CU-POR-001 | Verificado |
| RF-POR-002 | POR | El portfolio debe conectar con el catálogo real de ALIENSKILEZ en Spotify (lanzamientos, discografía), no depender de que alguien lo copie a mano en cada release. | **Alta** | El sitio muestra los lanzamientos vigentes en Spotify sin editar código ni constantes al salir un tema nuevo (CP-POR-002). | HU-POR-001 | CU-POR-001 (extiende) | **Aprobado** — arquitectura decidida (ADR-11: AWS Lambda), handler de referencia escrito. **No verificado**: falta desplegarlo contra AWS real (ALS-026). Cuando se despliegue corresponde una ficha `CU-POR-002` propia en `casos-uso.md`. |
| RF-TRA-001 | TRA | El sitio debe poder mostrar cifras de trayectoria y testimonios de artistas. | Media | Las secciones Alcance y Testimonios existen y consumen sus constantes (CP-TRA-001). | HU-TRA-001 | CU-TRA-001 | Verificado |
| RF-TRA-002 | TRA | Mientras no existan datos reales, las cifras y testimonios deben mostrarse como pendientes explícitos, nunca como valores inventados. | **Alta** | Toda entrada con `pending: true` se renderiza con marcador visible y atenuada; ninguna cifra o cita ficticia en el sitio (CP-TRA-002). | HU-TRA-001 | CU-TRA-001 | Verificado |
| RF-PRO-001 | PRO | El sitio debe explicar el proceso de agendamiento paso a paso. | Media | Se muestran los 4 pasos de `PROCESS_STEPS` en orden (CP-PRO-001). | HU-PRO-001 | CU-PRO-001 | Verificado |
| RF-FAQ-001 | FAQ | El sitio debe responder las objeciones frecuentes previas a agendar (cotización, qué traer, duración, cancelación, sin experiencia, trabajo remoto). | Media | Las 6 preguntas se despliegan y colapsan con teclado, sin JavaScript propio (CP-FAQ-001). | HU-FAQ-001 | CU-FAQ-001 | Verificado |
| RF-BKG-001 | BKG | El sitio debe ofrecer un formulario que capture nombre, tipo de servicio, fecha estimada opcional y detalle opcional. | **Alta** | Los 4 campos existen con `<label>` asociado; nombre y servicio son obligatorios (CP-BKG-001). | HU-BKG-001 | CU-BKG-001 | Verificado |
| RF-BKG-002 | BKG | El formulario debe validar en cliente antes de permitir el envío, con mensajes accesibles por campo. | **Alta** | 24 tests cubren nombre corto/vacío/largo, servicio no seleccionado o inválido, fecha pasada y mensaje excedido; los errores se muestran con `role="alert"` y `aria-invalid` (CP-BKG-002). | HU-BKG-001 | CU-BKG-001 | Verificado |
| RF-BKG-003 | BKG | Al enviar, el sistema debe abrir WhatsApp con un mensaje precargado que identifique al solicitante y el servicio pedido. | **Alta** | `buildWhatsAppMessage()` produce el mensaje esperado en las 9 combinaciones testeadas de campos opcionales, y usa el verbo correspondiente al `tier` (CP-BKG-003). | HU-BKG-001 | CU-BKG-002 | Verificado |
| RF-BKG-004 | BKG | El mensaje no debe enviarse automáticamente: el visitante debe poder revisarlo antes. | Alta | `window.open` deja el chat con el texto cargado sin enviar; el copy bajo el botón lo anticipa (CP-BKG-004). | HU-BKG-001 | CU-BKG-002 | **Implementado** — verificado con el número real en escritorio; falta repetirlo en móvil (ver §5). |
| RF-BKG-005 | BKG | Todo CTA del sitio debe conducir al mismo formulario. | Alta | Los CTA de navbar, hero, cards de servicio y cierre apuntan a `#contacto` (CP-BKG-005). | HU-BKG-001 | CU-BKG-001 | Verificado |
| RF-SEO-001 | SEO | El sitio debe declarar título, descripción, idioma y metadatos de compartido social, incluyendo la ciudad de operación. | Media | `index.html` incluye `lang="es"`, `<title>`, `description` y Open Graph con "La Serena" (CP-SEO-001). | HU-SEO-001 | — | **Implementado** — falta `og:image` (ALS-016). |

## 3. Catálogo de Requisitos No Funcionales

Categorías: **RND** rendimiento · **ACC** accesibilidad · **MNT** mantenibilidad ·
**DEP** despliegue · **INT** integridad de contenido · **CMP** compatibilidad.

| ID | Cat. | Requisito no funcional | Métrica | Umbral | Verificación | RF afectados | Estado |
|---|---|---|---|---|---|---|---|
| RNF-RND-001 | RND | El sitio debe cargar rápido en móvil con conexión modesta: es la primera impresión de un negocio que vende producción audiovisual. | Lighthouse mobile; LCP; CLS; JS gzip | Perf ≥ 90; LCP ≤ 2.5s; CLS ≤ 0.1; JS ≤ 150 kB | `npx lighthouse` contra `npm run preview` (CP-RND-001). | Todos | **Implementado** — línea base de bundle medida (139.20 kB gzip); Lighthouse aún sin correr. |
| RNF-ACC-002 | ACC | El sitio debe cumplir WCAG 2.1 nivel AA, con navegación completa por teclado y respeto de `prefers-reduced-motion`. | Lighthouse Accessibility; contraste; recorrido con Tab | ≥ 95; contraste ≥ 4.5 texto normal | Checklist manual de `quality-gates.md` §5 + axe DevTools (CP-ACC-001). | Todos | **Implementado** — contrastes calculados y verificados; recorrido con lector de pantalla pendiente. |
| RNF-ACC-003 | ACC | Ninguna combinación de color publicada puede reprobar el umbral de contraste. | Ratio WCAG calculado | ≥ 4.5 texto normal, ≥ 3.0 texto grande y bordes | Script reproducible de `quality-gates.md` §5; tabla en `design-system.md` §2 (CP-ACC-002). | Todos | Verificado — 10 combinaciones calculadas; la única que reprueba (`#EEEEEE` sobre acento, 1.89) está prohibida por diseño. |
| RNF-MNT-001 | MNT | Ningún dato de negocio, anchor o límite puede estar escrito fuera de `shared/constants/`. | Literales de dominio dispersos | 0 | Revisión de código; ningún `href="#"` literal ni número de WhatsApp fuera de su constante (CP-MNT-001). | Todos | Verificado |
| RNF-MNT-002 | MNT | El proyecto debe compilar con TypeScript estricto y pasar lint sin excepciones ni supresiones. | Errores de `tsc -b` y de ESLint; `@ts-ignore`/`eslint-disable` | 0 y 0 | `npm run lint && npm run build` (CP-MNT-002). | Todos | Verificado |
| RNF-MNT-003 | MNT | La lógica que puede fallar debe estar cubierta por tests y aislada de React. | Tests verdes sobre schema y builder | 100% de esa superficie | `npm test` — 24/24 (CP-MNT-003). | RF-BKG-002, RF-BKG-003 | Verificado |
| RNF-DEP-001 | DEP | El sitio debe ser 100% estático, desplegable en cualquier CDN sin servidor propio ni base de datos. | Servicios de backend requeridos | 0 | `npm run build` produce solo `dist/` con HTML, CSS, JS y SVG (CP-DEP-001). | Todos | Verificado |
| RNF-INT-001 | INT | El sitio nunca debe publicar datos de negocio inventados (cifras, testimonios, créditos, precios). | Datos ficticios publicados | 0 | Revisión de las constantes con `pending: true`; checklist final de `quality-gates.md` §7 (CP-INT-001). | RF-SRV-003, RF-POR-001, RF-TRA-002 | Verificado |
| RNF-INT-002 | INT | Ningún dato pendiente puede romper la interfaz: la ausencia debe degradar la presentación, no fallar. | Iframes con `src` vacío; enlaces con `href` vacío | 0 | Inspección del DOM con todas las constantes en `pending` (CP-INT-002). | RF-POR-001, RF-TRA-002 | Verificado |
| RNF-CMP-001 | CMP | El sitio debe ser usable entre 320px y 1440px sin scroll horizontal ni solapamientos. | Anchos verificados | 320, 375, 768, 1024, 1440 | Checklist de `quality-gates.md` §3 (CP-CMP-001). | Todos | **Implementado** — construido responsive; barrido manual de anchos pendiente. |

## 4. Fichas de los RF distintivos

Solo se detallan los que tienen reglas de negocio propias. Los demás quedan suficientemente
definidos por la tabla de §2.

### RF-SRV-002 — CTA según la naturaleza del servicio

- **Descripción:** cada línea de servicio debe ofrecer el llamado a la acción que corresponde a
  cómo se contrata: los trabajos con fecha y sala se **agendan**; los que se contratan por alcance
  se **cotizan**.
- **Razón de negocio:** ALIENSKILEZ ofrece desde una sesión de grabación hasta la construcción de
  un estudio. "Agenda tu sesión de construcción de estudios" no significa nada y hace dudar de si
  el servicio se entiende.
- **Reglas de negocio:**
  - RN-01: el `tier` de cada servicio (`"sesion"` | `"proyecto"`) es la única fuente que decide el
    copy del CTA **y** el verbo del mensaje de WhatsApp.
  - RN-02: ambos CTA conducen al mismo formulario. No hay dos embudos.
- **Criterio:** CP-SRV-002 — cambiar el `tier` de un servicio en `constants/services.ts` cambia a
  la vez el botón de su card y el verbo del mensaje generado, sin tocar ningún componente.
- **Estado:** Verificado.

### RF-BKG-003 — Mensaje de WhatsApp precargado

- **Descripción:** el envío del formulario abre WhatsApp con un mensaje ya redactado que
  identifica al solicitante, el servicio solicitado y, si se indicaron, la fecha estimada y el
  detalle libre.
- **Razón de negocio:** un lead que llega como "Hola" obliga al productor a repreguntar todo. Un
  lead que llega con nombre, servicio y fecha se cotiza en un mensaje.
- **Reglas de negocio:**
  - RN-01: el verbo depende del `tier` del servicio (ver RF-SRV-002 RN-01).
  - RN-02: los campos opcionales vacíos **no** generan líneas vacías en el mensaje; un detalle con
    solo espacios se trata como ausente.
  - RN-03: si el id del servicio no se reconoce, se usa el id crudo en vez de fallar — un mensaje
    imperfecto es mejor que un lead perdido.
- **Criterio:** CP-BKG-003 — las 9 combinaciones de campos opcionales producen el mensaje esperado
  exacto, verificado por test.
- **Estado:** Verificado.

### RF-TRA-002 — Datos pendientes explícitos

- **Descripción:** mientras no existan cifras de trayectoria ni testimonios reales, esas secciones
  se publican con marcadores visibles (`[XX]`, `[Nombre del artista]`), nunca con valores
  plausibles inventados.
- **Razón de negocio:** una cifra falsa es una afirmación que después hay que desmentir frente a un
  cliente, y "lanzamientos producidos" es verificable por cualquiera en Spotify. El marcador además
  funciona como recordatorio: es imposible desplegar sin verlo.
- **Reglas de negocio:**
  - RN-01: cada métrica documenta **cómo se calcula** (`ImpactMetric.measurement`), para que el
    dato sea reproducible el año siguiente y no una estimación distinta cada vez.
  - RN-02: un testimonio solo se publica con cita textual y autorización de quien la dijo.
- **Criterio:** CP-TRA-002 — ninguna cifra ni cita del sitio corresponde a un dato no provisto por
  el Productor.
- **Estado:** Verificado. Ver ADR-6 en [`architecture.md`](./architecture.md).

### RF-POR-002 — Integración directa con Spotify del artista

- **Descripción:** el portfolio debe reflejar el catálogo real de ALIENSKILEZ en Spotify —
  lanzamientos y, potencialmente, discografía completa — sin depender de que alguien lo actualice
  a mano en `constants/portfolio.ts` cada vez que sale un tema.
- **Razón de negocio:** ALS-003 (créditos reales del portfolio) ya identificó el problema de fondo:
  un portfolio copiado a mano se desactualiza apenas hay un lanzamiento nuevo, justo cuando más
  importa mostrarlo. Conectar con la fuente real lo resuelve de raíz.
- **Tensión con una decisión ya cerrada, ahora resuelta con una excepción acotada:** este
  requisito chocaba con ADR-1 (`architecture.md`) — "sin backend, sin secretos". La Web API de
  Spotify que da metadata rica requiere `client_secret`, que no puede vivir en un bundle público.
  ADR-11 lo resuelve con una función AWS Lambda de solo lectura: ADR-1 sigue vigente para el flujo
  de conversión, y se abre una excepción explícita y acotada solo para el catálogo.
- **Reglas de negocio:**
  - RN-01: reflejar un lanzamiento nuevo no debe requerir editar código ni redesplegar el sitio.
  - RN-02: ninguna credencial secreta (`client_secret`, tokens de larga duración) puede quedar
    expuesta en el bundle del cliente — vive en AWS Secrets Manager, es una línea roja.
- **Criterio:** CP-POR-002 — un lanzamiento nuevo en Spotify aparece en el sitio sin deploy de
  código del frontend, solo con el paso natural del tiempo (dentro del TTL de caché de la Lambda).
- **Estado:** Aprobado, no verificado. Arquitectura decidida (ADR-11), handler de referencia en
  `aws/spotify-catalog/`, pendiente de desplegar contra AWS real — ver ALS-026/ALS-027 de
  `backlog.md`.

## 5. Lo que no se pudo verificar todavía

Dicho explícitamente, no disimulado:

1. **El flujo real hasta WhatsApp desde un móvil (RF-BKG-004).** `WHATSAPP.NUMBER` ya es el número
   real (ALS-001, cerrado). La construcción del mensaje y de la URL está cubierta por tests, y se
   confirmó manualmente que la URL generada abre `wa.me` con el mensaje correcto. Lo que falta es
   repetir esa prueba desde un dispositivo móvil real, no solo verificarla en el código.
2. **Lighthouse (RNF-RND-001, RNF-ACC-002).** No se corrió todavía. Los tamaños de bundle sí están
   medidos; las puntuaciones no.
3. **Lector de pantalla (RNF-ACC-002).** La semántica está construida según el checklist, pero no
   se recorrió el sitio con NVDA.
4. **Barrido de anchos (RNF-CMP-001).** Construido responsive, sin verificación visual en los 5
   anchos de referencia.

## 6. Documentos relacionados

- [`requirements.md`](./requirements.md) — versión narrativa breve de estos requisitos.
- [`historias-usuario.md`](./historias-usuario.md) — historias que los satisfacen.
- [`casos-uso.md`](./casos-uso.md) — flujos detallados.
- [`quality-gates.md`](./quality-gates.md) — cómo se verifican los RNF.
- [`backlog.md`](./backlog.md) — tickets que los implementan.
