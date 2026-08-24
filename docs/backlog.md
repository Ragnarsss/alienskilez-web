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

### ALS-018 — Fallback si el navegador bloquea la pestaña *(ya existía, se promueve)*

- Prioridad: **P1** (sube desde P2) · Esfuerzo: S · Estado: Pendiente
- RF-BKG-007 · CU-BKG-002 E2

Sube de prioridad porque es el **único punto del embudo donde una falla es invisible y total**: el
visitante completa el formulario, hace clic, no pasa nada, y se va creyendo que envió algo.

**Criterios:** con emergentes bloqueadas aparece un enlace clicable al mismo chat.

---

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
- Épica: I (refinamiento visual) · Sección afectada: Servicios (ALS-015)

**Backlog corregido 2026-08-24:** el commit `4b1360d` ("prepara el terreno para el mazo apilable")
referenciaba este ID desde el 2026-08-16 sin que existiera acá — un ticket fantasma, mismo tipo de
gap que ADR-11 ya corrigió una vez para otro caso.

En desktop (`MEDIA.DECK`, ≥1024px, coincide con el `lg` de Tailwind) las 10 cards de Servicios se
apilan como un mazo con el scroll: abanico diagonal, cada card sube desde abajo a su lugar, un
isotipo 3D que gira mientras se espera la próxima. Referencia visual: la sección "Lenis brings the
heat" de lenis.darkroom.engineering. En mobile y con `prefers-reduced-motion` se mantiene la grilla
simple original (con descripción y CTA por servicio) — decisión de layout, no de "hay o no
movimiento": el mazo exige un recorrido de scroll que no tiene sentido imponerle a quien pidió menos
movimiento, aunque Lenis y el resto del sitio ignoren esa preferencia a propósito (`f8d4623`).

**Tres iteraciones sobre el mismo componente — vale la pena el registro completo, cada una con una
causa real, no estética:**

**1ª versión:** cada card con su propio `position: sticky` en un bloque de `40vh`. Se veía como pila
vertical con apenas un "canto" asomando, nunca el abanico. Causa: con `sticky` por card, cada una se
suelta al terminar su propio tramo de scroll y la siguiente la reemplaza en secuencia — nunca hay
más de una completamente visible a la vez, sin importar cuánto se agrandara el offset. Antes de
corregirla se navegó **lenis.darkroom.engineering con Playwright** (24 capturas) para verificar la
mecánica real en vez de asumirla.

**2ª versión:** un solo contenedor `sticky` para todo el mazo, cada card en absoluto adentro
animada por `transform` a un offset x/y permanente, deslizándose en diagonal desde la posición de
la anterior. Arregló el abanico, pero con las 10 cards (con descripción y botón propio) acumuladas
a la vez en un ancho de `Container` compartido con el isotipo, el resultado era una mancha de texto
ilegible en el centro del mazo — reportado con captura anotada. Verificado el diagnóstico con
**Playwright contra el propio `npm run dev`**: con `window.scrollTo()` crudo el resultado salía
inconsistente porque Lenis pelea con saltos de scroll que no pasan por su propio loop; con scroll
real (`mouse.wheel`, incremental) se confirmó que sí eran las 10 cards simultáneas, no un glitch de
captura.

**3ª versión (la actual), cuatro correcciones sobre la 2ª:**
- **Sin CTA por card.** Con 10 servicios de tiers distintos no tiene sentido un botón "Agenda tu
  sesión"/"Cotiza tu proyecto" repetido diez veces apuntando al mismo `#contacto` — uno solo,
  general, fijo junto al isotipo.
- **Cards angostas, solo índice + título** (`ServiceCard.tsx`, `layout="deck"`) — sin descripción.
  La cuenta real: `Container` (`max-w-6xl`) menos el isotipo deja ~730px a 1024px de viewport (el
  breakpoint más angosto donde el mazo se activa); repartir 10 párrafos ahí sin que se tapen no es
  posible. El detalle completo de cada servicio sigue en la grilla — el mazo es la pieza de
  impacto, no la ficha técnica.
- **Solo `SERVICES_DECK_VISIBLE_DEPTH` (3) cards visibles a la vez**, no las 10 acumuladas: una card
  desaparece del todo (no solo se atenúa) al quedar más de esa profundidad detrás de la activa. Es
  lo que resuelve la mancha ilegible de la 2ª versión — nunca hay más de 4 cards compitiendo por
  atención.
