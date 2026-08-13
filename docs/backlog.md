# Backlog — ALIENSKILEZ web

Fecha base: 2026-08-12
Estado: activo. Este documento es la **fuente de verdad** de qué está hecho y qué falta.

## 1. Objetivo

A diferencia de un backlog de construcción tradicional, este arranca con el sitio **ya
construido**: la Épica B en adelante documenta trabajo terminado y verificado. Lo que queda
abierto es, casi todo, **datos que solo el Productor puede aportar** (Épica A) y verificaciones
que aún no se corrieron (Épica E).

Eso hace que la Épica A esté primero: es lo que bloquea el lanzamiento, no lo que falta programar.

## 2. Criterios

- **Prioridad:** P0 (bloquea el lanzamiento) · P1 (degrada el objetivo de conversión) ·
  P2 (mejora) · P3 (bajo)
- **Esfuerzo:** S (< 2h) · M (medio día) · L (1-2 días)
- Ningún ticket P0/P1 se cierra sin su criterio de aceptación verificado de verdad
  ([`engineering-guidelines.md`](./engineering-guidelines.md) §8).

---

## Épica A — Datos de negocio pendientes

Ninguno de estos es un problema de código. Todos dependen de información que el Productor tiene
que entregar. Están numerados primero porque **el sitio no puede desplegarse sin el primero.**

### ALS-001 — Número de WhatsApp real

- Prioridad: **P0** · Esfuerzo: S
- **Estado: Hecho** (2026-08-12)

`WHATSAPP.NUMBER` en `src/shared/constants/whatsapp.ts` pasó de `"000000000000"` a
`"56938765513"` — WhatsApp **personal**, no Business todavía (ver ALS-030).

**Criterios de aceptación:**

1. ✅ `WHATSAPP.NUMBER` contiene el número real y `IS_WHATSAPP_PLACEHOLDER` evalúa `false`.
2. ✅ La URL `wa.me` se construye correctamente con el mensaje codificado (verificado con el
   builder real, ver `useBookingForm.ts`).
3. ⏳ Verificación desde un dispositivo móvil real — pendiente, hacerla antes de ALS-022.

### ALS-030 — Migrar a WhatsApp Business

- Prioridad: P2 · Esfuerzo: S · Estado: Pendiente

`WHATSAPP.NUMBER` hoy es un WhatsApp personal. Cuando exista la cuenta de WhatsApp Business, el
cambio es de una sola línea en `whatsapp.ts` — no toca ningún componente (mismo patrón que
ALS-002). Business suma catálogo, respuestas rápidas y estadísticas que el personal no tiene.

**Criterios:** el número de la constante corresponde a una cuenta Business verificada.

### ALS-002 — URL del perfil de Spotify

- Prioridad: P2 · Esfuerzo: S · Estado: Pendiente

La URL de artista de Spotify usa un ID opaco que no se puede derivar del seudónimo. Mientras
`pending: true`, el enlace no se renderiza en el footer — un enlace roto cuesta más credibilidad
que la ausencia del ícono.

También corresponde verificar que `youtube.com/@alienskilez` resuelva; se construyó asumiendo que
el handle coincide con el de Instagram.

**Criterios:** ambas URLs abren el perfil correcto; `pending` en `false`.

### ALS-003 — Créditos reales del portfolio

- Prioridad: **P1** · Esfuerzo: M · Estado: Pendiente

`constants/portfolio.ts` tiene 5 entradas placeholder, una por línea de servicio. Cada una necesita
título, artista, año, descripción y —cuando exista— la URL de embed de Spotify o YouTube.

Es P1 y no P2 porque el portfolio es la prueba principal para un manager que evalúa a quién derivar
sus artistas: sin él, la sección resta en vez de sumar.

**Criterios:** al menos 3 entradas con datos reales; las que tengan pista muestran reproductor;
ninguna entrada con `pending: true` en el sitio publicado.

### ALS-004 — Cifras de trayectoria

- Prioridad: **P1** · Esfuerzo: S · Estado: Pendiente

Las 4 métricas de `constants/alcance.ts` están en `[XX]`. Cada una ya documenta **cómo se calcula**
en su campo `measurement`:

