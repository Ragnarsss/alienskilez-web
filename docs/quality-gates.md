# Puertas de calidad — ALIENSKILEZ web

Fecha: 2026-08-12
Estado: activo.
Alcance: qué se verifica antes de desplegar, con qué umbral y con qué comando.

Criterios adaptados de las auditorías de `radarop-front` (`performance.md`, `responsivness.md`,
`ui-ux.md`), recortados y reescritos para este stack: sin MUI, sin React Query, sin router, y con
React Compiler activo — lo que **invalida** algunas de sus recomendaciones (ver §2).

## 1. Puerta automatizada (obligatoria, siempre)

```bash
npm run lint     # ESLint + reglas del React Compiler
npm test         # Vitest — 24 tests sobre schema y builder del mensaje
npm run build    # tsc -b (strict) + vite build
```

Los tres tienen que pasar antes de mergear a `main`. No hay CI que los imponga (decisión
consciente, ver `architecture.md` §7): los corre quien mergea.

## 2. Rendimiento

### Línea base medida (2026-08-12, tras ALS-028 en su versión CSS)

| Artefacto | Crudo | Gzip | Cuándo se descarga |
|---|---|---|---|
| `index.html` | 1.64 kB | 0.69 kB | Siempre |
| CSS | 35.66 kB | 7.51 kB | Siempre |
| **JS** | 499.97 kB | **157.60 kB** | Siempre |

**Un solo chunk.** Hubo brevemente un segundo chunk de 319.63 kB gzip (Three.js + fiber + drei)
para el isotipo 3D del Hero; se eliminó al resolver ese efecto con capas CSS (ADR-12). El total a
descargar pasó de ~477 kB a ~158 kB — un 67% menos, sin perder el efecto.

**Lectura honesta:** 157 kB gzip **excede el umbral verde de 150 kB**. Está en amarillo y es
consciente: lo explican React + React DOM, Framer Motion, Lenis, zod y react-hook-form. Framer
Motion es el candidato más gordo y el uso actual (scroll-reveal, paralaje, contadores) es
sustituible por IntersectionObserver + CSS si hiciera falta. No se toca hasta tener el Lighthouse
de ALS-019: optimizar sin medir es adivinar.

### Umbrales

| Métrica | Verde | Amarillo | Rojo |
|---|---|---|---|
| Performance (mobile) | ≥ 90 | 80-89 | < 80 |
| Accessibility | **≥ 95** | 90-94 | < 90 |
| Best Practices | ≥ 95 | 90-94 | < 90 |
| SEO | ≥ 95 | 90-94 | < 90 |
| LCP | ≤ 2.5s | 2.5-4s | > 4s |
| CLS | ≤ 0.1 | 0.1-0.25 | > 0.25 |
| INP | ≤ 200ms | 200-500ms | > 500ms |
| **JS inicial** (gzip, bloqueante) | ≤ 150 kB | 150-250 kB | > 250 kB |
| **JS diferido** (gzip, por chunk) | ≤ 200 kB | 200-350 kB | > 350 kB |

> **Por qué dos umbrales de JS y no uno.** Sumar todo el JavaScript en una sola cifra trata igual a
> lo que bloquea el primer render y a lo que se descarga después. Hoy no hay chunks diferidos, pero
> el umbral queda escrito: fue justamente lo que permitió ver que un chunk de 320 kB para un
> elemento decorativo no se justificaba, aunque técnicamente "no bloqueara nada".

> **INP, no FID.** FID quedó obsoleto como Core Web Vital en marzo de 2024; `performance.md` de
> radarop todavía lo lista. Acá se mide INP.

### Cómo medir

```bash
npm run build && npm run preview   # sirve dist/ en localhost:4173
npx lighthouse http://localhost:4173 --preset=desktop --view
npx lighthouse http://localhost:4173 --view          # mobile (por defecto)
```

Siempre contra `preview` (build de producción), **nunca contra `npm run dev`** — el servidor de
desarrollo no minifica y las métricas no significan nada.

### Optimizaciones ya aplicadas