- **Entrada de abajo hacia arriba**, no diagonal desde la card anterior: `x` es fijo (el paso del
  abanico no se anima), `y` sube desde `restY + SERVICES_DECK_RISE_PX` hasta su reposo. La versión
  anterior deslizaba en diagonal y se leía como "cae de arriba", no como abanico.
- **Isotipo 3D real** (`AlienMark3D.tsx`, nuevo, factorizado de `HeroMark3D.tsx` sin tocar ese
  archivo — su historial de cuatro reescrituras por fallos silenciosos, ADR-12, hace que cualquier
  refactor ahí sea riesgo real). El chunk de `3dsvg` (~320 kB gzip) se pide una sola vez por
  *specifier*; una segunda instancia en Servicios reusa el chunk ya cacheado, no lo vuelve a
  descargar — verificado comparando el build antes/después (el chunk `dist-*.js` no cambió de
  tamaño). Gira de forma autónoma (`animate="spin"`, mismo criterio que el Hero) — 3dsvg no expone
  una forma de atar la rotación a un valor externo como el progreso de scroll.
- **Sección más corta y sin scroll muerto al final.** `SERVICES_DECK_BEAT_VH` bajó de 40 a 16 y
  `SERVICES_DECK_TAIL_VH` de 15 a 6 — con el tramo de espera (solo el isotipo girando) ocupando la
  mayor parte de cada beat, 40vh × 10 cards hacía la sección larguísima. Además, la ventana de
  entrada de la ÚLTIMA card ahora termina en progreso `1.0` exacto (antes terminaba en `0.9`,
  dejando un 10% del scroll fijado sin que pasara nada antes de soltar el pin) — mismo tipo de
  desajuste entre pin y contenido que tuvo el Hero (`879aef8`), aunque ahí el pin se soltaba antes
  de tiempo y acá era al revés: se sostenía de más.

**Piezas nuevas:**
- `src/shared/hooks/useMediaQuery.ts` — `useSyncExternalStore` sobre `matchMedia`, parametrizado
  por query, con `subscribe`/`getSnapshot` cacheados por query en un `Map` a nivel de módulo.
- `src/shared/components/ui/AlienMark3D.tsx` — isotipo 3D reutilizable (boundary + fallback plano +
  `Suspense`), usado acá y potencialmente en cualquier otro lugar que necesite el mismo giro.
- `src/shared/components/sections/ServiceCard.tsx` — `layout: "grid" | "deck"`; `"deck"` es índice +
  título únicamente, con `contentOpacity` animada solo sobre el título (el marco se queda nítido
  siempre).
- `src/shared/components/sections/ServiciosDeck.tsx` — el mazo: contenedor alto (pista de scroll)
  con un único hijo `sticky`; cada card en absoluto con `x` fijo y `y`/`scale`/`opacity` animados
  por `useTransform` sobre su propia ventana de entrada, más una segunda ventana de "desaparición"
  a `SERVICES_DECK_VISIBLE_DEPTH` cards de profundidad.
- `Section.tsx` (`4b1360d`) — `overflow-hidden` → `overflow-clip`: `hidden` crea un contenedor de
  scroll que anula cualquier `sticky` de adentro.

**Criterios verificados:** `npm run lint`, `npm test` (33/33) y `npm run build` limpios. Bundle
inicial: 159.87 kB gzip (línea base previa a ALS-043: 157.27 — sigue en ámbar contra el umbral verde
de 150 kB de `quality-gates.md` §2, no lo empeora de forma significativa; el chunk 3D no creció).
Verificado visualmente con Playwright contra `npm run dev` con scroll real (`mouse.wheel`, no
`scrollTo` crudo — Lenis lo pelea): abanico de hasta 4 cards simultáneas, entrada de abajo hacia
arriba, isotipo 3D real girando, altura de la sección Servicios bajó de 4232px a 1991px (-53%).

**Rugosidad menor observada, no bloqueante:** la entrada de la ÚLTIMA card puede quedar visualmente
ajustada contra el borde inferior de la sección justo cuando el pin se suelta — no es un corte
duro, pero no está tan pulido como el resto de las transiciones. Candidato a ajuste fino si al
verlo en navegador real molesta.

**Pendiente de QA manual real** (no verificable desde este entorno): recorrer el mazo completo con
`Tab` en un navegador real y confirmar que el anillo de foco de cada CTA no queda visualmente
tapado por la card de encima cuando el navegador no auto-scrollea al enfocar. Con el CTA único ya
fuera de las cards, esto se reduce a un solo botón (el general), pero sigue sin verificarse con
teclado real.