| Métrica                 | De dónde sale                                                                                                                      |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| Años en producción      | Año actual − año de inicio profesional. Se define una vez y se autoactualiza.                                                      |
| Sesiones realizadas     | Sesiones cerradas y pagadas. Fuente práctica: historial de WhatsApp Business o planilla de reservas. Cuenta sesiones, no clientes. |
| Artistas atendidos      | Clientes **únicos**, deduplicados. Un artista con 12 sesiones cuenta 1.                                                            |
| Lanzamientos publicados | Singles/EPs/álbumes publicados con crédito de producción, mezcla o máster. Fuente: Spotify for Artists → créditos.                 |

La última es la más verificable por un cliente, así que conviene que sea exacta.

**Criterios:** las 4 con valor real y `pending: false`; el método usado queda anotado en
`measurement` para que el próximo año se calcule igual.

### ALS-005 — Testimonios de artistas

- Prioridad: **P1** · Esfuerzo: S · Estado: Pendiente

3 slots vacíos en `constants/testimonials.ts`. Cada testimonio necesita cita textual, nombre y
proyecto o género del artista, **más su autorización para publicarlo con nombre**.

Sugerencia práctica: un audio de WhatsApp de un artista satisfecho, transcrito y aprobado por él,
sirve perfectamente.

**Criterios:** al menos 2 testimonios reales con autorización; ningún slot `pending` publicado.

### ALS-006 — Piezas gráficas

- Prioridad: P2 · Esfuerzo: M · Estado: Pendiente (bloqueado por diseño, no por código)

Faltan: isotipo definitivo (el favicon actual es una onda interina en el verde de acento), imagen
de compartido social (ver ALS-016) y fotos reales del estudio o de sesiones.

---

## Épica B — Tooling y fundaciones

### ALS-007 — Tooling base

- Prioridad: P0 · Esfuerzo: M · **Estado: Hecho**

Tailwind v4 vía `@tailwindcss/vite`; alias `@/` en Vite y en `tsconfig.app.json`; `strict: true` +
`noUncheckedIndexedAccess` en ambos tsconfig (el scaffold no los traía); Prettier; ESLint flat
config con `no-restricted-imports` para bloquear rutas relativas al padre (ADR-8); Vitest.

Se verificó además que el React Compiler efectivamente compila, no solo que está instalado:
36 apariciones de `memo_cache_sentinel` en el bundle de producción. Y que
`eslint-plugin-react-compiler` no hace falta porque sus reglas ya vienen en
`eslint-plugin-react-hooks@7` (ADR-4).

**Criterios verificados:** `npm run lint`, `npm test` y `npm run build` limpios.

### ALS-008 — Sistema de diseño y tokens

- Prioridad: P0 · Esfuerzo: M · **Estado: Hecho**

Paleta, tipografía, radios y espaciado en `@theme` de `src/styles/index.css` como fuente única
(ADR-7). Motivos gráficos en CSS puro: starfield, grid HUD, brackets de esquina, glow de acento.
Doble red para `prefers-reduced-motion`.

Los 10 contrastes de la paleta se **calcularon**, no se estimaron. Corrigió dos números que se
habían documentado de memoria: el acento sobre negro es 9.55 (no 9.1) y sobre `--color-surface` es
5.74 — **AA, no AAA**. Detalle en [`design-system.md`](./design-system.md) §2.

### ALS-009 — Primitivos de UI

- Prioridad: P1 · Esfuerzo: S · **Estado: Hecho**

`Button` (variantes `primary`/`secondary`/`ghost`, polimórfico `<button>`/`<a>`), `Badge`,
`Section` + `Reveal`, `Container`, `Kicker`, helper `cn()`. Propios, sin librería externa (ADR-2).

`Button` en variante `primary` usa texto negro sobre el verde: es la única combinación legible
(9.55 vs 1.89 con gris claro).

### ALS-010 — Constantes de negocio

- Prioridad: P0 · Esfuerzo: M · **Estado: Hecho**

9 módulos en `shared/constants/`: `site`, `whatsapp`, `sections`, `limits`, `services`, `content`,
`portfolio`, `alcance`, `testimonials`. Todos con `as const`; los que tienen forma definida usan
`satisfies` para conservar literales y validar estructura a la vez.

Los que aún no tienen dato real llevan `pending: boolean`, que los componentes usan para degradar
la presentación en vez de romperse (ADR-6).

---

## Épica C — Agendamiento (el núcleo)

### ALS-011 — Schema de validación

- Prioridad: P0 · Esfuerzo: S · **Estado: Hecho**

