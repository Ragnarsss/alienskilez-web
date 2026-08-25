---
name: accesibilidad-audit
description: Barrido de accesibilidad WCAG 2.1 AA más allá del contraste — navegación por teclado, foco visible, formularios, prefers-reduced-motion, jerarquía de encabezados. Usar antes de desplegar (ALS-019), o después de cualquier cambio de UI que agregue interactividad o animación nueva. Para contraste de color específico, usar la skill contraste-check.
---

# Auditoría de accesibilidad

Cubre `docs/quality-gates.md` §5 completo, salvo contraste de color (esa parte la tiene su propia
skill: `contraste-check`, porque se dispara con más frecuencia — cada color nuevo, no solo en
auditorías completas).

## Checklist manual (recorrer en orden, con el sitio corriendo)

1. **Solo teclado, toda la página:** `Tab` desde el principio. El foco siempre visible, el orden
   lógico (sigue el DOM, no salta). El skip-link es el primer elemento tabulable y funciona de
   verdad (lleva al contenido, no a un ancla rota).

2. **El anillo de foco no queda tapado por el glow decorativo.** Es el error específico que este
   proyecto ya cometió una vez (`quality-gates.md` §4) — el glow de hover en las cards puede pisar
   visualmente el `:focus-visible`. Verificar con teclado, no con mouse (el hover no lo revela).

3. **Menú móvil:** se abre y cierra con teclado, `aria-expanded` refleja el estado real en cada
   transición, no solo al montar.

4. **`<details>` del FAQ:** se abre con Enter/Espacio — es comportamiento nativo del elemento, si
   dejó de funcionar es porque algún JS lo está interceptando sin querer.

5. **Formulario de contacto:** cada `<input>`/`<select>` con `<label>` asociado por `htmlFor`
   (nunca solo `placeholder`). Errores con `role="alert"` + `aria-invalid` + `aria-describedby`
   apuntando al mensaje real.

6. **`prefers-reduced-motion: reduce` activo en el SO:** recorrer todo el sitio así. Sin reveals,
   sin smooth scroll de Lenis, sin glow animado, sin paralaje del Hero, sin contador animado en
   Alcance. La página tiene que seguir siendo **completamente usable**, no solo "sin animación
   molesta" — si algo depende de una animación para ser operable, es un bug de accesibilidad, no
   un detalle estético.

   Nota: `useLenis` no se inicializa con reduced-motion (ADR-14); todo motion imperativo
   (`useTransform`/`useScroll`/`animate()` fuera de props declarativas) necesita su propio
   `useReducedMotion()` — `MotionConfig` no lo cubre (ADR-13). Si se agregó una animación de este
   tipo y no llama `useReducedMotion()` explícitamente, es un hueco real, no falso positivo.

7. **Zoom del navegador al 200%:** nada se corta ni se superpone.

8. **Jerarquía de encabezados:** un solo `<h1>` (en el Hero), sin saltos (`h1→h2→h3`, nunca
   `h1→h3`).

9. **Todo control solo-ícono tiene `aria-label`** (botón de menú móvil, íconos de redes, etc.).

## Herramientas

- Lighthouse, categoría Accessibility, umbral ≥ 95 (ver skill `lighthouse-audit` para la corrida
  completa).
- Extensión axe DevTools para lo que Lighthouse no detecta (contraste de foco, orden de tabulación
  real).
- Si el ticket tocó el formulario: navegación real con lector de pantalla (NVDA en Windows) — un
  checklist automatizado no reemplaza esto para `role="alert"` y asociaciones `aria-describedby`.

## Al terminar

Marcar en `docs/rf-rnf-catalogo.md` §5 qué quedó verificado (no declarar algo "cumplido" sin
haberlo recorrido de verdad — el propio catálogo distingue "declarado" de "verificado"). Cerrar
con la skill `cerrar-ticket` si corresponde a ALS-019 u otro ticket del backlog.