**Pendiente de QA visual manual** (no verificable desde este entorno): confirmar en navegador que
el abanico se ve bien a 1024px y 1440px, que la última card no se atenúa, que ninguna card deja ver
la de abajo, y recorrer el mazo completo con `Tab` confirmando que el anillo de foco de cada CTA no
queda visualmente tapado por la card de encima.

**4ª iteración (2026-08-24) — replanteo de estructura, no ajuste de constantes.** Las tres
iteraciones anteriores arreglaron bugs reales sobre una arquitectura que seguía sin parecerse a la
referencia (lenis.darkroom.engineering). Diagnóstico honesto de lo que estaba mal, confirmado
comparando capturas propias contra la referencia:

1. **La sección no medía un viewport, medía una pista de scroll `BEAT_VH * total + TAIL_VH`**
   (166vh, atada al conteo de servicios) con el pin sostenido mucho más de lo necesario y el
   contenido apenas ocupando una esquina — nunca llenaba la pantalla como el Hero.
2. **El heading de la sección ("Lo que se puede contratar") vivía en el header normal de
   `Section`**, contenido de flujo normal que scrollea y desaparece ANTES de que el pin del mazo
   siquiera se activara — el pin no se engancha hasta que su wrapper llega al tope del viewport,
   así que el heading ya se había ido para entonces.
3. **Bug real de solapamiento:** `restX = index * FAN_STEP_X_PX` usaba el índice ABSOLUTO (0-9), no
   la profundidad visible. La card "09 · Marketing" (índice 8) caía a `8 * 90 = 720px` del borde
   izquierdo — bien adentro de la columna del isotipo/CTA a la derecha del mazo. Con solo
   `SERVICES_DECK_VISIBLE_DEPTH` (3) cards visibles a la vez y las demás ya desvanecidas del todo,
   ese slot del abanico estaba libre para reusarse.

**Qué cambió (estructura, no números):**
- **Pin clonado del Hero, no reinventado.** `ServiciosDeck.tsx` ahora usa el mismo esqueleto que
  `Hero.tsx`: alto del wrapper = `calc(alturaMedidaDelSticky + RUNWAY_VH)` (`useMeasuredHeightPx`,
  no una pista atada al conteo de servicios), `useScroll` con offset `["start start",
  "${RUNWAY}vh start"]` (no `"end end"`), y el sticky interno en `min-h-[100svh] flex items-center`
  — el contenido llena una pantalla real, centrado, no un stack chico anclado con `top: Nrem`.
  `SERVICES_DECK_RUNWAY_VH` (160, fijo) reemplaza a `SERVICES_DECK_BEAT_VH` / `_TAIL_VH`:
  `entranceWindow` reparte el progreso 0→1 en fracciones iguales sin importar el conteo de
  servicios, así que desacoplar el runway del conteo solo cambia la velocidad de scroll por card,
  no el ritmo relativo entre ellas.
- **El heading vive DENTRO del sticky del mazo**, no en el header normal de `Section`. Nueva prop
  `ariaLabelledBy` en `Section.tsx` para cuando `title` no se le pasa porque el propio `children` lo
  renderiza — mantiene la sección etiquetada para a11y sin duplicar el heading visualmente.
  `Servicios.tsx` centraliza kicker/title/description en constantes de módulo y se los pasa a
  `ServiciosDeck` en modo mazo, o a `Section` en modo grilla (sin cambios ahí).
- **Fix del solapamiento: offset del abanico por profundidad visible, no por índice absoluto.**
  `fanSlot = index % (SERVICES_DECK_VISIBLE_DEPTH + 1)` — como una card ya desapareció del todo
  pasada esa profundidad, su slot queda libre para la siguiente. El abanico nunca ocupa más que
  `VISIBLE_DEPTH` pasos de ancho sin importar el índice, verificado con Playwright en 1024px y
  1440px: la card "09 · Marketing" y la "10 · Construcción de estudios" nunca invaden la columna
  del isotipo/CTA.
- Tamaños subidos con criterio (no ajuste fino a ciegas): `CARD_WIDTH_PX` 300→320, isotipo
  `h-36 w-36`→`h-48 w-48`, `FAN_STEP_X_PX` 90→110, `FAN_STEP_Y_PX` 20→26, `RISE_PX` 64→72 — el mazo
  usa más del ancho/alto real disponible dentro de `Container`, verificado que sigue entrando a
  1024px (~960px de ancho interior) sin desbordar.