`booking.schema.ts` con zod v4: nombre con mínimo y máximo, servicio contra la lista de 11
opciones, fecha opcional que rechaza el pasado, detalle con límite. Tipo inferido con `z.infer`,
nunca duplicado a mano.

La comparación de fechas usa strings `YYYY-MM-DD` —que ordenan lexicográficamente— para evitar
construir `Date` y lidiar con zonas horarias.

### ALS-012 — Hook de agendamiento y armado del mensaje

- Prioridad: P0 · Esfuerzo: M · **Estado: Hecho**

`useBookingForm` orquesta RHF + zodResolver y ejecuta el efecto externo.
`buildWhatsAppMessage()` se exporta **fuera** del hook, como función pura, precisamente para poder
testearla sin montar React ni tocar `window`.

El verbo del mensaje se deriva del `tier` del servicio — mismo dato que gobierna el copy de los
CTA (ADR-5).

**Verificado:** 24 tests en `src/test/booking.schema.test.ts` cubren nombre corto/en blanco/largo,
servicio vacío/inválido/de escape, fecha pasada/hoy/futura (con reloj fijado), mensaje en el límite
y excedido, las 9 combinaciones de campos opcionales del mensaje, y que los valores por defecto del
formulario **no** pasen la validación.

### ALS-013 — Sección de contacto

- Prioridad: P0 · Esfuerzo: M · **Estado: Hecho**

Formulario con `noValidate`, `<label>` asociado por `htmlFor`, `aria-invalid`,
`aria-describedby`, errores con `role="alert"` y contador de caracteres. El componente **no valida
ni arma URLs**: delega todo al hook.

---

## Épica D — Secciones de la landing

### ALS-014 — Navbar y Hero

- Prioridad: P0 · Esfuerzo: M · **Estado: Hecho**

Navbar fijo con CTA persistente y menú móvil accesible. Hero con titular de contraste, doble CTA
(ADR-5) y capas decorativas.

`useScrolled()` usa `useSyncExternalStore` en vez de `useState`+`useEffect`: el patrón reflejo no
pasa la regla `react-hooks/set-state-in-effect`, y esta versión además evita el parpadeo inicial
(ADR-9).

### ALS-015 — Secciones informativas y de prueba social

- Prioridad: P1 · Esfuerzo: L · **Estado: Hecho**

Estudio, Servicios (10 cards con CTA por `tier`), Portfolio (línea de tiempo con embeds diferidos),
Alcance, Proceso, Testimonios, FAQ (`<details>` nativo, accesible sin JS propio) y Footer.

Dos correcciones que exigió el React Compiler: `new Date()` del año del footer y del `min` del
datepicker subieron a constante de módulo, porque `react-hooks/purity` rechaza cómputo impuro en
el cuerpo del componente.

Assets del template de Vite eliminados; `icons.svg` reemplazado por íconos de redes reales.

---

## Épica G — Portfolio conectado y hero enriquecido

