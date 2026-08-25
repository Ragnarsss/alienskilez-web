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

- Prioridad: **P1** · Esfuerzo: M · Estado: **Pendiente** — diseño cerrado, sin código

Decisión cerrada (ADR-11): función AWS Lambda con Function URL, secretos en Secrets Manager, CORS
restringido, caché en memoria con TTL.

> **Corrección de estado (2026-08-13).** Este ticket estuvo marcado "parcialmente hecho, handler de
> referencia escrito" y enlazaba a `aws/spotify-catalog/`. **Ese directorio nunca existió.** No hay
> código escrito para esta integración. Se corrige porque un backlog que declara trabajo
> inexistente deja de servir para lo único que sirve: saber qué falta.

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

**Límite honesto:** sin credenciales de AWS ni el Artist ID real, los pasos 1 a 4 no se pueden
ejecutar ni verificar. El paso 0 —escribir el handler— sí se puede hacer en cualquier momento y es
lo único que no depende del Productor.

### ALS-027 — Integración con YouTube (mismo patrón que ALS-026)

- Prioridad: P2 · Esfuerzo: M · Estado: Pendiente — depende de ALS-026

Mismo patrón de Lambda; puede ser un segundo handler dentro de la misma función o una función
aparte, a decidir cuando se aborde. La YouTube Data API v3 usa una API key de solo lectura (no
Client Credentials), así que su secreto es de menor sensibilidad que el de Spotify, pero se
guarda igual en Secrets Manager, nunca en el bundle.

**Bloqueado por:** que ALS-026 esté desplegado y probado primero — no tiene sentido resolver el
patrón dos veces en paralelo.

### ALS-028 — Hero: isotipo 3D giratorio

- Prioridad: P2 · Esfuerzo: L · Estado: **Hecho** — asset definitivo pendiente (ALS-006)

El isotipo del alien se extruye a geometría 3D real con `3dsvg`, gira de forma continua sobre su
eje vertical y el visitante puede tomarlo y girarlo. Aparece y se retira con el scroll-pin del
Hero (`HERO_MARK.REVEAL_STAGE` / `FADE_OUT_STAGE`).

**Costó cuatro intentos, y la causa fue siempre la misma.** Un comentario de documentación dentro
de `alien-glyph.svg` contenía un doble guion, ilegal dentro de un comentario XML. El `DOMParser`
del navegador devolvía `parsererror`, `3dsvg` no encontraba paths y abortaba **sin lanzar nada**.
Como el fallo era invisible, se descartó dos veces la herramienta correcta y se construyó un
reemplazo peor (capas CSS, que daban volumen pero no material). Detalle completo en ADR-12.

Bugs reales corregidos en el camino, todos con la misma firma de "falla en silencio":

| Bug | Síntoma |
|---|---|
| Doble guion en comentario XML | Canvas vacío, sin error — **causa raíz** |
| `material="chrome"` | Espejo reflejando un entorno negro sobre fondo negro |
| Contenedor sin altura | `height: 100%` de 0px = canvas de 0px |
| `onReady` en vez de `onLoadingChange` | El respaldo se apagaba antes de que existiera el 3D |
| Props de más (`background`, `width`/`height`, luces) | Rompían los defaults calibrados |

**Degradación:** el mismo glyph se renderiza plano debajo y solo se apaga cuando la extrusión
confirma que terminó. Si WebGL falla, queda el alien plano con glow — nunca un hueco (ADR-6). Un
límite de error evita que una excepción se lleve puesto el resto del Hero.

**Punto de reemplazo del asset:** `src/assets/alien-glyph.svg`. Cambiar el isotipo no requiere
tocar código — pero **sin comentarios adentro**, que es lo que rompió todo (ver `alien-glyph.test.ts`).

**Costo:** chunk 3D de 319.63 kB gzip, diferido. Es la deuda de ALS-024.

**Criterios verificados:** gira solo, se puede arrastrar, respeta `prefers-reduced-motion`;
`lint`, `test` (29) y `build` limpios; render confirmado por el Productor en navegador real.

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