- **Fix menor de borde:** la card 0 usaba una ventana de entrada `[0, 0.0001]` que en progreso
  EXACTO 0 (el primer frame del pin, antes de cualquier scroll) mapeaba al extremo inferior del
  rango → opacidad 0, invisible. Cambiado a `[-0.0001, 0]` así progreso 0 ya cae en el extremo
  superior (opacidad 1) — la card 0 se ve desde el primer frame, sin depender de un scroll mínimo.

**Verificado con Playwright contra `npm run dev` (scroll real, `mouse.wheel`) antes de dar el
ticket por resuelto** — no solo los gates automatizados:
- El heading se mantiene fijo en pantalla durante todo el pin: medido con
  `getBoundingClientRect().top` del `<h2>` en cada tick de scroll, se mantuvo en el mismo píxel
  (217.97) durante ~1200px de scroll (el tramo "stuck" real), con una transición de entrada/salida
  breve a cada lado — mismo comportamiento que el Hero.
- Sin solapamiento del CTA con ninguna card, en 1024px y 1440px, en todo el recorrido del mazo.
- La última card ("10 · Construcción de estudios") termina su entrada justo cuando el pin suelta —
  sin tramo de scroll muerto antes de pasar a Portfolio.

**Criterios verificados:** `npm run lint`, `npm test` (33/33) y `npm run build` limpios. Bundle:
160.30 kB gzip (sin cambio relevante respecto a la 3ª iteración, 159.87 kB — sigue en ámbar contra
el umbral verde de 150 kB, no lo empeora).

**Honestidad sobre lo que sigue sin verificarse** (no verificable desde este entorno): QA con
teclado real (`Tab` por el CTA único, confirmar que el foco no se tape visualmente) y una revisión
en navegador real a anchos intermedios entre 1024 y 1440px. La comparación visual contra la
referencia fue por captura de Playwright, no por ojo humano en el sitio real — si al verlo en
navegador algo sigue sin convencer (tamaño relativo del isotipo, ritmo del scroll), es candidato a
una 5ª iteración, no algo que este registro deba maquillar como "perfecto".

**5ª iteración (2026-08-24) — el usuario mandó captura de la referencia real y marcó que la 4ª
seguía sin parecerse.** Comparando directamente contra la captura de
lenis.darkroom.engineering ("LENIS BRINGS THE HEAT"), tres cosas de la 4ª versión estaban mal, no
solo desajustadas:

1. **Sin rotación.** La 4ª versión solo animaba `x`/`y` — la referencia tira cada card con un
   ángulo levemente distinto, es gran parte de por qué se lee como un abanico de cartas real.
2. **Cascada al revés.** La 4ª versión reusaba un slot fijo por `index % slots`: la card recién
   entrada "saltaba" a offset 0 mientras las viejas quedaban con más offset — invertido respecto a
   la referencia, donde la card MÁS RECIENTE es la que más se desplazó (y la que queda al frente),
   y las viejas apenas se movieron de la esquina de anclaje.
3. **Contenido atenuado.** La 4ª versión bajaba la opacidad del título de toda card tapada
   (`SERVICES_DECK_CONTENT_OPACITY_MIN`) — se leía como cards "muertas". La referencia muestra las
   cards de atrás NÍTIDAS, solo recortadas físicamente por la de encima.
4. El isotipo vivía en su propia columna a la derecha, desconectado de las cards — la referencia
   tiene la mano DIRECTAMENTE superpuesta al abanico.

**Qué cambió (reescritura del mecanismo de cascada, no ajuste de números):**
- `ServiciosDeck.tsx`: cada card ahora viaja por una cascada real de `x`/`y`/`rotate` construida
  con `cascadeBreakpoints` — arranca en el paso 0 (offset 0, sin rotación, exactamente en la
  esquina de anclaje `right-0 bottom-0` del mazo) y retrocede un paso completo cada vez que la
  SIGUIENTE card entra, hasta desvanecerse tras agotar `SERVICES_DECK_VISIBLE_DEPTH` pasos. Los
  tres motion values comparten los mismos breakpoints (`entranceWindow` de cada card siguiente) y
  solo cambian de signo/magnitud por parámetro.