- `preconnect` a Google Fonts + `display=swap`.
- Los `<iframe>` de portfolio llevan `loading="lazy"`, y no se renderizan si `embedUrl` está vacío.
- Fondos decorativos en CSS puro (starfield, grid HUD): cero peso de red, cero JS.
- Tailwind v4 emite solo las utilidades usadas.
- **El isotipo 3D del Hero no usa WebGL**: son capas SVG apiladas con `translateZ` (ADR-12), lo
  que ahorró 320 kB gzip frente a la versión con Three.js.
- El isotipo tiene tamaño fijo por breakpoint, así que no genera CLS al montar.

### Si hay que bajar el JS

En orden de relación beneficio/costo:
1. Reemplazar Framer Motion por animaciones CSS con `@starting-style` o IntersectionObserver +
   clases — el uso actual es scroll-reveal simple, no justifica la librería completa.
2. `React.lazy` para las secciones bajo el fold.
3. Revisar el peso de zod (v4 es más liviana que v3, pero sigue siendo el segundo bloque).

**No** aplicar `useMemo`/`useCallback` para "optimizar renders": está prohibido por el React
Compiler (`engineering-guidelines.md` §7) y no es el cuello de botella acá.

## 3. Responsive

Breakpoints de Tailwind por defecto (`sm:640`, `md:768`, `lg:1024`, `xl:1280`). No se redefinen:
no hubo un caso que lo pidiera.

### Checklist por versión

- [ ] **320px** (el ancho hostil real) — sin scroll horizontal en ninguna sección.
- [ ] 375px / 390px — móvil típico.
- [ ] 768px — el menú hamburguesa cede al navbar completo en `md`.
- [ ] 1024px y 1440px — el contenido queda contenido por `max-w-6xl`, no estirado.

### Reglas
- Nada de anchos fijos en px para contenedores. Grillas con `grid-cols` responsivas.
- Tipografía escalada con variantes (`text-4xl sm:text-6xl md:text-7xl`) o `clamp()`.
- Área táctil mínima **44×44px** en todo control interactivo. El botón del menú móvil es `h-10 w-10`
  (40px) — al límite; si se toca ese componente, subirlo.
- El `<select>` y los `<input>` a 16px como mínimo: por debajo, iOS Safari hace zoom automático al
  enfocar. Hoy usan `text-base` (16px) — no bajarlo.
- Contenido ancho (embeds, tablas si aparecen) dentro de un contenedor con `overflow-x-auto`.

## 4. UX y coherencia visual

Destilado de `ui-ux.md`, aplicado a una landing de conversión.

### Jerarquía y CTA (P0)
- [ ] Hay exactamente **un** `<h1>`, y está en el Hero.
- [ ] El CTA primario destaca del secundario por color de fondo, no solo por posición.
- [ ] Desde cualquier punto de la página, el CTA está a un clic (navbar sticky).
- [ ] Ninguna sección compite visualmente con el formulario final.

### Feedback e interacción (P0)
- [ ] Todo elemento clicable tiene estado `:hover` **y** `:focus-visible` distinguibles.
- [ ] El anillo de foco es visible sobre fondo negro y **no** queda reemplazado por el glow
      decorativo — es el error clásico de este diseño.
- [ ] Los errores del formulario aparecen junto al campo, con `role="alert"`.
- [ ] Los `.hud-frame` responden a `:focus-within`, no solo a `:hover` (equivalencia teclado/mouse).

### Microinteracciones (P1)
- [ ] Transiciones entre 150 y 300ms. Nada más lento (se siente pesado) ni instantáneo.
- [ ] Curva de easing coherente en todo el sitio (`easeOut` en reveals, `ease` en hovers).
- [ ] Ninguna transición sobre `all` — solo las propiedades que cambian.

### Coherencia (P1)
- [ ] Ningún color literal en componentes: todo vía tokens (`design-system.md`).
- [ ] Radios consistentes: `rounded-sm` en controles y cards.
- [ ] Los primitivos de `ui/` mantienen la misma API `variant`/`size`.

