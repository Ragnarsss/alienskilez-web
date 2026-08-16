# Sistema de diseño — ALIENSKILEZ web

Fecha: 2026-08-12
Estado: implementado.
Fuente de verdad en código: [`src/styles/index.css`](../src/styles/index.css), bloque `@theme`.

Este documento explica **por qué** cada token es lo que es. Los valores mismos no se copian a
mano en ningún otro lado — ver ADR-7 en [`architecture.md`](./architecture.md).

## 1. Dirección visual

Oscura, urbana, alienígena. La premisa del copy —_"no es una sala con micrófonos, es una nave"_—
tiene que sostenerse visualmente sin caer en decoración gratuita: negro como vacío del espacio,
un solo verde neón como señal, y detalles gráficos que sugieren instrumental técnico (líneas HUD,
brackets de esquina, kickers tipo log de sistema) en vez de ilustraciones sci-fi literales.

Regla que se desprende: **el acento es señal, no decoración.** Si todo brilla, nada destaca — y
lo que tiene que destacar es el CTA.

## 2. Paleta y contrastes

Paleta entregada por el cliente, usada sin reinterpretar.

| Token                   | Valor                    | Uso                                                         |
| ----------------------- | ------------------------ | ----------------------------------------------------------- |
| `--color-background`    | `#000000`                | Fondo base                                                  |
| `--color-surface`       | `#253900`                | Verde oliva oscuro (reservado; hoy solo en overlays al 25%) |
| `--color-surface-alt`   | `#0d1400`                | Superficie de secciones alternas, cards, footer             |
| `--color-text`          | `#EEEEEE`                | Texto principal (nunca blanco puro: más suave sobre negro)  |
| `--color-text-muted`    | `#A8B39A`                | Texto secundario, mezclado hacia el oliva                   |
| `--color-accent`        | `#08CB00`                | CTA, kickers, bordes activos, iconos                        |
| `--color-accent-glow`   | `rgb(8 203 0 / .35)`     | `box-shadow`/`text-shadow` del efecto neón                  |
| `--color-border`        | `rgb(238 238 238 / .12)` | Bordes y separadores                                        |
| `--color-border-accent` | `rgb(8 203 0 / .4)`      | Bordes en hover/foco                                        |

### Contrastes calculados (WCAG 2.1)

Calculados con la fórmula de luminancia relativa, **no estimados a ojo**. Reproducible con el
script de [`quality-gates.md`](./quality-gates.md) §5.

| Combinación               | Ratio     | Nivel | Veredicto                     |
| ------------------------- | --------- | ----- | ----------------------------- |
| `#EEEEEE` sobre `#000000` | **18.10** | AAA   | Texto de cuerpo ✅            |
| `#EEEEEE` sobre `#0d1400` | **16.20** | AAA   | Texto sobre cards ✅          |
| `#EEEEEE` sobre `#253900` | **10.88** | AAA   | ✅                            |
| `#A8B39A` sobre `#000000` | **9.58**  | AAA   | Texto secundario ✅           |
| `#08CB00` sobre `#000000` | **9.55**  | AAA   | Titulares, kickers, iconos ✅ |
| `#000000` sobre `#08CB00` | **9.55**  | AAA   | **Botones de acento** ✅      |
| `#A8B39A` sobre `#0d1400` | **8.57**  | AAA   | ✅                            |
| `#08CB00` sobre `#0d1400` | **8.55**  | AAA   | ✅                            |
| `#08CB00` sobre `#253900` | **5.74**  | AA    | ⚠️ No usar en texto chico     |
| `#EEEEEE` sobre `#08CB00` | **1.89**  | —     | ❌ **Reprueba. Prohibido.**   |

### Las dos reglas que salen de esa tabla

1. **Los botones con fondo de acento llevan texto negro.** Es la única combinación que funciona:
   gris claro sobre el verde da 1.89:1, ilegible. Implementado en la variante `primary` de
   `ui/Button.tsx`.
2. **El acento sobre `--color-surface` (`#253900`) es AA, no AAA.** Sirve para titulares, bordes e
   iconos, pero no para texto de cuerpo chico. Es la combinación más ajustada de la paleta y la
   única que hay que verificar de nuevo si alguien la usa en un contexto nuevo.

## 3. Tipografía

