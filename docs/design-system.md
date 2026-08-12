# Sistema de diseño — ALIENSKILEZ web

Fecha: 2026-08-12
Estado: implementado.
Fuente de verdad en código: [`src/styles/index.css`](../src/styles/index.css), bloque `@theme`.

Este documento explica **por qué** cada token es lo que es. Los valores mismos no se copian a
mano en ningún otro lado — ver ADR-7 en [`architecture.md`](./architecture.md).

## 1. Dirección visual

Oscura, urbana, alienígena. La premisa del copy —*"no es una sala con micrófonos, es una nave"*—
tiene que sostenerse visualmente sin caer en decoración gratuita: negro como vacío del espacio,
un solo verde neón como señal, y detalles gráficos que sugieren instrumental técnico (líneas HUD,
brackets de esquina, kickers tipo log de sistema) en vez de ilustraciones sci-fi literales.

Regla que se desprende: **el acento es señal, no decoración.** Si todo brilla, nada destaca — y
lo que tiene que destacar es el CTA.

## 2. Paleta y contrastes

Paleta entregada por el cliente, usada sin reinterpretar.

| Token | Valor | Uso |
|---|---|---|
| `--color-background` | `#000000` | Fondo base |
| `--color-surface` | `#253900` | Verde oliva oscuro (reservado; hoy solo en overlays al 25%) |
| `--color-surface-alt` | `#0d1400` | Superficie de secciones alternas, cards, footer |
| `--color-text` | `#EEEEEE` | Texto principal (nunca blanco puro: más suave sobre negro) |
| `--color-text-muted` | `#A8B39A` | Texto secundario, mezclado hacia el oliva |
| `--color-accent` | `#08CB00` | CTA, kickers, bordes activos, iconos |
| `--color-accent-glow` | `rgb(8 203 0 / .35)` | `box-shadow`/`text-shadow` del efecto neón |
| `--color-border` | `rgb(238 238 238 / .12)` | Bordes y separadores |
| `--color-border-accent` | `rgb(8 203 0 / .4)` | Bordes en hover/foco |

### Contrastes calculados (WCAG 2.1)

Calculados con la fórmula de luminancia relativa, **no estimados a ojo**. Reproducible con el
script de [`quality-gates.md`](./quality-gates.md) §5.

| Combinación | Ratio | Nivel | Veredicto |
|---|---|---|---|
| `#EEEEEE` sobre `#000000` | **18.10** | AAA | Texto de cuerpo ✅ |
| `#EEEEEE` sobre `#0d1400` | **16.20** | AAA | Texto sobre cards ✅ |
| `#EEEEEE` sobre `#253900` | **10.88** | AAA | ✅ |
| `#A8B39A` sobre `#000000` | **9.58** | AAA | Texto secundario ✅ |
| `#08CB00` sobre `#000000` | **9.55** | AAA | Titulares, kickers, iconos ✅ |
| `#000000` sobre `#08CB00` | **9.55** | AAA | **Botones de acento** ✅ |
| `#A8B39A` sobre `#0d1400` | **8.57** | AAA | ✅ |
| `#08CB00` sobre `#0d1400` | **8.55** | AAA | ✅ |
| `#08CB00` sobre `#253900` | **5.74** | AA | ⚠️ No usar en texto chico |
| `#EEEEEE` sobre `#08CB00` | **1.89** | — | ❌ **Reprueba. Prohibido.** |

### Las dos reglas que salen de esa tabla

1. **Los botones con fondo de acento llevan texto negro.** Es la única combinación que funciona:
   gris claro sobre el verde da 1.89:1, ilegible. Implementado en la variante `primary` de
   `ui/Button.tsx`.
2. **El acento sobre `--color-surface` (`#253900`) es AA, no AAA.** Sirve para titulares, bordes e
   iconos, pero no para texto de cuerpo chico. Es la combinación más ajustada de la paleta y la
   única que hay que verificar de nuevo si alguien la usa en un contexto nuevo.

## 3. Tipografía

| Rol | Fuente | Por qué |
|---|---|---|
| Titulares | **Space Grotesk** (500/600/700) | Geométrica con carácter técnico; el nombre calza con la identidad y la forma también |
| Cuerpo | **Inter** (400/500/600) | Neutra y muy legible en tamaños chicos sobre fondo oscuro |
| Kickers y datos | `ui-monospace` → `JetBrains Mono` → `Consolas` | Estética de "log de sistema" sin pagar el peso de otra webfont |

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

| Clase | Qué es | Nota |
|---|---|---|
| `.starfield` | Campo de estrellas con `radial-gradient` repetido | 8 puntos en un tile de 420px; peso cero |
| `.hud-grid` | Retícula fina de 64px | Dos `linear-gradient` al 5% de opacidad |
| `.hud-frame` | Brackets `⌐ ¬` en esquinas opuestas | Aparecen en `:hover` y en `:focus-within` — importante: la card responde también a teclado, no solo a mouse |
| Glow de acento | `box-shadow` con `--color-accent-glow` | Solo en CTA y bordes activos |

Todos son decorativos y van con `aria-hidden="true"` cuando son elementos propios.

**Regla:** un motivo nuevo tiene que costar cerca de cero en runtime. Si necesita JavaScript o una
imagen, hay que justificar por qué no alcanza con CSS.

## 6. Movimiento

- Scroll-reveal con Framer Motion: `opacity 0→1`, `y 24→0`, 0.5s `easeOut`, `once: true`.
- Escalonado por índice (`delay: index * 0.05–0.08`), **acotado** — en la grilla de 10 servicios
  el delay se limita con `Math.min(index, 5)` para que la última card no tarde medio segundo de
  más en aparecer.
- Hover: transiciones de 200ms sobre `background-color`, `box-shadow`, `border-color`, `color`.
  Nunca sobre `all`.

### `prefers-reduced-motion` — doble red

1. `<MotionConfig reducedMotion="user">` en `App.tsx` desactiva las animaciones de Framer Motion.
2. Un bloque `@media (prefers-reduced-motion: reduce)` en `index.css` anula además animaciones y
   transiciones CSS, y apaga el `scroll-behavior: smooth`.

Hacen falta las dos: la primera no cubre el glow ni el smooth scroll, que son CSS puro.

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
