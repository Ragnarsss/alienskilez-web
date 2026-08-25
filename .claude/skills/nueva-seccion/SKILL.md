---
name: nueva-seccion
description: Agrega una sección nueva a la landing (src/shared/components/sections/) respetando la separación de responsabilidades del proyecto — componente presentacional puro, datos en constants/, wiring en App.tsx. Usar al agregar cualquier sección nueva a la página.
---

# Nueva sección de landing

## Regla que esta skill existe para no violar

"El componente nunca orquesta" (`docs/engineering-guidelines.md` §2). Un componente de sección
renderiza y delega eventos — cero validación, cero armado de URLs, cero `fetch`. Si el `.tsx` que
vas a escribir necesita `wa.me`, `zodResolver`, o una regex de validación, esa lógica no va ahí.

## Pasos

1. **Datos primero.** Si la sección muestra datos de negocio (no solo copy estructural fijo),
   crear o extender un archivo en `src/shared/constants/`, tipado con `as const satisfies` cuando
   exista un tipo que valide la forma (ver `services.ts` como referencia). Nunca literales sueltos
   dentro del componente.

2. **¿El dato existe todavía?** Si no (cifra, testimonio, crédito real pendiente): seguir ADR-6.
   El campo lleva `pending: boolean`, el valor es un marcador visible (`[XX]`, `[Nombre]`), y el
   componente **debe** degradar sin romperse — nunca un `<iframe src="">` vacío, nunca un
   `href=""`. No inventar el dato para que "se vea completo".

3. **Componente en `src/shared/components/sections/<Nombre>.tsx`.** Reglas:
   - Usa primitivos de `ui/` (`Section`, `Container`, `Button`, `Kicker`) en vez de reinventar
     layout — revisar si el primitivo que necesitás ya existe antes de escribir HTML crudo.
   - Import de datos vía `@/shared/constants/...` — nunca ruta relativa `../`
     (`no-restricted-imports` lo bloquea igual, pero no vale la pena el ida y vuelta del lint).
   - Cero `useMemo`/`useCallback`/`React.memo` — React Compiler activo.
   - Cero `new Date()`/`Math.random()` en el cuerpo del componente — a constante de módulo o a
     un evento.
   - Un solo `<h1>` en todo el sitio (vive en Hero); esta sección usa `<h2>`/`<h3>`, jerarquía sin
     saltos.
   - Todo control solo-ícono con `aria-label`; toda animación respeta `prefers-reduced-motion`
     (si la sección usa `useTransform`/`useScroll`/`animate()` imperativo de Framer Motion, ver
     ADR-13 — necesita su propio `useReducedMotion()`, `MotionConfig` no lo cubre).

4. **Wiring en `src/App.tsx`.** Una línea: importar y agregar al orden de composición. `App.tsx`
   solo ordena secciones, no debe ganar lógica nueva.

5. **¿Necesita test?** Solo si tiene lógica no trivial (transformación de datos, condición de
   negocio con más de dos ramas). Un `<section>` que mapea un array de constantes **no se
   testea** — es la regla explícita de la tabla en `engineering-guidelines.md` §1.

6. Cerrar con la skill `cerrar-ticket` si corresponde a un ALS-XXX del backlog.
