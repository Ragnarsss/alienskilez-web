# Handoff — Tienda de beats exclusivos (Épica K)

Fecha: 2026-11-26
Para: el agente de IA que retome este trabajo en una sesión nueva.

---

## 0. Lo más importante: cómo se trabaja en esta épica

**El usuario escribe todo el código a mano. La IA guía y supervisa.** El objetivo es que el usuario
construya la tienda y aprenda backend en el camino (Express, DynamoDB, S3, pasarelas de pago,
webhooks). Si la IA escribe el código, el objetivo fracasa aunque la tienda funcione.

### Lo que la IA NO hace

- **No crea ni edita archivos de código** (`src/`, `aws/`, tests, configs, `package.json`). No
  usa Write ni Edit sobre esos archivos, aunque sea "para ahorrar tiempo".
- **No entrega implementaciones completas** en el chat: ni funciones terminadas, ni archivos
  enteros para copiar y pegar.
- **No ejecuta comandos que cambian estado:** `npm install`, `git commit`, `git push`, despliegues
  o cualquier cosa que toque AWS. Esos los corre el usuario.
- **No adelanta pasos.** Un paso a la vez; el siguiente recién cuando el actual está verificado.
- **No edita la documentación** (`docs/`) salvo que el usuario lo pida explícitamente en ese
  momento. Puede proponer el texto para que el usuario lo escriba.

### Lo que la IA SÍ hace

- **Lee** los archivos del usuario para revisarlos.
- **Corre comandos de verificación de solo lectura** para supervisar: `npm run lint`, `npm test`,
  `npm run build`, `git status`, `git diff`.
- Explica conceptos, propone la estructura, describe con precisión qué hay que escribir y revisa
  lo escrito.
- Consulta documentación oficial (AWS SDK v3, Express, Mercado Pago o Flow) cuando hace falta una
  firma exacta, y la cita.

### Formato de cada paso (siempre igual)

1. **Objetivo:** qué se logra con este paso, en una o dos líneas.
2. **Concepto:** lo mínimo que hay que entender y por qué se hace así, en lenguaje simple. El
   usuario está aprendiendo backend: en esta épica ya se explicó qué es un webhook y cómo
   interactúa con el frontend. No dar nada por sabido; preguntar si un concepto es nuevo.
3. **Qué escribir:** ruta exacta de cada archivo a crear o modificar y, para cada uno, qué debe
   contener, **descrito, no escrito**: nombres de funciones, parámetros y tipos de retorno,
   comportamiento esperado, casos borde y errores a manejar. Firmas de tipos sí; cuerpos de
   funciones no.
4. **Comandos:** qué correr, y qué salida se espera.
5. **Cómo verificar:** criterio concreto ("el test X pasa", "`curl` devuelve 404").
6. **Checkpoint:** el usuario avisa "listo". La IA lee los archivos, corre lint/test/build y da
   una revisión: qué está bien, qué está mal (bugs, reglas de `AGENTS.md` rotas, casos borde que
   faltan) y por qué. Recién con todo en verde se pasa al siguiente paso.

### Si el usuario se traba: pistas progresivas, solo si las pide

1. **Pista conceptual:** qué tiene que pasar, sin código.
2. **Pseudocódigo** en español.
3. **Fragmento mínimo:** unas pocas líneas de la parte puntual que traba, nunca la función entera.

Al revisar código con errores: señalar la línea y explicar el problema, y que el usuario lo
corrija. No reescribir el código por él.

### Ritmo

- Pasos chicos: cada paso debe poder terminarse en 15 a 45 minutos.
- TDD donde el repo lo exige (`docs/engineering-guidelines.md` §1). En la lógica de dominio
  (reserva, total, transiciones de estado, webhook) el usuario escribe el test primero, lo ve
  fallar y después escribe la implementación.
