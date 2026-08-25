---
name: svg-workflow
description: Ciclo completo de un SVG en este proyecto — de dónde sale, cómo se optimiza, cómo se importa (raw parseado vs imagen estática), y cómo se valida antes de usarlo. Usar al agregar cualquier SVG nuevo, o al revisar uno existente antes de un ticket.
---

# Manejo de SVG

## Primera pregunta: ¿el componente lo va a parsear o solo mostrarlo?

Esto decide todo lo que sigue.

| Uso | Ejemplo en el repo | Import | Reglas |
|---|---|---|---|
| **Parseado** (el código lee su XML/paths) | `HeroMark3D.tsx`, `Preloader.tsx` vía `?raw` + `3dsvg` | `import x from "@/assets/foo.svg?raw"` | Sección "Validación" completa, abajo |
| **Imagen estática** | favicon, un ícono decorativo sin lógica encima | `<img src="...">` o componente `.svg` normal de Vite | El navegador lo rasteriza, las reglas de parseo no aplican |

Antes de agregar un archivo nuevo a `src/assets/`, confirmar con `grep` que no exista ya un
duplicado (geometría repetida con otro nombre) — pasó una vez en este repo
(`alien-svgrepo-com (1).svg` vs `alien-glyph.svg`, mismo `d=` letra por letra). Un asset sin
importar por ningún componente no pertenece a `src/assets/`.

## Origen y limpieza (antes del primer commit)

Un SVG descargado de un icon set (SvgRepo, etc.) trae ruido que no debería llegar al repo:

1. Sacar `<?xml version...?>`, comentarios de atribución del generador, `<defs>` vacío, y
   `class`/`xmlns:xlink` que no se usan.
2. Si el color debe salir de un token de Tailwind (`@theme`), sacar el `fill` hardcodeado del
   `<path>` y dejar que el componente lo pise por CSS (`[&_path]:fill-accent`, como en
   `HeroMark3D.tsx`) — no un literal en el SVG y otro en CSS.
3. Si el SVG se anima con `stroke-dashoffset` (efecto "se dibuja"), agregar `pathLength="1"` al
   `<path>` — normaliza el largo del trazo sin depender de la longitud real de la curva.
4. Nombre de archivo descriptivo y consistente (`alien-glyph.svg`, no `icon (1).svg` con espacios
   ni paréntesis — rompe algunos globs/CLI).

## Validación — solo si el SVG se parsea en runtime

**Por qué importa:** ADR-12 (`docs/architecture.md`) documenta un bug real: un comentario con
doble guion (`--`) dentro del SVG rompió `DOMParser` en silencio — sin excepción, sin log, solo un
canvas vacío. Costó varias sesiones diagnosticarlo.

1. Sin comentarios `<!-- ... -->` en el archivo final (ya deberían haberse ido en la limpieza de
   arriba, pero si quedó alguno, que no contenga `--` en el texto).
2. Escribir o actualizar un test de regresión, patrón de `src/test/alien-glyph.test.ts`:
   `viewBox` presente, al menos un `<path>` con `d` no vacío, `fill-rule` coherente, ausencia de
   `--` en comentarios.
3. **Confirmar que el test realmente prueba algo:** reintroducir el bug a propósito (agregar `--`
   en un comentario, vaciar un `d`), correr `npm test`, verlo fallar, revertir. Un test que nunca
   se vio en rojo no se sabe qué cubre.
4. Cuidado con `happy-dom`/`jsdom`: son parsers permisivos que aceptan XML mal formado que un
   navegador real rechaza. Si el síntoma fue "no se ve nada en el navegador" pero el test pasa, la
   señal del navegador manda — no la del entorno emulado.

## Consistencia con el resto del proyecto

- Un SVG parseado que representa la marca no lleva `fill` hardcodeado si el color de marca puede
  cambiar — sale de `HERO_MARK.COLOR`/token, con la única excepción documentada en ADR-7 (Three.js
  no resuelve `var()`, así que ahí sí es un literal — pero atado a un test que lo liga al valor
  real del CSS).