| Rol             | Fuente                                         | Por qué                                                                              |
| --------------- | ---------------------------------------------- | ------------------------------------------------------------------------------------ |
| Titulares       | **Space Grotesk** (500/600/700)                | Geométrica con carácter técnico; el nombre calza con la identidad y la forma también |
| Cuerpo          | **Inter** (400/500/600)                        | Neutra y muy legible en tamaños chicos sobre fondo oscuro                            |
| Kickers y datos | `ui-monospace` → `JetBrains Mono` → `Consolas` | Estética de "log de sistema" sin pagar el peso de otra webfont                       |

Ambas webfonts se cargan explícitamente desde Google Fonts en `index.html`, con `preconnect` y
`display=swap`. La monoespaciada usa la pila del sistema a propósito: el mood se consigue con
`text-transform: uppercase` + `letter-spacing: .22em`, no con una fuente específica, y así el
sitio no carga un tercer archivo por un detalle decorativo.

**Kickers.** Etiqueta de sección tipo `01 · SERVICIOS`. El número va en `aria-hidden` con un
`<span class="sr-only">Sección 01:</span>` al lado — un lector de pantalla que anuncia "cero uno
punto servicios" no comunica nada.

## 4. Forma y espaciado

- **Radios chicos y duros.** `--radius-sm: 0.125rem`, `--radius-md: 0.375rem`. Nada de esquinas
  muy redondeadas: la identidad es instrumental técnico, no SaaS amigable.
- **Espaciado de sección:** `--spacing-section: clamp(4rem, 10vw, 8rem)`, expuesto como
  `py-section`. Fluido — no hay que definir el ritmo vertical breakpoint por breakpoint.
- **Grillas con `gap-px` sobre fondo `bg-border`.** Las cards se separan con una línea de 1px
  real en vez de bordes por card, lo que evita bordes dobles entre celdas adyacentes.

## 5. Motivos gráficos

Cuatro recursos, todos en CSS puro (sin canvas, sin JS, sin imágenes), definidos en
`@layer components` de `index.css`:

| Clase                           | Qué es                                                                  | Nota                                                                                                        |
| ------------------------------- | ----------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| `.starfield` / `.starfield-mid` | Dos campos de estrellas con `radial-gradient` repetido, tiles distintos | Capas de profundidad del cielo del Hero (paralaje en `HeroSkyScene.tsx`); peso cero                         |
| `.hud-grid`                     | Retícula fina de 64px                                                   | Dos `linear-gradient` al 5% de opacidad                                                                     |
| `.hud-frame`                    | Brackets `⌐ ¬` en esquinas opuestas                                     | Aparecen en `:hover` y en `:focus-within` — importante: la card responde también a teclado, no solo a mouse |
| Glow de acento                  | `box-shadow` con `--color-accent-glow`                                  | En CTA (con `.cta-breathe`, ver §6) y bordes activos                                                        |

Todos son decorativos y van con `aria-hidden="true"` cuando son elementos propios.

**Regla:** un motivo nuevo tiene que costar cerca de cero en runtime. Si necesita JavaScript o una
imagen, hay que justificar por qué no alcanza con CSS.

### 5.1 "Signal Geometry" — figuras planas de fondo por sección

`shared/components/ui/GeometricAccent.tsx` define tres variantes (`shards`, `chevrons`, `hex`):
polígonos SVG planos (sin 3D), trazados solo con `stroke`, usando exclusivamente
`--color-border`/`--color-border-accent` — cero colores nuevos. `Section` las recibe con la prop
`geometry` y las posiciona alternadas (esquina superior derecha / inferior izquierda) según la
sección sea de índice par o impar.

Nacen de una referencia externa (geometría angular marcada, cortes diagonales) tomada **solo como
inspiración de estilo** — la paleta y el layout de esa referencia no se copian; las formas son
originales y usan únicamente los tokens ya definidos en este documento.

### 5.2 Hero: cielo nocturno y nave

`HeroSkyScene.tsx` (grid + dos capas de estrellas + un planeta) y `HeroShip.tsx` (silueta de nave
que cruza el Hero de punta a punta) son capas de fondo detrás del isotipo interactivo
(`HeroMark3D.tsx`, que no cambia). Todo plano — el 3D real queda reservado exclusivamente al
isotipo, que sigue siendo la única pieza `transform-style: preserve-3d` del sitio (ADR-12). El
paralaje de ambos componentes está ligado al progreso de scroll del propio Hero (`useScroll` con
`target` acotado a la sección), no al scroll de toda la página.

## 6. Movimiento

