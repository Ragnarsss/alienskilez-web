---
name: lighthouse-audit
description: Corre y evalúa una auditoría Lighthouse contra los umbrales exactos de docs/quality-gates.md — performance, tamaño de bundle inicial vs diferido, LCP/CLS/INP. Usar antes de desplegar, después de tocar cualquier dependencia pesada (Framer Motion, Three.js, Lenis), o para cerrar ALS-019/ALS-024.
---

# Auditoría de Lighthouse y peso de bundle

## Regla que no se puede saltear

**Siempre contra `npm run preview` (build de producción), nunca contra `npm run dev`.** El
servidor de desarrollo no minifica y las métricas no significan nada — está explícito en
`docs/quality-gates.md` §2.

## Pasos

1. Build y servir producción:
   ```bash
   npm run build && npm run preview   # sirve dist/ en localhost:4173
   ```

2. Correr Lighthouse en las dos variantes:
   ```bash
   npx lighthouse http://localhost:4173 --view                          # mobile, por defecto
   npx lighthouse http://localhost:4173 --preset=desktop --view
   ```

3. Comparar contra los umbrales exactos de `docs/quality-gates.md` §2 (no aproximar):

   | Métrica | Verde | Amarillo | Rojo |
   |---|---|---|---|
   | Performance (mobile) | ≥ 90 | 80-89 | < 80 |
   | Accessibility | ≥ 95 | 90-94 | < 90 |
   | Best Practices | ≥ 95 | 90-94 | < 90 |
   | SEO | ≥ 95 | 90-94 | < 90 |
   | LCP | ≤ 2.5s | 2.5-4s | > 4s |
   | CLS | ≤ 0.1 | 0.1-0.25 | > 0.25 |
   | INP | ≤ 200ms | 200-500ms | > 500ms |
   | JS inicial (gzip, bloqueante) | ≤ 150 kB | 150-250 kB | > 250 kB |
   | JS diferido (gzip, por chunk) | ≤ 200 kB | 200-350 kB | > 350 kB |

   INP, no FID — FID quedó obsoleto como Core Web Vital en marzo de 2024.

4. **Leer el tamaño real de los chunks** en el output de `npm run build` (Vite lo imprime) y
   separar bloqueante vs diferido — sumar todo el JS en una sola cifra esconde qué bloquea el
   primer render.

5. **Si el JS inicial está en amarillo/rojo**, el orden de intervención ya está decidido en
   `docs/quality-gates.md` §2 (no reinventar el orden):
   1. Reemplazar Framer Motion por CSS (`@starting-style`) o IntersectionObserver donde el uso sea
      scroll-reveal simple — es el mayor candidato hoy.
   2. `React.lazy` para secciones bajo el fold.
   3. Revisar el peso de zod.

   **Nunca** proponer `useMemo`/`useCallback` como optimización — está prohibido por el React
   Compiler y no es el cuello de botella en este proyecto.

6. Registrar el resultado: si es la primera corrida real (ALS-019) o si cambia la línea base,
   actualizar la tabla de "línea base medida" en `docs/quality-gates.md` §2 con la fecha, y
   `docs/backlog.md` si cierra o mueve ALS-019/ALS-024.

7. Cerrar con la skill `cerrar-ticket` si corresponde a un ticket del backlog.