- `ServiceCard.tsx` (variante `deck`): se sacó `contentOpacity` — ninguna card tapada se atenúa,
  el índice pasó a ser un número grande (`text-5xl`, color acento) al estilo "01/02" de la
  referencia, con el título abajo (`justify-between`, la card ahora tiene alto real propio,
  `SERVICES_DECK_CARD_HEIGHT_PX`, no solo lo que ocupe el contenido).
- El isotipo 3D pasó a vivir DENTRO del mismo contenedor relativo que las cards, superpuesto en la
  esquina donde cae la card recién entrada (`z-index` por encima de todas). El CTA general se movió
  al flujo normal debajo de la descripción del heading — ya no flota en una columna aparte junto al
  isotipo (esa desconexión visual era parte de la queja).
- **Bug real encontrado y corregido en el camino:** `AlienMark3D` antepone `"relative"` a su propio
  `className` (lo necesita para el `absolute` interno de su boundary/fallback), y `cn()` en este
  proyecto es un join simple sin dedupe tipo tailwind-merge — pasarle clases de posicionamiento
  (`absolute -right-8 -bottom-10 ...`) directo a `AlienMark3D` perdía contra ese `"relative"` (orden
  del stylesheet de Tailwind, no del string de clases) y el isotipo terminaba en flujo normal,
  lejos de donde debía superponerse. Fix: el posicionamiento va en un `<div>` wrapper alrededor de
  `<AlienMark3D>`, nunca en clases pasadas directo al componente.
- Presupuesto vertical reajustado con números reales medidos (no a ojo): el heading pasó a tamaños
  fijos (`text-4xl`, sin las variantes `sm:`/`md:` que nunca aplican porque el mazo solo se monta
  ≥1024px) y `SERVICES_DECK_CARD_HEIGHT_PX` bajó de 380 a 340 — un primer intento con 380 dejaba la
  card de más atrás recortada contra el borde inferior en una ventana de 900px de alto, confirmado
  midiendo `getBoundingClientRect()` de la card real con Playwright, no estimando.

**Verificado con Playwright contra `npm run dev` (scroll real) en 1024px y 1440px, antes de dar el
ticket por resuelto:** cascada con rotación visible y creciente hacia atrás, card recién entrada
nítida y al frente sin atenuación, isotipo correctamente superpuesto a la esquina del abanico
(confirmado con `getBoundingClientRect()`, no solo la captura), CTA en flujo normal sin
solapamiento, última card ("10 · Construcción de estudios") termina justo cuando el pin suelta,
grilla mobile sin regresión (capturada en 390px, sin preloader de por medio).

**Criterios verificados:** `npm run lint`, `npm test` (33/33) y `npm run build` limpios. Bundle:
160.39 kB gzip (sin cambio relevante).

**Honestidad sobre lo que sigue sin verificarse:** igual que la 4ª — QA con teclado real y anchos
intermedios en navegador real, no solo capturas. La comparación con la referencia se hizo por
capturas propias contra la imagen que mandó el usuario, no lado a lado en el mismo visor — sigue
habiendo margen de que el ritmo del scroll o la intensidad de la rotación no convenzan al verlo en
vivo, y en ese caso es una 6ª iteración de ajuste fino sobre una arquitectura que ahora sí coincide
con la de la referencia, no otro replanteo estructural.

---

## Épica J — Medición

### ALS-023 — Analítica de conversión con Google Analytics 4 *(sale de diferidos, alcance redefinido 2026-08-24)*