- Scroll suave global vía **Lenis** (`shared/hooks/useLenis.ts`), con `lerp` continuo (suavizado
  por frame, se adapta solo a la distancia scrolleada) en vez de un tween a `duration` fija.
  Constante en `LIMITS.LENIS_LERP`.
- Scroll-reveal con Framer Motion: `opacity 0→1`, `y 24→0`, 0.5s `easeOut`, `once: true`
  (`LIMITS.REVEAL_DURATION_S`). La variante `scaleOnView` de `Reveal` suma `scale 0.97→1` — pensada
  para cards de grilla, no para listas de texto (por eso Faq no la usa).
- Escalonado por índice, unificado en `LIMITS.REVEAL_STAGGER_STEP_S` /
  `LIMITS.REVEAL_STAGGER_MAX_INDEX` — antes cada sección tenía su propio paso de delay (0.05 a
  0.08) sin razón para diferir; ahora es un solo valor.
- Márgenes de viewport unificados: `LIMITS.REVEAL_VIEWPORT_MARGIN_HEADER` (headers de sección,
  dispara más temprano) y `LIMITS.REVEAL_VIEWPORT_MARGIN_CARD` (cards individuales).
- Hover: transiciones de 200ms sobre `background-color`, `box-shadow`, `border-color`, `color`.
  Nunca sobre `all`.
- CTA primario: `.cta-breathe` — glow que respira en un ciclo de 2.6s, se pausa en `:hover`/
  `:focus-visible` para que la transición de hover normal tome el control sin pelear por la misma
  propiedad.
- Storytelling con SVG: en Portfolio, la traza de la timeline avanza con `scaleY` ligado al
  progreso de scroll de la lista (`useScroll`); en Proceso, una barra de progreso se dibuja
  (`scaleX 0→1`) al entrar en viewport. Ninguno depende de medir posiciones de cards en un grid
  responsive — ese enfoque es fácil de romper entre breakpoints.
- Conversión: `Alcance.tsx` cuenta 0→valor con `useMotionValue`/`animate()` solo cuando la métrica
  ya dejó de ser el placeholder `[XX]` (ADR-6) — con datos pendientes, el comportamiento visual es
  idéntico al de antes de esta fase.

### `prefers-reduced-motion` — triple red

1. `<MotionConfig reducedMotion="user">` en `App.tsx` desactiva las animaciones declarativas de
   Framer Motion (`initial`/`animate`/`whileInView`) — cubre `Reveal`, el header de `Section` y la
   barra de progreso de Proceso automáticamente, sin código adicional.
2. Un bloque `@media (prefers-reduced-motion: reduce)` en `index.css` anula además animaciones y
   transiciones CSS, apaga `scroll-behavior: smooth` y neutraliza `.cta-breathe`.
3. **Animaciones imperativas** (`useTransform`/`useScroll`/`animate()` fuera de las props
   declarativas de Framer) no las cubre `MotionConfig` — cada una chequea `useReducedMotion()` a
   mano: el paralaje y la nave del Hero quedan en una posición de reposo, la traza de Portfolio
   queda completamente llena, y el contador de Alcance salta directo al valor final sin animar.

Hacen falta las tres — la primera no cubre el glow ni el smooth scroll (CSS puro), y ninguna de
las dos primeras cubre el motion imperativo del punto 3.

## 7. Cómo extender el sistema

1. **Color nuevo** → token en `@theme`, nunca clase arbitraria. Calcular su contraste contra
   `#000000` y `#0d1400` antes de usarlo (§5 de `quality-gates.md`).
2. **Componente nuevo de UI** → en `shared/components/ui/`, con la misma API `variant`/`size` que
   los existentes.
3. **Sección nueva** → archivo propio en `shared/components/sections/`, usando `<Section>` para
   heredar el kicker, el espaciado y el scroll-reveal; una línea en `App.tsx`; su id en
   `SECTION_IDS`.
4. **Fuente nueva** → hay que justificarla. Hoy son dos webfonts y una pila del sistema; una
   tercera webfont tiene que ganarse su costo en LCP.

## 8. Documentos relacionados

- [`architecture.md`](./architecture.md) — ADR-7 (tokens en CSS) y ADR-10 (contraste de botones).
- [`quality-gates.md`](./quality-gates.md) — cómo verificar contraste, responsive y movimiento.
- [`engineering-guidelines.md`](./engineering-guidelines.md) — reglas de Tailwind y accesibilidad.
