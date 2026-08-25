---
name: responsive-check
description: Barrido responsive en los anchos de referencia del proyecto (320/375/768/1024/1440) contra el checklist de docs/quality-gates.md §3. Usar antes de desplegar (ALS-020), o después de agregar/modificar cualquier sección o componente con layout propio.
---

# Barrido responsive

Breakpoints de Tailwind por defecto (`sm:640`, `md:768`, `lg:1024`, `xl:1280`) — no se redefinen,
no inventar uno nuevo sin que haya un caso real que lo pida.

## Anchos de referencia (recorrer los cinco, en este orden)

1. **320px — el ancho hostil real.** El que más rompe layouts. Sin scroll horizontal en **ninguna**
   sección — es el criterio más estricto y el que primero se salta si no se prueba explícito.
2. 375px / 390px — móvil típico.
3. 768px — punto donde el menú hamburguesa debe ceder al navbar completo (`md`). Verificar la
   transición en sí, no solo los dos extremos.
4. 1024px y 1440px — el contenido queda contenido por `max-w-6xl`, no estirado a todo el ancho.

## Reglas a verificar en cada ancho

- Nada de anchos fijos en `px` para contenedores — grillas con `grid-cols` responsivas.
- Tipografía escalada con variantes (`text-4xl sm:text-6xl md:text-7xl`) o `clamp()`, nunca un
  tamaño fijo que se vea bien en un ancho y desborde en otro.
- **Área táctil mínima 44×44px** en todo control interactivo. Punto ya señalado como al límite en
  este proyecto: el botón del menú móvil es `h-10 w-10` (40px) — si se toca ese componente por
  cualquier motivo, subirlo a 44px, no dejarlo pasar de nuevo.
- `<select>` e `<input>` a **16px mínimo** (`text-base`). Por debajo, iOS Safari hace zoom
  automático al enfocar — un bug que se ve solo en dispositivo real, no en devtools desktop.
- Contenido ancho (embeds de portfolio, cualquier tabla futura) dentro de un contenedor con
  `overflow-x-auto` propio — nunca dejar que empuje el `<body>`.

## Cómo probar de verdad

DevTools responsive mode cubre la mayoría, pero:
- El zoom-on-focus de iOS Safari **no se reproduce en devtools de Chrome** — si el ticket tocó
  inputs, probar en un dispositivo real o simulador de iOS si hay uno disponible.
- El árbol de scroll de Lenis puede comportarse distinto en touch vs mouse — si el ticket tocó
  scroll o el Hero con pin, probar con touch emulation activo, no solo con el mouse.

## Al terminar

Actualizar el checklist de `docs/quality-gates.md` §3 si se encontró y arregló algo. Cerrar con la
skill `cerrar-ticket` si corresponde a ALS-020 u otro ticket del backlog.