- Prioridad: **P1** · Esfuerzo: S · Estado: Pendiente
- RF-BKG-007 · CU-BKG-002 (E2)

`window.open` puede ser bloqueado por el navegador. Hoy el visitante completa el formulario, hace
clic y **no pasa nada visible** — cree que envió algo cuando no envió nada. Es el único punto del
embudo donde una falla es invisible y total, y de ahí la prioridad.

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

- Prioridad: **P0** · Esfuerzo: S · Estado: Pendiente (bloqueado por ALS-019, ALS-020)

Vercel o Netlify conectado al repositorio; build `npm run build`, salida `dist/`. Sitio 100%
estático, sin variables de entorno.

ALS-001 (bloqueante original) ya está cerrado. Lo que queda antes de este ticket es ALS-019
(Lighthouse + a11y) y ALS-020 (barrido responsive) — ver el checklist final.

**Criterios:** dominio resolviendo; checklist final de [`quality-gates.md`](./quality-gates.md) §7
completo.

**Actualización 2026-08-25 — el destino real cambió:** el sitio terminó en **AWS S3 + CloudFront**
primero, y ahora se está migrando a **AWS Amplify Hosting** conectado a
`github.com/Ragnarsss/alienskilez-web` (rama `main`), no Vercel/Netlify como decía el texto
original de este ticket. Tampoco es cierto ya que sea "sin variables de entorno": ALS-023 agregó
`VITE_GA_MEASUREMENT_ID`, configurada como variable de entorno en la propia consola de Amplify (ver
`.env.example`). Este ticket sigue sin actualizarse a fondo con ese cambio de infraestructura —
pendiente, no urgente mientras el deploy funcione.

### ALS-046 — Pipeline de CI en GitHub Actions *(propuesto 2026-08-25, dispara la reversión de una ADR)*

- Prioridad: P2 · Esfuerzo: S · Estado: Propuesto — **no implementado todavía**

**Por qué aparece:** el primer build real en Amplify (conectando ALS-023) falló — no por un bug de
código, sino porque el nombre de la variable de entorno se cargó con un espacio al final en la
consola de Amplify (`VITE_GA_MEASUREMENT_ID ` en vez de `VITE_GA_MEASUREMENT_ID`), y eso rompió el
`define` de Vite en build time. `lint`/`test`/`build` locales no lo hubieran detectado igual (es un
dato de la consola de Amplify, no del código), pero expone que hoy **nada corre automático antes de
que Amplify intente construir** — el primer lugar donde un error de build se nota es en el propio
deploy fallido.

**Esto revierte una decisión ya tomada, no es solo "agregar un archivo".**
`architecture.md` §7 registra **"Sin pipeline de CI bloqueante"** como deuda consciente, con su
propio criterio de cuándo reevaluarla: *"si el sitio crece o si toca el código más de una
persona."* Antes de implementar esto hace falta una ADR nueva (skill `nueva-adr`) que registre por
qué se revierte esa decisión — no alcanza con el pipeline en sí.

**Alcance pendiente de decidir (con el usuario, no a criterio propio):** un workflow de GitHub
Actions que corra `npm run lint && npm test && npm run build` en cada push/PR — **bloqueante** en
`main` (falla el check, no se debería mergear) fue la opción que se puso sobre la mesa pero todavía
no se confirmó el alcance final.

**Límite honesto:** un CI así detecta regresiones de código, pero **no** hubiera atrapado el bug
puntual que lo disparó (config de la consola de Amplify) salvo que el propio workflow buildee con
las mismas variables de entorno que usa Amplify — a definir si vale la pena esa duplicación.

---

---

## Épica H — Prueba de calidad (funcional)

Mejoras propuestas que atacan el mismo cuello de botella: **hoy el sitio afirma que el productor es
bueno, pero no deja comprobarlo.** Copy, cifras y testimonios son todos testimonio de parte. Estas
piezas convierten afirmación en evidencia.

Ninguna está construida. Estado `Propuesto` en todas.

### ALS-033 — Comparador antes/después de mezcla

- Prioridad: **P1** · Esfuerzo: L · Estado: Propuesto
- HU-AUD-001 · CU-AUD-001 · RF-AUD-001, RNF-AUD-001