### Estados de contenido pendiente (P1, específico de este proyecto)
- [ ] Ninguna sección con `pending: true` se ve **rota** — se ve *pendiente*, que es distinto.
- [ ] Ningún `<iframe>` con `src` vacío.
- [ ] Ningún enlace con `href=""`.

## 5. Accesibilidad — objetivo WCAG 2.1 AA

### Verificación de contraste (reproducible)

Antes de introducir cualquier color o combinación nueva:

```bash
node -e "
const lin = c => { c/=255; return c <= 0.03928 ? c/12.92 : Math.pow((c+0.055)/1.055, 2.4); };
const L = h => { const n = parseInt(h.slice(1),16); return 0.2126*lin((n>>16)&255) + 0.7152*lin((n>>8)&255) + 0.0722*lin(n&255); };
const r = (a,b) => { const x=L(a), y=L(b); return (Math.max(x,y)+0.05)/(Math.min(x,y)+0.05); };
console.log(r('#08cb00','#000000').toFixed(2));   // <- cambiar los dos colores
"
```

Umbrales: **4.5** texto normal (AA), **3.0** texto grande (≥24px o ≥18.66px bold), **3.0**
componentes de UI y bordes. La tabla vigente está en `design-system.md` §2.

### Checklist manual

- [ ] Recorrer **toda la página solo con Tab**: el foco es siempre visible y el orden es lógico.
- [ ] El skip-link es el primer elemento tabulable y funciona.
- [ ] El menú móvil se abre y cierra con teclado; `aria-expanded` refleja el estado.
- [ ] El `<details>` del FAQ se abre con Enter/Espacio (nativo — no romperlo con JS).
- [ ] Formulario: cada campo con `<label>` asociado; los errores se anuncian.
- [ ] Con `prefers-reduced-motion: reduce` activo en el SO: sin reveals, sin smooth scroll, sin
      glow animado. La página sigue siendo completamente usable.
- [ ] Zoom del navegador al 200%: nada se corta ni se superpone.
- [ ] Jerarquía de encabezados sin saltos (`h1 → h2 → h3`, nunca `h1 → h3`).

### Herramientas
- Lighthouse (categoría Accessibility, umbral ≥ 95).
- Extensión **axe DevTools** para lo que Lighthouse no detecta.
- Navegación real con lector de pantalla si se toca el formulario (NVDA en Windows).

## 6. SEO y metadatos

- [ ] `<title>` y `<meta name="description">` con la ciudad — el negocio es local.
- [ ] Open Graph completo (`og:title`, `og:description`, `og:type`, `og:locale`, `og:site_name`).
- [ ] `<html lang="es">`.
- [ ] **Pendiente:** falta `og:image`. Un enlace compartido por WhatsApp o Instagram hoy se
      previsualiza sin imagen — bloqueado por falta de pieza gráfica (ver `backlog.md` ALS-016).
- [ ] **Pendiente:** falta JSON-LD `LocalBusiness`/`MusicGroup` para búsqueda local.

## 7. Checklist final antes de desplegar

Bloqueantes de verdad — si alguno falla, no se despliega:

- [ ] **`WHATSAPP.NUMBER` no es `000000000000`.** Con el placeholder, cada conversión se pierde en
      silencio y el sitio no cumple su única función.
- [ ] Las URLs de redes resuelven (Instagram, YouTube; Spotify sigue en `pending`).
- [ ] `npm run lint && npm test && npm run build` limpios.
- [ ] Lighthouse mobile con Accessibility ≥ 95 y Performance ≥ 90.
- [ ] Prueba manual del embudo completo: clic en CTA → completar el formulario → confirmar que
      WhatsApp abre con el mensaje correcto y el número real.
- [ ] Revisión a 320px y a 1440px.
- [ ] Ningún dato inventado publicado (`engineering-guidelines.md` §10).

## 8. Documentos relacionados

- [`engineering-guidelines.md`](./engineering-guidelines.md) — reglas de código y DoD.
- [`design-system.md`](./design-system.md) — tokens y tabla de contrastes.
- [`backlog.md`](./backlog.md) — los pendientes que este documento referencia.
