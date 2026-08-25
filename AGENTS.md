# AGENTS.md — ALIENSKILEZ web

Contexto para cualquier agente de IA (Claude Code, Codex, Cursor, etc.) que trabaje en este repo.
Este archivo **no repite** `docs/` — apunta a la fuente de verdad y resume solo lo que un agente
necesita para no romper una regla ya decidida. Si algo acá contradice `docs/`, gana `docs/`.

## Qué es esto

One-pager de conversión para ALIENSKILEZ (productor musical, La Serena, Chile). Todo el sitio
existe para un solo resultado: que el visitante escriba por WhatsApp. Sin backend propio para el
flujo de conversión (excepción acotada: función serverless de solo lectura para Spotify/YouTube,
especificada en ADR-11, **no implementada todavía** — no asumas que existe código para eso).

Stack: React 19 + TypeScript estricto + Vite (rolldown) + React Compiler + Tailwind v4 +
Framer Motion + Lenis + react-hook-form + zod + Vitest.

## Antes de tocar código, leé (en este orden si es tu primera vez en el repo)

1. [`docs/architecture.md`](docs/architecture.md) — decisiones cerradas (ADR). Si vas a tomar una
   decisión de diseño, verificá primero que no esté ya resuelta y documentada acá.
2. [`docs/engineering-guidelines.md`](docs/engineering-guidelines.md) — **vinculante**. TDD
   selectivo, separación de responsabilidades, DRY con criterio, reglas del React Compiler,
   convención de commits, Definition of Done.
3. [`docs/quality-gates.md`](docs/quality-gates.md) — umbrales numéricos (Lighthouse, contraste,
   responsive) y checklists antes de mergear.
4. [`docs/backlog.md`](docs/backlog.md) — estado real del proyecto, ticket por ticket (ALS-XXX).
5. [`docs/design-system.md`](docs/design-system.md) — tokens y tabla de contrastes ya calculados.

No hace falta leer los 5 en cada sesión: si la tarea es "agregar una sección", con
`engineering-guidelines.md` §2 y §6 alcanza. Reservá `architecture.md` completo para cuando la
tarea implique una decisión de arquitectura nueva.

## Reglas duras (rompen el build o el lint si se ignoran)

- **El componente nunca orquesta.** Si un `.tsx` contiene `wa.me`, `zodResolver`, o una regex de
  validación, está mal ubicado. Validar → armar mensaje → efecto externo vive en
  `features/*/hooks/`, nunca en el JSX.
- **Prohibido `useMemo`/`useCallback`/`React.memo` manual.** React Compiler activo, lint lo
  rechaza (`react-hooks/preserve-manual-memoization`).
- **Prohibido cómputo impuro en el cuerpo del componente** (`new Date()`, `Math.random()`) — va a
  constante de módulo o a un evento. Para estado externo (scroll, `matchMedia`) usá
  `useSyncExternalStore`, no `useState`+`useEffect`.
- **Sin datos de negocio inventados.** Ninguna cifra, testimonio o crédito plausible. Un dato que
  falta se publica con `pending: true` y un marcador visible (`[XX]`). Ver ADR-6.
- **Alias `@/` obligatorio**, `../*` está bloqueado por `no-restricted-imports`.
- **Colores solo vía tokens** de `@theme` en `src/styles/index.css`. Nunca `bg-[#08cb00]`.
- **Todo SVG que un componente parsea es código, no imagen.** Sin comentarios `--` dentro (rompe
  `DOMParser` en silencio, ver ADR-12). Necesita test de regresión.

## Definition of Done (obligatorio antes de dar un ticket por cerrado)

Ver checklist ejecutable: skill `cerrar-ticket`. Resumen (`engineering-guidelines.md` §8):
`npm run lint && npm test && npm run build` limpios → criterios de aceptación verificados
corriendo el sitio → checklist visual de `quality-gates.md` si tocó UI → `backlog.md` actualizado
→ commit atómico en Conventional Commits, con el ticket cuando aplica.

## Convención de commits

```
feat(booking): valida que la fecha estimada no sea anterior a hoy (ALS-004)
fix(a11y): el glow de hover tapaba el anillo de foco en las cards (ALS-012)
```

Tipos: `feat`, `fix`, `refactor`, `test`, `docs`, `chore`, `style`. Un commit = un cambio con
`lint + build` en verde **en ese commit**. Rama de trabajo `feat/…` o `fix/…`, nunca directo a
`main`.

## Skills de este repo (`.claude/skills/`)

Procedimientos ya codificados — usalos en vez de re-derivar el proceso desde `docs/` cada vez:

| Skill | Cuándo |
|---|---|
| `cerrar-ticket` | Al terminar cualquier ALS-XXX, antes de marcarlo "Hecho" |
| `nueva-adr` | Al tomar una decisión de arquitectura nueva o revertir una existente |
| `contraste-check` | Antes de introducir cualquier color o combinación nueva |
| `nueva-seccion` | Al agregar una sección nueva a la landing |
| `svg-workflow` | Al agregar, optimizar o modificar cualquier SVG (parseado o estático) |
| `lighthouse-audit` | Antes de desplegar, o tras tocar una dependencia pesada (ALS-019/ALS-024) |
| `accesibilidad-audit` | Barrido de a11y más allá del contraste — teclado, foco, reduced-motion (ALS-019) |
| `responsive-check` | Barrido en los 5 anchos de referencia (ALS-020) |
| `seo-check` | Metadatos, Open Graph, JSON-LD antes de desplegar |
| `analitica-conversion` | Instrumentar tracking del embudo — ver restricción dura de cookies antes de elegir herramienta (ALS-023) |

## Lo que NO hay (a propósito, no lo reinventes)

Sin router, sin store global, sin CI bloqueante, sin librería de componentes, sin i18n, sin
`tokenRegistry.ts` en TypeScript (los tokens viven en CSS, ADR-7). Antes de agregar cualquiera de
estos, leé la sección de "regla de honestidad" en `engineering-guidelines.md` §2 — la barra es
"ya se repitió dos veces", no "podría hacer falta".