Reproductor que alterna entre el mismo fragmento sin procesar y ya mezclado/masterizado,
manteniendo la posición al cambiar.

**Es la mejora de mayor impacto de todo el backlog.** Un productor vende una diferencia audible, y
esta es la única pieza del sitio que deja al visitante comprobarla en diez segundos sin confiar en
nadie. Vale más para la conversión que las seis mejoras visuales de la Épica I juntas.

**Lo difícil no es el código, es el material:** hacen falta pares de fragmentos con autorización
del artista dueño, y **con los niveles emparejados**. Un "después" más fuerte suena mejor aunque no
lo sea; publicarlo sin emparejar sería el equivalente sonoro de inventar una cifra (ADR-6).

**Criterios:** alternar mantiene la posición; cero audio descargado hasta que el visitante lo pida;
fragmentos de 15-30 s; niveles emparejados; un fallo de carga informa y ofrece reintentar en vez de
dejar un control muerto.

### ALS-034 — Reproductor persistente al scrollear

- Prioridad: P2 · Esfuerzo: M · Estado: Propuesto — depende de ALS-033
- HU-AUD-002 · CU-AUD-002 · RF-AUD-002

Control flotante que aparece cuando hay audio sonando y el visitante deja la sección de origen.

**Por qué mueve la aguja:** hoy escuchar y avanzar compiten entre sí. Si el audio sobrevive al
scroll, el visitante puede llegar al formulario **con la música del productor sonando** — que es
exactamente el estado en el que uno decide contratarlo.

**Riesgo a vigilar:** un control flotante que tape el botón de envío en móvil costaría
conversiones. Sería una mejora que empeora lo único que importa. El criterio de aceptación lo
prohíbe explícitamente.

**Criterios:** un solo audio a la vez en todo el sitio; el control no obstruye formulario ni CTA;
desaparece al pausar; nada se reproduce sin gesto del visitante.

### ALS-035 — Testimonios en audio o video

- Prioridad: P2 · Esfuerzo: M · Estado: Propuesto — depende de ALS-005
- RF-SOC-001

Un testimonio en la voz del artista pesa más que el mismo texto entrecomillado, y para un negocio
de audio es coherente con el producto.

**Criterios:** un testimonio con media reproduce sin salir del sitio; uno sin media se muestra como
cita, sin hueco; misma regla de autorización que el texto.

### ALS-036 — Referencia de sonido en el formulario

- Prioridad: P2 · Esfuerzo: S · Estado: Propuesto
- HU-BKG-002 · CU-BKG-001 · RF-BKG-006

Campo opcional para pegar un enlace (Spotify, YouTube, Drive) como referencia de lo que el artista
busca. "Quiero que suene tipo X" es como los artistas explican realmente lo que quieren.

**Es el ticket con mejor relación impacto/esfuerzo de esta épica:** un campo, una validación de URL
en el schema y una línea más en `buildWhatsAppMessage()`. Mejora la calidad del lead y le ahorra al
Productor una ronda completa de repreguntas.

**Criterios:** un enlace válido viaja en el mensaje como línea propia; uno inválido se rechaza con
motivo; vacío se omite.

## Épica I — Refinamiento visual (estético)

Mejoras de acabado. Todas **P3 salvo la primera**, y con una advertencia honesta: ninguna de estas
hace que alguien escriba que no iba a escribir. El argumento a favor —el sitio de un profesional
del audio comunica su estándar de calidad— es real pero de segundo orden.

Van después de la Épica H completa. Si hay que elegir, ALS-037 vale más que las otras cinco juntas.

### ALS-037 — Fotos reales del estudio y de sesiones

- Prioridad: **P2** · Esfuerzo: S (código) · Estado: Pendiente — bloqueado por ALS-006
- HU-EST-001

El sitio habla de una sala y de sesiones dirigidas, y no muestra ninguna. Una foto real del espacio
hace más por la credibilidad que cualquier animación.

**Es la única de esta épica que no es decoración:** cambia lo que el visitante *sabe*, no cómo se
siente. Bloqueado por que el Productor tome las fotos.