- Prioridad: **P1** · Esfuerzo: M · Estado: Propuesto — se activa después de ALS-022
- HU-ANL-001 · CU-ANL-001 · RF-ANL-001, RNF-ANL-001
- Decisión de herramienta cerrada: [ADR-15](./architecture.md#adr-15--analítica-de-conversión-con-ga4-estándar-supersede-la-restricción-de-als-023-2026-08-24)

Estuvo diferido con un buen argumento: instrumentar sin tráfico es medir ruido. **Ese argumento
vence el día que el sitio se publique.**

Qué medir: visitas → clics por CTA (distinguiendo "Agenda tu sesión" de "Cotiza tu proyecto", por
`tier`) → envíos válidos del formulario → aperturas de WhatsApp (incluyendo el caso ALS-018, popup
bloqueado — es dato de embudo roto por el navegador, no ruido a descartar).

**Restricción original superada por ADR-15 (2026-08-24).** La versión anterior de este ticket
exigía "sin cookies, sin banner de consentimiento" — correcto para una landing sin objetivo de
marketing medible explícito, que dejó de ser el caso: este es un sitio de marketing y necesita
atribución de conversión confiable, no una aproximación. La decisión ahora es **GA4 estándar
(cookies de primera parte) + un aviso de cookies mínimo, no bloqueante** (franja/toast con opción
de rechazar, nunca un modal que tape el CTA). Ver ADR-15 para las alternativas descartadas
(cookieless, Consent Mode denegado por defecto) y por qué.

**Verificación pendiente antes de tráfico sostenido:** estado final de la Ley 21.719 (protección
de datos, Chile) — puede exigir más que un aviso mínimo según cómo entre en régimen durante 2026.
No bloquea implementar, sí bloquea darlo por "cerrado y listo para siempre".

**Reglas de implementación:** cero PII (nombre, teléfono, contenido de `message` nunca viajan a
GA4); el evento se dispara desde `useBookingForm`, no desde `Contacto.tsx` (el componente nunca
orquesta); medir el peso que agrega el script de GA4 con la skill `lighthouse-audit` antes de
cerrar — el bundle inicial ya está en amarillo (`quality-gates.md` §2). Guía completa de
implementación: skill `analitica-conversion`.

**Además desbloquea decisiones que hoy están trabadas:** ALS-024 (si el JS extra se justifica) y
ALS-041 (si el preloader mejora o empeora la conversión).

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
| ALS-022 | F     | P0     | S        | Pendiente                          | ALS-019, ALS-020                 |
| ALS-023 | J     | **P1** | M        | Propuesto — herramienta cerrada (ADR-15) | ALS-022 (tráfico real)     |
| ALS-024 | —     | —      | —        | Diferido                           | ALS-019                          |
| ALS-025 | —     | —      | —        | Diferido                           | —                                |
| ALS-026 | G     | **P1** | M        | Pendiente — sin código todavía     | Cuenta AWS + Artist ID + ALS-031 |
| ALS-027 | G     | P2     | M        | Pendiente                          | ALS-026 desplegado               |
| ALS-028 | G     | P2     | L        | ✅ Hecho                           | Asset definitivo: ALS-006        |
| ALS-029 | G     | P2     | S        | ✅ Hecho                           | —                                |
| ALS-030 | A     | P2     | S        | Pendiente                          | Productor (cuenta Business)      |
| ALS-031 | G     | P2     | M        | Pendiente                          | Cuenta AWS del Productor         |
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
| ALS-026 | G | **P1** | M | Catálogo real desde Spotify | Cuenta AWS + Artist ID |
| ALS-027 | G | P2 | M | Catálogo desde YouTube | ALS-026 |
| ALS-031 | G | P2 | M | Infraestructura AWS (IaC) | Cuenta AWS |
| ALS-037 | I | P2 | S | Fotos reales del estudio | ALS-006 (fotos) |
| ALS-038 | I | P3 | M | Waveform reactivo en el Hero | — |
| ALS-039 | I | P3 | M | Transición entre secciones | — |
| ALS-040 | I | P3 | S | Indicador de progreso de scroll | — |
| ALS-042 | I | P3 | S | Cursor personalizado | — |
| ALS-023 | J | **P1** | M | Analítica de conversión (GA4, ADR-15) | ALS-022 (tráfico real) |
| ALS-044 | G | P2 | M | Sección Discografía (catálogo Spotify en vivo) | ALS-026 |
| ALS-045 | G | P3 | M | Sección Video (catálogo YouTube en vivo) | ALS-027, ALS-044 |

**Orden recomendado, si hay que elegir:**

1. **ALS-036** — el mejor impacto por esfuerzo de todo el backlog: un campo, una validación y una
   línea en el builder del mensaje.
2. **ALS-018** — cierra el único punto del embudo donde una falla es invisible y total.
3. **ALS-033** — la mejora de más impacto en términos absolutos. El código es lo fácil; conseguir
   los pares de audio autorizados y con niveles emparejados es lo que la hace pesada.
4. **ALS-023** — apenas haya tráfico, ahora **P1**: sin esto, ALS-024 y ALS-041 no tienen forma de
   resolverse con datos.
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

1. Todo bug o mejora que aparezca se agrega con ID `ALS` correlativo, en la épica que corresponda.
2. Ningún ticket P0/P1 se cierra sin su criterio verificado de verdad — no "debería andar".
3. Este documento se actualiza en el mismo commit que cierra el ticket, no después.
4. El detalle de **cómo** se implementó vive en el código y en los commits, no en prosa duplicada
   acá.