Alcance nuevo, sumado el 2026-08-12 a partir de referencias del propio Productor: el sitio de
[Aka Kimosabi](https://kimosabi-portfolio-hqfutm.vercel.app/) para la sección de música
conectada a streaming, y el hero de [flownewyork.cl](https://flownewyork.cl) para el efecto de
"aura" que sigue al mouse. Las decisiones de arquitectura de esta épica ya están **cerradas**
(ADR-11 y ADR-12 en `architecture.md` §6) — lo que queda pendiente es implementación y, en el caso
de AWS, credenciales que este entorno no tiene.

### ALS-026 — Integración directa con Spotify del artista (Lambda)

- Prioridad: **P1** · Esfuerzo: M · Estado: **Parcialmente hecho** — handler de referencia escrito,
  sin desplegar

Decisión cerrada (ADR-11): función AWS Lambda con Function URL, secretos en Secrets Manager, CORS
restringido, caché en memoria con TTL. El handler de referencia vive en
[`aws/spotify-catalog/`](../aws/spotify-catalog/README.md).

**Lo que falta, en orden:**

1. Cuenta/región de AWS donde desplegar (del Productor, ya que "el deploy es en AWS" pero sin
   especificar cuál cuenta).
2. `Spotify Artist ID` real de ALIENSKILEZ — ningún camino evita necesitarlo.
3. Registrar la app en el [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
   para obtener `client_id`/`client_secret` y cargarlos en Secrets Manager.
4. Desplegar la función (manual o con IaC — ver ALS-031) y anotar la Function URL resultante.
5. Conectar el frontend: reemplazar la carga estática de `portfolio.ts` por un `fetch` a la
   Function URL, con estado de carga — es el primer dato del sitio que no viene ya resuelto en el
   bundle, así que necesita su propio skeleton (mismo criterio de "degradar, no romper" de ADR-6,
   aplicado a un estado "cargando" en vez de a un dato pendiente).

**Límite honesto de esta sesión:** sin credenciales de AWS ni el Artist ID real, los pasos 1 a 4 no
se pueden ejecutar ni verificar acá. El handler está escrito y su forma de entrada/salida
documentada, pero **no probado contra Spotify real**.

### ALS-027 — Integración con YouTube (mismo patrón que ALS-026)

- Prioridad: P2 · Esfuerzo: M · Estado: Pendiente — depende de ALS-026

Mismo patrón de Lambda; puede ser un segundo handler dentro de la misma función o una función
aparte, a decidir cuando se aborde. La YouTube Data API v3 usa una API key de solo lectura (no
Client Credentials), así que su secreto es de menor sensibilidad que el de Spotify, pero se
guarda igual en Secrets Manager, nunca en el bundle.

**Bloqueado por:** que ALS-026 esté desplegado y probado primero — no tiene sentido resolver el
patrón dos veces en paralelo.

### ALS-028 — Hero: isotipo giratorio con volumen

- Prioridad: P2 · Esfuerzo: L · Estado: **Hecho** — asset definitivo pendiente (ALS-006)

El isotipo del alien gira de forma continua sobre su eje vertical y el visitante puede tomarlo y
girarlo a mano, con inercia al soltar.

**Se resolvió tres veces.** Vale la pena que quede el registro, porque el recorrido explica la
solución actual mejor que la solución sola:

1. **CSS 3D con arrastre.** Correcto para el requisito original. Se cayó cuando el requisito pasó
   a giro **continuo**: un SVG plano girando en Y desaparece de canto dos veces por vuelta.
2. **`3dsvg` sobre Three.js.** Extruía geometría real y resolvía el problema en el papel. Nunca se
   vio en pantalla. La primera causa fue un error de material (`chrome` es un espejo y reflejaba un
   entorno negro sobre fondo negro); corregido a `emissive`, **siguió sin aparecer**. A esa altura
   el diagnóstico era imposible: una caja negra sobre WebGL, sin navegador en el entorno para
   inspeccionarla, y 320 kB gzip de costo.
3. **Capas apiladas en CSS (actual).** 28 copias del path a profundidades crecientes con
   `translateZ` dentro de un `preserve-3d`. Rotando se lee como un objeto sólido; un gradiente de
   `brightness` por capa evita el aspecto de láminas.

**Lo que se ganó al descartar WebGL:** 320 kB gzip menos (~477 → ~158 kB de JS total), cero
dependencias nuevas, funciona sin GPU, y el color vuelve a salir del token CSS — lo que permitió
eliminar `shared/constants/theme.ts` y su test, y dejar ADR-7 **sin excepciones**.

**Punto de reemplazo del asset:** `src/assets/alien-glyph.svg`. El componente extrae de ahí el
`d`, el `viewBox` y el `fill-rule`, así que cambiar el isotipo no requiere tocar código.

**Integración con el scroll:** el isotipo entra en el primer tramo del scroll-pin y se retira al
final, cediendo el foco a los CTA (`HERO_MARK.REVEAL_STAGE` / `FADE_OUT_STAGE`).

**Criterios verificados:** `lint`, `test` (24) y `build` limpios; un solo chunk, sin bundle 3D;
el path y el `fill-rule` se extraen correctamente del archivo (3 subpaths — cabeza + 2 ojos).
**Sin verificar:** el render visual — este entorno no tiene navegador. A confirmación del Productor.

### ALS-029 — Hero: aura que sigue al mouse

- Prioridad: P2 · Esfuerzo: S · Estado: **Hecho**

Efecto de glow radial centrado en la posición del cursor, sobre el fondo del Hero. Sin
dependencias: `pointermove` actualiza dos custom properties CSS (`--mouse-x`/`--mouse-y`) sobre el
contenedor, y un `radial-gradient(circle at var(--mouse-x) var(--mouse-y), ...)` sigue el cursor.
Mismo criterio que el resto de los motivos gráficos del sitio (`design-system.md` §5): CSS puro,
sin canvas ni WebGL, costo de runtime cercano a cero.

**Verificado:** el efecto se desactiva completo bajo `prefers-reduced-motion` y no se activa en
touch (se detecta con `window.matchMedia("(pointer: fine)")`, no hay cursor que seguir en un
dispositivo táctil).

### ALS-031 — Infraestructura AWS (IaC, cuenta, permisos)

- Prioridad: P2 · Esfuerzo: M · Estado: Pendiente — bloquea el despliegue de ALS-026

Definir cómo se despliega y versiona la infraestructura de `aws/spotify-catalog/`: manual desde la
consola (rápido para un solo endpoint, pero no reproducible) vs. IaC (SAM, CDK o Terraform —
reproducible y versionable, más setup inicial). Dado que hoy es una sola función Lambda con un
único secreto, empezar manual y migrar a IaC si se suman más funciones es una secuencia razonable
— no hay que resolverlo de una vez.

**Criterios:** documentado el paso a paso real de despliegue una vez ejecutado contra la cuenta de
AWS del Productor; la Function URL resultante queda anotada en `aws/spotify-catalog/README.md`.

### ALS-032 — Motion cinematográfico: Lenis, cielo del Hero y "Signal Geometry"

- Prioridad: P2 · Esfuerzo: L · Estado: **Hecho**

Capa de scroll/motion premium sobre la base ya existente (Lenis + Framer Motion), en fases:

1. **Lenis calibrado** a un perfil "cinematográfico medio" (`duration`/`easing` en
   `useLenis.ts`, constantes en `limits.ts`).
2. **Hero**: reveal palabra-por-palabra del headline (con `aria-label` en el `<h1>` para que el
   lector de pantalla siga escuchando la frase completa); `HeroSkyScene.tsx` (grid HUD + dos capas
   de estrellas + un planeta, todo plano, con paralaje ligado al scroll del propio Hero — no de la
   página); `HeroShip.tsx` (silueta de nave plana que cruza el Hero de punta a punta según el
   progreso de scroll de la sección).
3. **Ritmo transversal**: `Reveal` (`ui/Section.tsx`) gana la variante `scaleOnView`; márgenes de
   viewport y paso de stagger unificados en `LIMITS.REVEAL_*` (antes vivían como literales
   distintos por sección).
4. **"Signal Geometry"** (`ui/GeometricAccent.tsx`): tres figuras planas de fondo —
   `shards`/`chevrons`/`hex` — con el mismo lenguaje angular de `hud-frame`, usando solo tokens de
   color ya existentes. `Section` acepta la prop `geometry` y las posiciona alternadas por sección.
5. **Storytelling SVG**: en Portfolio, la línea de la timeline pasó de `border-l` estático a un
   track + traza que avanza con el scroll (`useScroll`+`scaleY`); en Proceso, una barra de
   progreso horizontal se dibuja al entrar en viewport (sin depender de la posición de cada card
   en el grid responsive, que habría sido frágil entre breakpoints).
6. **Conversión**: `Alcance.tsx` cuenta 0→valor cuando la métrica ya es un número real (no toca el
   placeholder `[XX]` de ADR-6); el CTA primario (`Button.tsx`) suma un glow que "respira"
   (`cta-breathe`, se pausa en hover/focus).

**Verificado:** `npm run build`, `npm run lint` y `npm run test` (24/24) limpios tras cada fase.
Todo lo nuevo respeta `prefers-reduced-motion` — vía `MotionConfig` para las animaciones
declarativas (`initial`/`whileInView`) y vía `useReducedMotion()` explícito donde la animación es
imperativa (paralaje del Hero, traza de Portfolio, contador de Alcance).

**Pendiente de verificación manual** (fuera del alcance de esta sesión, sin navegador real): medir
Lighthouse mobile/desktop contra el baseline pre-cambio, y probar en un dispositivo táctil real.

---

## Épica E — Alcance y verificación

### ALS-016 — Imagen de compartido social (`og:image`)

- Prioridad: **P1** · Esfuerzo: S · Estado: Pendiente (bloqueado por ALS-006)

Los Open Graph están completos salvo la imagen. Hoy, un enlace compartido por WhatsApp o Instagram
—el canal natural de este negocio— se previsualiza sin imagen, lo que reduce mucho el clic.

**Criterios:** `og:image` de 1200×630 declarada; validada con el depurador de compartidos de una
red real.

### ALS-017 — Datos estructurados JSON-LD

- Prioridad: P2 · Esfuerzo: S · Estado: Pendiente

Falta `LocalBusiness` (o `MusicGroup`) con nombre, ciudad, servicios y redes. Es un negocio local:
ayuda a aparecer en búsquedas del tipo "productor musical La Serena".

**Criterios:** JSON-LD válido según la herramienta de resultados enriquecidos de Google.

### ALS-018 — Sin feedback si el navegador bloquea la pestaña emergente

- Prioridad: P2 · Esfuerzo: S · Estado: Pendiente

`window.open` puede ser bloqueado por el navegador. Hoy el visitante completa el formulario, hace
clic y **no pasa nada visible** — cree que envió algo cuando no envió nada.

Solución propuesta: comprobar el valor de retorno de `window.open`; si es `null`, mostrar el enlace
`wa.me` como fallback clicable en vez de fallar en silencio.

**Criterios:** con las emergentes bloqueadas, aparece un enlace visible que abre el mismo chat.

### ALS-019 — Verificación de rendimiento y accesibilidad

- Prioridad: **P1** · Esfuerzo: S · Estado: Pendiente

Los tamaños de bundle están medidos (139.20 kB gzip de JS) pero **Lighthouse no se corrió todavía**,
y el sitio no se recorrió con lector de pantalla. Ambas cosas están declaradas como no verificadas
en [`rf-rnf-catalogo.md`](./rf-rnf-catalogo.md) §5 en vez de darse por buenas.

**Criterios:** Lighthouse mobile con Performance ≥ 90 y Accessibility ≥ 95; checklist manual de
[`quality-gates.md`](./quality-gates.md) §5 completo.

### ALS-020 — Barrido responsive

- Prioridad: **P1** · Esfuerzo: S · Estado: Pendiente

Construido responsive, sin verificación visual. Anchos de referencia: 320, 375, 768, 1024, 1440.

Punto a revisar concreto: el botón del menú móvil es de 40px y el mínimo táctil recomendado es 44.

---

## Épica F — Documentación y despliegue

### ALS-021 — Documentación del proyecto (SDD)

- Prioridad: P1 · Esfuerzo: L · **Estado: Hecho**

Este conjunto de documentos: arquitectura con 10 ADR, lineamientos de ingeniería, sistema de
diseño, puertas de calidad, RF/RNF, requisitos, historias de usuario, casos de uso y este backlog.

Los criterios de las auditorías de `radarop-front` se destilaron a reglas afirmativas adaptadas a
este stack. Se descartaron explícitamente los que asumen React Query, Zustand, MUI o un backend, y
se dejó anotado el conflicto de `performance.md`, que recomienda `useMemo`/`useCallback` —
incompatible con el React Compiler de este proyecto.

También se inicializó el repositorio git, sin el cual la convención de commits del lineamiento no
tendría dónde aplicarse.

### ALS-022 — Despliegue inicial

- Prioridad: **P0** · Esfuerzo: S · Estado: Pendiente (bloqueado por ALS-001)

Vercel o Netlify conectado al repositorio; build `npm run build`, salida `dist/`. Sitio 100%
estático, sin variables de entorno.

ALS-001 (bloqueante original) ya está cerrado. Lo que queda antes de este ticket es ALS-019
(Lighthouse + a11y) y ALS-020 (barrido responsive) — ver el checklist final.

**Criterios:** dominio resolviendo; checklist final de [`quality-gates.md`](./quality-gates.md) §7
completo.

---

## 3. Diferido a propósito

Decisiones conscientes, no olvidos. Justificación en [`architecture.md`](./architecture.md) §7.

### ALS-023 — Analítica de conversión

Hoy no se sabe cuántos visitantes llegan al formulario ni cuántos abren WhatsApp. Se agrega cuando
haya tráfico real que medir; instrumentar antes es medir a ciegas.

### ALS-024 — Reducir el peso del JavaScript

Actualizado tras resolver ALS-028 sin WebGL. El chunk de 320 kB que este ticket señalaba **ya no
existe**: se eliminó al reemplazar Three.js por capas CSS, no optimizándolo.

Queda un solo frente: el bundle inicial de **157 kB gzip**, que excede el umbral verde de 150
(`quality-gates.md` §2). El candidato más gordo es Framer Motion — el uso actual (scroll-reveal,
paralaje del Hero, contadores de Alcance) es sustituible por IntersectionObserver + CSS, pero es
un refactor grande y hoy no hay evidencia de que haga falta.

Se decide con el Lighthouse de ALS-019 en la mano. Optimizar sin medir es adivinar.

### ALS-025 — Preselección del servicio desde las cards

Requiere un canal de estado entre componentes y un efecto de sincronización que pelea con las
reglas de pureza del compilador, a cambio de ahorrar un clic en un `<select>` que ya está a la
vista. Ver ADR-5.

---

## 4. Tablero resumido

| ID      | Épica | Prio   | Esfuerzo | Estado                             | Bloqueado por                    |
| ------- | ----- | ------ | -------- | ---------------------------------- | -------------------------------- |
| ALS-001 | A     | P0     | S        | ✅ Hecho                           | —                                |
| ALS-002 | A     | P2     | S        | Pendiente                          | Productor                        |
| ALS-003 | A     | P1     | M        | Pendiente                          | Productor                        |
| ALS-004 | A     | P1     | S        | Pendiente                          | Productor                        |
| ALS-005 | A     | P1     | S        | Pendiente                          | Artistas                         |
| ALS-006 | A     | P2     | M        | Pendiente                          | Diseño                           |
| ALS-007 | B     | P0     | M        | ✅ Hecho                           | —                                |
| ALS-008 | B     | P0     | M        | ✅ Hecho                           | —                                |
| ALS-009 | B     | P1     | S        | ✅ Hecho                           | —                                |
| ALS-010 | B     | P0     | M        | ✅ Hecho                           | —                                |
| ALS-011 | C     | P0     | S        | ✅ Hecho                           | —                                |
| ALS-012 | C     | P0     | M        | ✅ Hecho                           | —                                |
| ALS-013 | C     | P0     | M        | ✅ Hecho                           | —                                |
| ALS-014 | D     | P0     | M        | ✅ Hecho                           | —                                |
| ALS-015 | D     | P1     | L        | ✅ Hecho                           | —                                |
| ALS-016 | E     | P1     | S        | Pendiente                          | ALS-006                          |
| ALS-017 | E     | P2     | S        | Pendiente                          | —                                |
| ALS-018 | E     | P2     | S        | Pendiente                          | —                                |
| ALS-019 | E     | P1     | S        | Pendiente                          | —                                |
| ALS-020 | E     | P1     | S        | Pendiente                          | —                                |
| ALS-021 | F     | P1     | L        | ✅ Hecho                           | —                                |
| ALS-022 | F     | P0     | S        | Pendiente                          | ALS-019, ALS-020                 |
| ALS-023 | —     | —      | —        | Diferido                           | —                                |
| ALS-024 | —     | —      | —        | Diferido                           | ALS-019                          |
| ALS-025 | —     | —      | —        | Diferido                           | —                                |
| ALS-026 | G     | **P1** | M        | 🟡 Parcial — handler sin desplegar | Cuenta AWS + Artist ID + ALS-031 |
| ALS-027 | G     | P2     | M        | Pendiente                          | ALS-026 desplegado               |
| ALS-028 | G     | P2     | L        | ✅ Hecho                           | Asset definitivo: ALS-006        |
| ALS-029 | G     | P2     | S        | ✅ Hecho                           | —                                |
| ALS-030 | A     | P2     | S        | Pendiente                          | Productor (cuenta Business)      |
| ALS-031 | G     | P2     | M        | Pendiente                          | Cuenta AWS del Productor         |

**Camino crítico al lanzamiento:** ALS-019 → ALS-020 → ALS-022. ALS-001 ya no bloquea.
ALS-026, ALS-027 y ALS-031 son alcance nuevo que **mejora** el sitio pero no impide publicarlo — el sitio
puede lanzarse con el portfolio manual actual y sumar la integración con Spotify después.

## 5. Gobernanza

1. Todo bug o mejora que aparezca se agrega con ID `ALS` correlativo, en la épica que corresponda.
2. Ningún ticket P0/P1 se cierra sin su criterio verificado de verdad — no "debería andar".
3. Este documento se actualiza en el mismo commit que cierra el ticket, no después.
4. El detalle de **cómo** se implementó vive en el código y en los commits, no en prosa duplicada
   acá.
