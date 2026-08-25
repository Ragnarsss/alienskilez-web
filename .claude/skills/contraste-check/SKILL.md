---
name: contraste-check
description: Calcula el contraste WCAG real entre dos colores antes de usarlos juntos (texto sobre fondo, borde sobre fondo). Usar antes de introducir cualquier color o combinación nueva — nunca asumir el contraste de memoria, ya causó un error real documentado (ADR-10).
---

# Verificación de contraste (WCAG)

**Por qué existe esta skill:** `docs/architecture.md` ADR-10 documenta que una versión anterior
del proyecto afirmó "9.1:1" de memoria; calculado de verdad era 9.55:1, y otra combinación daba
5.74:1 en vez de los 6.4:1 asumidos — la diferencia importaba porque cambiaba de AAA a AA. No
repetir ese error.

## Pasos

1. Correr el cálculo real (no estimarlo):
   ```bash
   node -e "
   const lin = c => { c/=255; return c <= 0.03928 ? c/12.92 : Math.pow((c+0.055)/1.055, 2.4); };
   const L = h => { const n = parseInt(h.slice(1),16); return 0.2126*lin((n>>16)&255) + 0.7152*lin((n>>8)&255) + 0.0722*lin(n&255); };
   const r = (a,b) => { const x=L(a), y=L(b); return (Math.max(x,y)+0.05)/(Math.min(x,y)+0.05); };
   console.log(r('#COLOR_A','#COLOR_B').toFixed(2));
   "
   ```
   Sustituir `#COLOR_A`/`#COLOR_B` por los hex reales.

2. Comparar contra el umbral que aplica:
   - **4.5:1** — texto normal, AA.
   - **3.0:1** — texto grande (≥24px, o ≥18.66px bold), AA.
   - **3.0:1** — componentes de UI y bordes.
   - 7:1 / 4.5:1 si se apunta a AAA (no es el mínimo del proyecto, pero preferible si es gratis).

3. Si el color ya existe en la paleta, verificar contra la tabla de
   `docs/design-system.md` §2 en vez de recalcular — y si el resultado no coincide con la tabla,
   la tabla está desactualizada: corregirla ahí mismo.

4. Si el resultado reprueba: no usar gris claro por reflejo. Ver el precedente de ADR-10 — texto
   negro sobre el verde de acento (`#08CB00`) da 9.55:1, gris claro (`#EEEEEE`) da 1.89:1 y
   reprueba cualquier nivel.

5. Si el color es nuevo (no existe en `@theme` de `src/styles/index.css`): agregarlo ahí, nunca
   como clase arbitraria `bg-[#hex]` en un componente (ADR-7). Actualizar la tabla de
   `docs/design-system.md` con el valor calculado, no uno redondeado de memoria.