**Criterios:** imágenes optimizadas (WebP/AVIF) con `loading="lazy"` y dimensiones declaradas para
no generar CLS.

### ALS-038 — Waveform reactivo en el Hero

- Prioridad: P3 · Esfuerzo: M · Estado: Propuesto

Onda de audio animada como motivo gráfico del Hero. Encaja con la identidad y con el rubro mejor
que el starfield genérico.

**Advertencia:** si se hace reactivo a audio real necesita Web Audio API y un gesto del usuario
para arrancar. Una versión puramente decorativa (SVG animado, sin audio) da el 80% del efecto a una
fracción del costo. Empezar por ahí.

### ALS-039 — Transición cinematográfica entre secciones

- Prioridad: P3 · Esfuerzo: M · Estado: Propuesto

Hoy las secciones aparecen con scroll-reveal individual. Una transición que las encadene reforzaría
la sensación de recorrido continuo que el Hero con scroll-pin ya insinúa.

**Restricción:** debe apagarse completa con `prefers-reduced-motion` (RNF-VIS-001, ADR-13).

### ALS-040 — Indicador de progreso y navegación por secciones

- Prioridad: P3 · Esfuerzo: S · Estado: Propuesto

Barra o marcadores laterales que muestren dónde está el visitante en el recorrido. En un one-pager
largo, saber cuánto falta reduce el abandono.

### ALS-041 — Preloader de marca

- Prioridad: P3 · Esfuerzo: S · **Estado: Hecho** *(commit `3de33fb`, backlog corregido 2026-08-24 —
  se cerró en código sin actualizar este documento en el mismo commit, contra la regla de §5)*

**Ojo con este:** un preloader *agrega* tiempo percibido a cambio de una impresión de marca. En una
landing de conversión suele ser mala idea. La decisión de construirlo igual **no esperó** a los
datos de Lighthouse (ALS-019) que este mismo ticket pedía como condición — queda registrado como
desviación, no como criterio cumplido.

Overlay de ~3.4s: el isotipo se dibuja como contorno (`stroke-dashoffset`), se rellena con glow
neón y cierra con el wordmark en bloom — un solo movimiento continuo, en CSS puro. Se saltea con
cualquier interacción (incluido `Tab`, para no dejar una capa opaca tabulable) y no se monta con
`prefers-reduced-motion`. Reusa `alien-glyph.svg`, cubierto por `preloader-timing.test.ts` y un
caso nuevo en `alien-glyph.test.ts`.

**Pendiente real:** correr ALS-019 y confirmar con datos que el preloader ayuda o empeora la
percepción — este ticket se dio por hecho sin esa verificación.

### ALS-042 — Cursor personalizado

- Prioridad: P3 · Esfuerzo: S · Estado: Propuesto

Cursor con la identidad del sitio. Riesgos conocidos: puede degradar la usabilidad, no aplica en
táctil, y si tapa el cursor nativo en campos de formulario es directamente un problema. Solo con
`@media (pointer: fine)` y sin tocar el formulario.

### ALS-043 — Mazo apilable de Servicios

- Prioridad: P2 · Esfuerzo: M · **Estado: Hecho**
- HU-SRV-001 · RF-SRV-001 · Extiende ALS-015 · Épica I

En desktop (`MEDIA.DECK`, ≥1024px) las 10 cards de Servicios se apilan como un mazo con el scroll:
cascada diagonal descendente, cada card sube desde abajo a su lugar, y el isotipo 3D translúcido
gira y viaja detrás de la pila, atado al scroll (no autónomo). En mobile y con
`prefers-reduced-motion` se mantiene la grilla simple con descripción y CTA por servicio — es una
decisión de **layout**, no de "hay o no movimiento": el mazo exige un recorrido de scroll que no
tiene sentido imponerle a quien pidió menos movimiento.

Referencia visual: la sección "Lenis brings the heat" de lenis.darkroom.engineering.