- De vez en cuando, una pregunta corta para comprobar que se entendió ("¿por qué el total no se
  calcula en el frontend?"), sin convertirlo en examen.

---

## 1. Qué se va a construir (fuente de verdad: los documentos, no este resumen)

Leer en este orden antes del primer paso:

1. [`docs/tienda-beats.md`](../docs/tienda-beats.md): piezas, modelo de datos, estados del beat,
   la regla de abstracción de la capa de datos (§2.1) y los 11 diagramas de secuencia (§4).
2. ADR-17 en [`docs/architecture.md`](../docs/architecture.md): la decisión y lo que se descartó.
3. [`docs/rf-rnf-catalogo.md`](../docs/rf-rnf-catalogo.md) §2.3 y §2.4: requisitos con su criterio
   de verificación.
4. Épica K en [`docs/backlog.md`](../docs/backlog.md): tickets ALS-048 a ALS-061.
5. [`AGENTS.md`](../AGENTS.md) y [`docs/engineering-guidelines.md`](../docs/engineering-guidelines.md)
   §1, §2 y §8: reglas que el código del usuario tiene que cumplir y que la IA revisa.

Resumen de lo decidido, para orientarse:

- La **landing no cambia** (sigue siendo para agendar por WhatsApp). La tienda vive en
  `catalogo.html` y el panel en `admin.html`, como entradas separadas de Vite. Sin router.
- **Solo exclusivas:** cada beat se vende una vez. El riesgo central es venderlo dos veces.
- **Backend:** Express sobre Lambda (`serverless-http`) + Function URL, DynamoDB (`beats`,
  `pedidos`), un solo bucket S3 privado, Secrets Manager, SES.
- **La capa de datos está abstraída detrás de la API:** el frontend solo conoce URLs de la API. En
  el backend, el dominio solo usa `beatsRepo`/`pedidosRepo`/`archivos`, con un adaptador AWS y uno
  en memoria para los tests.
- **Reserva atómica** con `TransactWriteItems` condicional y vencimiento perezoso por
  `reservadoHasta` (sin cron).
- **Solo el webhook confirma una venta**, después de consultar el pago a la API de la pasarela.
  Debe ser idempotente.
- **Panel:** Google Sign-In verificado en el servidor, lista de emails autorizados, cookie
  `httpOnly`.

---

## 2. Estado al cerrar la sesión anterior

- **Código de la tienda: ninguno.** Todo es diseño.
- **Documentos sin commit**, en la rama `feat/video-seccion-youtube`, mezclados con cambios previos
  del usuario en `docs/backlog.md` y `docs/quality-gates.md` (que no son de la tienda). Archivos
  tocados por el diseño de la tienda: `docs/tienda-beats.md` (nuevo), `docs/architecture.md`,
  `docs/rf-rnf-catalogo.md`, `docs/requirements.md`, `docs/backlog.md`,
  `docs/engineering-guidelines.md`, `docs/README.md` y este handoff.
- **Los diagramas Mermaid de `tienda-beats.md` no se verificaron renderizados.** Conviene revisarlos
  en la vista previa de VS Code antes de empezar.
- **ALS-048 (decisiones del Productor) sigue abierto:** pasarela, entregables, contrato, precios,
  duración de la reserva, boleta. Bloquea ALS-054 y ALS-057, **no** bloquea empezar por la
  infraestructura ni por el dominio.

---

## 3. Por dónde empezar

### Paso 0 — Ordenar git (lo hace el usuario, guiado)

Separar los cambios previos del usuario de los documentos de la tienda: commitear lo suyo en su
rama, crear una rama nueva (`docs/tienda-beats` o `feat/tienda-...`) y commitear ahí el diseño, como
`docs(arquitectura): ADR-17 tienda de beats exclusivos`. Guiar con `git status` y `git add -p`
si hace falta, porque `docs/backlog.md` tiene cambios de los dos orígenes.

### Paso 1 — Cerrar las decisiones técnicas que el diseño dejó abiertas

Discutirlas con el usuario. La IA recomienda, el usuario decide, y el resultado se anota (el usuario
lo escribe) en `tienda-beats.md` o en ADR-17:

| Decisión | Recomendación | Por qué |
|---|---|---|
| Dónde vive el backend | `aws/tienda-api/`, junto a `aws/spotify-catalog/` y `aws/youtube-catalog/` | Mismo patrón que las Lambdas existentes |
| Lenguaje | TypeScript estricto, empaquetado con esbuild para Lambda | El repo es TS estricto; las Lambdas actuales son `.mjs`, pero esta tiene lógica de dominio real que conviene tipar |
| `package.json` | Propio dentro de `aws/tienda-api/` | Que las dependencias del backend (Express, AWS SDK) no entren al bundle del sitio |
| Tests | Vitest, igual que el frontend | Una sola herramienta en el repo |
| Runtime | El Node LTS más reciente que ofrezca Lambda (verificar en la documentación de AWS al momento) | — |
| Estructura interna | `dominio/` (puro) · `puertos/` (repos y archivos) · `adaptadores/aws/` y `adaptadores/memoria/` · `http/` (Express) | Es la regla de capas de `engineering-guidelines.md` §2 |

### Paso 2 en adelante — Orden de tickets sugerido

Empezar por lo que **no necesita AWS ni decisiones del Productor**, para que el usuario aprenda la
parte difícil (la lógica) sin pelear con la infraestructura al mismo tiempo:

1. **ALS-050 — Dominio** con TDD y adaptadores en memoria: total calculado en el servidor,
   transiciones de estado del beat, regla de reserva vencida, reserva de varios beats "todos o
   ninguno". Todo testeable sin AWS.
2. **Express local** sobre el dominio y los adaptadores en memoria: `GET /beats` y
   `POST /carrito/validar` (parte de ALS-051), probados con `curl` o con tests HTTP.
3. **ALS-049 — Infraestructura:** DynamoDB, S3, Secrets Manager, Lambda. Después, los adaptadores
   AWS, que se enchufan sin tocar el dominio. Este es el momento en que la abstracción de §2.1 se
   ve pagar.
4. Recién entonces el frontend del catálogo (ALS-052, ALS-053), y después el pago (ALS-054 a
   ALS-056) cuando ALS-048 defina la pasarela.

Cada ticket se cierra con la Definition of Done (skill `cerrar-ticket`). El usuario corre los
comandos y actualiza `backlog.md`; la IA verifica.
