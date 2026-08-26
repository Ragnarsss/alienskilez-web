---
name: auditoria-branding
description: Audita que el código del sitio siga siendo consistente con la identidad de marca documentada en docs/design-system.md — paleta vía tokens, roles tipográficos, radios de esquina, motivos gráficos, disciplina de "acento como señal, no decoración" y la red de prefers-reduced-motion. Usar tras cambios visuales grandes (una sección nueva, un rework de layout, una referencia visual nueva copiada de otro sitio), antes de un deploy, o cuando alguien pida explícitamente "auditoría de branding"/"chequeo de marca".
---

# Auditoría de branding

**Por qué existe esta skill:** el proyecto tiene una identidad visual deliberada y documentada
("oscura, urbana, alienígena... instrumental técnico, no SaaS amigable" —
`docs/design-system.md` §1) que se erosiona fácil cuando se copia una referencia visual externa
sin filtrar (ej. el showcase de lenis.darkroom.engineering usado como inspiración de layout en
ALS-014/045 — se tomó el layout, NO el radio de esquinas grande, a propósito). Esta skill es el
checklist para no perder esa disciplina con el tiempo.

No repite la teoría de `docs/design-system.md` — la usa como fuente de verdad. Leerlo primero si
hace rato no se toca el proyecto.

## Pasos

### 1. Colores solo vía tokens (ADR-7)

```bash
grep -rn "bg-\[#\|text-\[#\|border-\[#\|from-\[#\|to-\[#" src/ --include=*.tsx --include=*.ts
```

Cualquier resultado es una violación — un color nuevo va como token en `@theme`
(`src/styles/index.css`), nunca como clase arbitraria con hex literal. Excepción ya documentada:
`HERO_MARK.COLOR` en `limits.ts` (Three.js no resuelve `var()`, ver ADR-12) — si aparece un
resultado ahí, no es un hallazgo nuevo.

Si el hallazgo es un color realmente nuevo (no uno de los 9 tokens existentes), correr la skill
`contraste-check` antes de aprobarlo — nunca estimar el contraste a ojo (ADR-10).

### 2. Radios de esquina

```bash
grep -rn "rounded-lg\|rounded-xl\|rounded-2xl\|rounded-3xl\|rounded-full" src/shared/components --include=*.tsx
```

`design-system.md` §4 fija radios chicos y duros (`rounded-sm`/`rounded-md`) a propósito. Un
resultado acá casi siempre es un radio grande colado desde una referencia externa (como pasó con
el showcase de Lenis) — confirmar con el usuario antes de aceptarlo, no asumir que es un error a
corregir en automático: puede ser una excepción deliberada (ej. `radar-ping`, que es un punto
circular, no una card).

### 3. Roles tipográficos

- Titulares → Space Grotesk (`font-display`), nunca `font-sans` en un `<h1>`-`<h3>` de sección.
- Cuerpo → Inter (`font-sans`, el default).
- Kickers/labels/datos → mono (`font-mono` o la clase `.kicker`), con `uppercase` +
  `tracking-[0.18em]`-`tracking-[0.22em]` — no una fuente nueva para lograr ese look.

```bash
grep -rn "font-display\|font-mono\|font-sans" src/shared/components/sections/*.tsx | grep -v "\.test\."
```

Revisar a ojo que cada uso calce con su rol. Una fuente CUARTA (ni display, ni sans, ni mono) no
se agrega sin justificar el costo en LCP (`design-system.md` §7.4).

### 4. "El acento es señal, no decoración" (§1)

```bash
grep -rn "text-accent\|bg-accent\|border-accent\|border-border-accent" src/shared/components/sections/*.tsx | wc -l
```

No hay un número mágico, pero si una sección nueva mete el verde de acento en más de dos o tres
elementos a la vez (más allá del CTA, un kicker y un borde en hover/foco), probablemente está
compitiendo consigo misma. Revisar la sección en cuestión a ojo, no solo el conteo.

### 5. Motivos gráficos: solo los cuatro documentados

`design-system.md` §5 lista exactamente cuatro (`.starfield`/`.starfield-mid`, `.hud-grid`,
`.hud-frame`, glow de acento) más "Signal Geometry" (§5.1, tres variantes: `shards`/`chevrons`/
`hex`). Un motivo gráfico nuevo (una quinta variante de `GeometricAccent`, un patrón CSS nuevo)
tiene que costar cerca de cero en runtime (sin JS, sin imagen) — si necesita cualquiera de las
dos, exigir la justificación explícita que pide §5, no dejarla pasar en silencio.

### 6. La red de `prefers-reduced-motion` sigue completa (triple, §6)

Cualquier animación IMPERATIVA nueva (`useTransform`/`useScroll`/`animate()` fuera de las props
declarativas de Framer Motion — `initial`/`animate`/`whileInView` ya las cubre `MotionConfig`
solas) necesita su propio chequeo de `usePrefersReducedMotion()`/`useReducedMotion()` a mano:

```bash
grep -rln "useTransform\|useScroll(" src/shared/components/sections/*.tsx
```

Para cada archivo del resultado, confirmar que exista un uso de `usePrefersReducedMotion` (propio
o heredado de un componente padre que decide si montar la versión animada, ej. `Servicios.tsx`
decidiendo si monta `ServiciosDeck`) — no asumir que `MotionConfig` ya lo cubre, no lo hace para
motion imperativo (ver la excepción explícita: `useLenis`/`ScrollProgress` corren siempre por
decisión de producto documentada en `App.tsx`, esos NO son un hallazgo).

### 7. Transiciones nunca sobre `all`

```bash
grep -rn "transition-all\b" src/shared/components --include=*.tsx
```

`design-system.md` §6 fija transiciones de 200ms sobre propiedades puntuales
(`background-color`/`box-shadow`/`border-color`/`color`), nunca `all` — `all` transiciona layout
por accidente (y es más caro).

### 8. Consistencia de logo/wordmark

`SITE.NAME` (`shared/constants/site.ts`) es la única fuente del nombre — buscar strings
`"ALIENSKILEZ"` sueltos fuera de ese archivo, `index.html` (metadatos) y comentarios:

```bash
grep -rln "ALIENSKILEZ" src/ --include=*.tsx --include=*.ts | grep -v "constants/site.ts"
```

Cualquier componente que renderice el nombre debería importar `SITE.NAME`, no repetirlo a mano —
un typo o un rebrand futuro se corrige en un solo lugar.

## Reportar

Mismo criterio que `code-review`: listar hallazgos con archivo + línea + qué regla de
`design-system.md`/ADR rompen, no solo "está mal". Un hallazgo que en realidad es una excepción
ya documentada (radar-ping, `HERO_MARK.COLOR`, ScrollProgress corriendo siempre) se anota como
"revisado, es excepción conocida", no se reporta como si fuera nuevo.