**Criterios verificados:** hasta 4 cards simultáneas en cascada; entrada de abajo hacia arriba;
isotipo grande (800px), girando en diagonal (yaw+pitch) y desplazándose horizontalmente de forma
continua atado al `scrollYProgress` — no en escalones ni de forma autónoma —, reconocible a través
de las cards translúcidas; sin overflow ni solapamiento a 1024px; la grilla mobile no cambia. La
altura de la sección bajó de 4232px a 1991px (−53%).

**Bug real encontrado y corregido en el camino:** el wrapper del isotipo era hijo de un contenedor
`flex`, y el `flex-shrink: 1` default de flexbox comprimía en silencio su ancho pedido al ancho
(más angosto) de la pila de cards — sin error ni warning. Se resolvió centrando con `x`/`y` de
framer-motion en vez de `flex items-center justify-center`.

**QA pendiente:** teclado real y anchos intermedios en navegador — se cubre en ALS-019 y ALS-020,
no acá.

> **Sobre el tamaño de esta ficha.** Ocupaba cientos de líneas con el registro iteración por
> iteración, cada una repitiendo sus cifras de bundle y su corrida de `lint`/`test`/`build`. Se
> redujo aplicando la anatomía de ticket de §5: la evolución vive en los commits
> (`c242989` → `65d7481` → `65c774c` → `ce1f5db` → `4cb14e4` → `4c5af36` → `697d196`),
> los parámetros y su porqué en los comentarios de `constants/limits.ts`, y las cifras de bundle en
> `quality-gates.md`.

---

## Épica J — Medición

### ALS-023 — Analítica de conversión con Google Analytics 4 *(implementado 2026-08-24)*

- Prioridad: **P1** · Esfuerzo: M · Estado: **Implementado — pendiente verificación manual con
  Measurement ID real** (ver checklist abajo)
- HU-ANL-001 · CU-ANL-001 · RF-ANL-001, RNF-ANL-001
- Decisión de herramienta cerrada: [ADR-15](./architecture.md#adr-15--analítica-de-conversión-con-ga4-estándar-supersede-la-restricción-de-als-023-2026-08-24)

Se desbloqueó: el sitio ya está desplegado (AWS S3), así que el argumento de "instrumentar sin
tráfico es medir ruido" dejó de aplicar.

**Qué mide:** visitas (page view automático de GA4) → clic por CTA, con `tier` ("sesion"/"proyecto")
→ envío válido del formulario (post-validación de zod) → apertura de WhatsApp, incluyendo el caso
de popup bloqueado por el navegador (mismo caso que ALS-018) como evento propio en vez de silencio.

**Restricción original superada por ADR-15 (2026-08-24).** La versión anterior de este ticket
exigía "sin cookies, sin banner de consentimiento" — correcto para una landing sin objetivo de
marketing medible explícito, que dejó de ser el caso. La decisión ahora es **GA4 estándar (cookies
de primera parte) + un aviso de cookies mínimo, no bloqueante**.

**Implementación (código, verificada con `npm run lint && npm test && npm run build`, los tres
limpios):**
- `src/shared/lib/consent.ts` — store de la decisión de cookies (`localStorage`), función pura
  `parseConsentValue` testeada.
- `src/shared/hooks/useCookieConsent.ts` — expone el estado vía `useSyncExternalStore`.
- `src/shared/components/ui/CookieConsent.tsx` — franja fija, no bloqueante, con "Aceptar" y
  "Rechazar" reales (rechazar no manda ningún evento).
- `src/shared/lib/analytics.ts` — `loadGtag()` (carga `gtag.js` async, diferida, recién cuando hay
  consentimiento otorgado) y `trackEvent()`/`trackCtaClick()`. Gate puro `shouldSendEvent`
  testeado aparte del DOM.
- Los 4 puntos de CTA (`Hero.tsx`, `Navbar.tsx`, `ServiceCard.tsx`, `ServiciosDeck.tsx`) llaman
  `trackCtaClick(tier)` en su `onClick` — sigue siendo el componente delegando el evento, no
  armando lógica de negocio.
- `useBookingForm.ts` dispara `booking_form_submit` al pasar la validación, y
  `whatsapp_open`/`whatsapp_blocked` según el resultado de `window.open`. Se sacó `noopener`/
  `noreferrer` del string de features de `window.open` (con cualquiera de los dos, el valor de
  retorno es *siempre* `null` por spec — no se puede distinguir bloqueo real) y en su lugar se
  anula `popup.opener = null` a mano: mismo blindaje contra reverse tabnabbing, con un valor de
  retorno que sí sirve para medir. **Esto es una mejora de la base de ALS-018, no lo cierra**:
  sigue sin existir el enlace `wa.me` visible de respaldo que pide ese ticket.
- Cero PII: ningún evento lleva `fullName`, `preferredDate` ni `message` — solo `tier`.
- `.env.example` documenta `VITE_GA_MEASUREMENT_ID`. Sin ese valor configurado (o con el
  placeholder), `IS_GA_PLACEHOLDER` apaga `trackEvent`/`loadGtag` en silencio — no rompe nada, pero
  tampoco mide nada.

**Pendiente, no verificable desde acá — bloquea marcar "Hecho" de verdad:**
1. **Configurar el Measurement ID real** de la propiedad GA4 en el entorno de build/deploy
   (`VITE_GA_MEASUREMENT_ID`) — hoy sigue en placeholder.
2. **Prueba manual del embudo completo con GA4 Realtime abierto**: visitar el sitio desplegado,
   aceptar el aviso, clickear un CTA de cada tier, completar y enviar el formulario, confirmar que
   `cta_click`, `booking_form_submit` y `whatsapp_open` aparecen en Realtime. Ninguna sesión de
   este agente tiene acceso a una cuenta de GA4 ni a un navegador real para hacerlo.
3. **Lighthouse completo** (mobile + desktop): este entorno no tiene Chrome instalado, así que solo
   se pudo medir el tamaño de bundle vía `npm run build` (JS inicial subió de 157.27 kB a 161.24 kB
   gzip — sigue en amarillo, no cruza a rojo; el detalle está en `quality-gates.md` §2). Falta
   correr `npx lighthouse` de verdad para Performance/Accessibility/LCP/CLS/INP.
4. **Estado de la Ley 21.719** (protección de datos, Chile): verificado hoy (2026-08-24) — **entra
   en vigencia el 1 de diciembre de 2026**, todavía no rige. El aviso mínimo de ADR-15 sigue siendo
   válido por ahora, pero hay que revisar esto de nuevo antes de esa fecha — no es un cierre
   definitivo, es una alarma con vencimiento.

**Además desbloquea, una vez completado el checklist de arriba:** ALS-024 (si el JS extra se
justifica) y ALS-041 (si el preloader mejora o empeora la conversión).

### ALS-044 — Sección Discografía: catálogo de Spotify en vivo

- Prioridad: P2 · Esfuerzo: M · Estado: Propuesto
- Épica: G · Bloqueado por: ALS-026 (Lambda de Spotify desplegada)

Sección nueva, **distinta de Portfolio**. Portfolio sigue siendo curaduría editorial (los trabajos
que ALIENSKILEZ elige destacar, con su rol y año); esta sección muestra el **catálogo completo y
en vivo** del artista en Spotify — se actualiza solo cuando sale un lanzamiento nuevo, sin que
alguien lo copie a mano en `constants/portfolio.ts`. Es el mismo problema que ADR-11 ya diagnosticó
para el portfolio, aplicado a una sección con propósito propio en vez de a un dato suelto.

**Alcance:**
- Consume la Function URL de ALS-026 (no la Web API de Spotify directo — el secreto no puede
  vivir en el bundle, ver ADR-11).
- Wiring en `App.tsx` como sección nueva, con su propio anchor en `constants/sections.ts` — no se
  cuelga del componente `Portfolio.tsx` existente.
- Estado de carga propio (skeleton), igual criterio de "degradar, no romper" que ADR-6 aplica a
  datos pendientes — acá aplicado a un estado "cargando" real, no a un placeholder de negocio.
- Si la Function URL falla o no responde: fallback visible y no roto (nunca una sección vacía sin
  explicación), mismo criterio que el resto del sitio.

**Criterios de aceptación:** la sección lista los lanzamientos reales del Artist ID configurado,
respeta `prefers-reduced-motion` si lleva cualquier reveal, y no bloquea el LCP del resto de la
página (carga diferida, mismo patrón que el motor 3D del Hero).

**No implementar antes de:** ALS-026 desplegado y probado — no tiene sentido construir el consumidor
antes de que el productor de datos exista.

### ALS-045 — Sección Video: catálogo de YouTube en vivo

- Prioridad: P3 · Esfuerzo: M · Estado: Propuesto
- Épica: G · Bloqueado por: ALS-027 (Lambda de YouTube desplegada) y, en la práctica, ALS-044
  (mismo patrón de sección, tiene sentido resolverlo una vez y reutilizar el criterio, no en
  paralelo)

Mismo propósito que ALS-044, con la API de YouTube: sección nueva, catálogo en vivo, separada de
Portfolio. Reutiliza el mismo patrón de skeleton/fallback que ALS-044 defina primero — no vale la
pena inventar dos veces la misma solución de estado de carga.

**Alcance:** igual estructura que ALS-044 (Function URL propia o segundo handler de la misma
Lambda, ver ALS-027), sección propia en `App.tsx` con su anchor, carga diferida.

**No implementar antes de:** ALS-027 desplegado y ALS-044 resuelto — en ese orden.

---

## 3. Diferido a propósito

Decisiones conscientes, no olvidos. Justificación en [`architecture.md`](./architecture.md) §7.

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
| ALS-018 | E     | **P1**     | S        | Pendiente                          | —                                |
| ALS-019 | E     | P1     | S        | Pendiente                          | —                                |
| ALS-020 | E     | P1     | S        | Pendiente                          | —                                |
| ALS-021 | F     | P1     | L        | ✅ Hecho                           | —                                |
| ALS-022 | F     | P0     | S        | En curso — migrando de S3 a AWS Amplify (ver nota en el ticket) | ALS-019, ALS-020 |
| ALS-023 | J     | **P1** | M        | Implementado, Measurement ID real cargado — falta verificación manual en GA4 Realtime tras el primer deploy exitoso a Amplify | — |
| ALS-046 | F     | P2     | S        | Propuesto — revierte una ADR, no implementar sin ADR nueva | — |
| ALS-024 | —     | —      | —        | Diferido                           | ALS-019                          |
| ALS-025 | —     | —      | —        | Diferido                           | —                                |
| ALS-026 | G     | **P1** | M        | Pendiente — sin código todavía     | Cuenta AWS + Artist ID + ALS-031 |
| ALS-027 | G     | P2     | M        | Pendiente                          | ALS-026 desplegado               |
| ALS-028 | G     | P2     | L        | ✅ Hecho                           | Asset definitivo: ALS-006        |
| ALS-029 | G     | P2     | S        | ✅ Hecho                           | —                                |
| ALS-030 | A     | P2     | S        | Pendiente                          | Productor (cuenta Business)      |
| ALS-031 | G     | P2     | M        | Pendiente                          | Cuenta AWS del Productor         |
| ALS-032 | G     | P2     | L        | ✅ Hecho                           | —                                |
| ALS-044 | G     | P2     | M        | Propuesto                          | ALS-026 desplegado               |
| ALS-045 | G     | P3     | M        | Propuesto                          | ALS-027 desplegado, ALS-044      |
| ALS-041 | I     | P3     | S        | ✅ Hecho — Lighthouse (ALS-019) todavía no corrido | — |
| ALS-043 | I     | P2     | M        | ✅ Hecho — QA visual manual pendiente | —                |

### Alcance propuesto (mejoras, nada construido)

| ID | Épica | Prio | Esfuerzo | Qué es | Bloqueado por |
|---|---|---|---|---|---|
| ALS-033 | H | **P1** | L | Comparador antes/después de mezcla | Material de audio autorizado |
| ALS-034 | H | P2 | M | Reproductor persistente al scrollear | ALS-033 |
| ALS-035 | H | P2 | M | Testimonios en audio o video | ALS-005 |
| ALS-036 | H | P2 | S | Referencia de sonido en el formulario | — |
| ALS-037 | I | P2 | S | Fotos reales del estudio | ALS-006 (fotos) |
| ALS-038 | I | P3 | M | Waveform reactivo en el Hero | — |
| ALS-039 | I | P3 | M | Transición entre secciones | — |
| ALS-040 | I | P3 | S | Indicador de progreso de scroll | — |
| ALS-042 | I | P3 | S | Cursor personalizado | — |

**Orden recomendado, si hay que elegir:**

1. **ALS-036** — el mejor impacto por esfuerzo de todo el backlog: un campo, una validación y una
   línea en el builder del mensaje.
2. **ALS-018** — cierra el único punto del embudo donde una falla es invisible y total.
3. **ALS-033** — la mejora de más impacto en términos absolutos. El código es lo fácil; conseguir
   los pares de audio autorizados y con niveles emparejados es lo que la hace pesada.
4. **ALS-023** — el código ya está, falta configurar el Measurement ID real y verificar el embudo
   en GA4 Realtime: sin eso, ALS-024 y ALS-041 no tienen forma de resolverse con datos.
5. **ALS-026** — en cuanto el Productor entregue cuenta de AWS y Artist ID. **ALS-044** es la
   continuación natural una vez desplegado (mismo dato, sección propia en vez de Portfolio).
6. **ALS-037** — en cuanto haya fotos.
7. **ALS-045** — después de ALS-044, no en paralelo (mismo patrón, resolverlo una sola vez).
8. Todo lo demás de la Épica I, al final y sin apuro.

**Una advertencia sobre la Épica I:** son seis tickets de acabado visual y ninguno hace que alguien
escriba que no iba a escribir. Es la parte del backlog más fácil de empezar y la que menos rinde.
Si el tiempo es escaso, ALS-037 (fotos reales) y nada más.

**Camino crítico al lanzamiento:** ALS-019 → ALS-020 → ALS-022. ALS-001 ya no bloquea.
ALS-026, ALS-027, ALS-031, ALS-044 y ALS-045 son alcance nuevo que **mejora** el sitio pero no
impide publicarlo — el sitio puede lanzarse con el portfolio manual actual y sumar la integración
con Spotify/YouTube después. ALS-023 (GA4) tampoco bloquea el lanzamiento, pero cuanto antes esté
después de ALS-022, antes hay datos reales para decidir ALS-024 y ALS-041.

## 5. Gobernanza

### Anatomía de un ticket

Cinco bloques y nada más:

1. **Encabezado** — Prioridad · Esfuerzo · Estado
2. **Trazabilidad** — HU / CU / RF / ADR que lo justifican
3. **Qué es** — dos a cuatro líneas: qué capacidad entrega
4. **Criterios de aceptación** — verificables y específicos de *este* ticket
5. **Bloqueado por** — si aplica

**Lo que NO va en un ticket, y dónde vive de verdad:**

| No va | Vive en |
|---|---|
| Historial de iteraciones sobre el mismo componente | Los commits |
| Resultados de `lint` / `test` / `build` | Es la DoD, aplica a todos por igual |
| Cifras de bundle | [`quality-gates.md`](./quality-gates.md) §2 |
| Justificación de una decisión de diseño | Un ADR o [`design-system.md`](./design-system.md) |
| Parámetros y su porqué | Los comentarios del código (`constants/limits.ts`) |
| Notas sobre ediciones de este documento | El historial de git |

**Regla práctica:** un ticket que no entra en ~25 líneas casi siempre son varios tickets, o tiene
adentro algo que pertenece a otro documento. Este backlog es un documento vivo, pero "vivo" es que
cambian los estados y se agregan tickets — no que cada ticket acumule su propio changelog.



1. Todo bug o mejora que aparezca se agrega con ID `ALS` correlativo, en la épica que corresponda.
2. Ningún ticket P0/P1 se cierra sin su criterio verificado de verdad — no "debería andar".
3. Este documento se actualiza en el mismo commit que cierra el ticket, no después.
4. El detalle de **cómo** se implementó vive en el código y en los commits, no en prosa duplicada
   acá.
