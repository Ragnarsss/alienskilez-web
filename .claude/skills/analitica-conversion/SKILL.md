---
name: analitica-conversion
description: Instrumenta el embudo de conversión con Google Analytics 4 (clics por CTA, envíos de formulario, apertura de WhatsApp) según la decisión ya cerrada en ADR-15 — GA4 estándar + aviso de cookies mínimo no bloqueante. Usar para ALS-023 o cualquier tarea de tracking/analytics.
---

# Analítica de conversión

## La herramienta ya está decidida — no la re-abras

`docs/architecture.md` ADR-15 cierra esto: **Google Analytics 4 estándar** (cookies de primera
parte `_ga`/`_ga_*`), con un aviso de cookies **mínimo y no bloqueante** — franja o toast con
opción real de rechazar, nunca un modal que tape el CTA. Esa ADR reemplazó explícitamente una
restricción anterior de "cero cookies, cero banner" — si encontrás esa frase vieja en algún lugar
del repo que no sea la propia ADR-15 (que la cita para explicar por qué cambió), está desactualizado,
no es la regla vigente.

No vuelvas a evaluar Plausible/Fathom/Consent Mode salvo que el usuario pida explícitamente
reabrir la decisión — ADR-15 ya registró por qué se descartaron.

**Pendiente que sí hay que verificar, no decidir de nuevo:** ADR-15 deja como advertencia (no como
bloqueo) el estado final de la Ley 21.719 (protección de datos, Chile) antes de que el sitio reciba
tráfico sostenido. Si al ejecutar esta skill esa ley ya está en régimen, señalarlo antes de dar el
ticket por cerrado — no asumir que el aviso mínimo sigue siendo suficiente sin chequear.

## Qué medir (ya especificado en el ticket, no hay que redecidirlo)

Embudo completo: **visitas → clic por CTA → envío válido del formulario → apertura de WhatsApp.**

- Los dos CTA se miden **por separado**: "Agenda tu sesión" (`tier: "sesion"`) vs "Cotiza tu
  proyecto" (`tier: "proyecto"`) — el dato ya existe en `constants/services.ts`, no inventar una
  taxonomía nueva de eventos.
- El evento de "envío válido" es el mismo punto donde `useBookingForm` ya invoca
  `buildWhatsAppMessage()` tras pasar la validación de zod — instrumentar ahí, no duplicar la
  lógica de validación en la capa de analítica.
- La apertura de WhatsApp es el `window.open(wa.me/...)` — si el navegador bloquea el popup
  (ALS-018), ese evento también es dato útil (embudo roto por el navegador, no por el usuario).

## Reglas de implementación en este stack

- El evento se dispara **desde el hook**, no desde el componente — la orquestación vive en
  `useBookingForm`, la analítica es parte de esa orquestación, no de `Contacto.tsx`
  (`docs/engineering-guidelines.md` §2, "el componente nunca orquesta").
- Cero PII: nombre, teléfono o el texto del campo `message` del formulario **nunca** viajan al
  proveedor de analítica — solo el hecho del evento (qué CTA, qué `tier`, éxito/error).
- El script de GA4 (`gtag.js`) agrega peso al bundle — medirlo con la skill `lighthouse-audit`
  antes de dar el ticket por cerrado, este proyecto ya está en amarillo en JS inicial
  (`quality-gates.md` §2). Cargarlo con `async`/diferido, no bloqueando el primer render.
- El aviso de cookies es **UI real, no un checkbox perdido**: visible, con opción de rechazar que
  funcione (no envía el evento a GA4 si se rechaza), y nunca un modal que bloquee el CTA — es la
  línea que separa esta decisión de lo que ADR-15 reemplazó.

## Sobre "cuándo se salen del sitio"

Si se pide medir abandono/exit-intent: usar el evento `visibilitychange` (`document.hidden`), no
`beforeunload` — este último es poco confiable en mobile y algunos navegadores lo descontinuaron
para prefetch/bfcache. Sigue aplicando la regla de cero PII: el evento es "la sesión terminó en la
sección X", nunca un timestamp atado a un identificador de usuario persistente.

## Al terminar

Actualizar `docs/backlog.md` ALS-023 a "Hecho" con los criterios verificados (evento visible en
GA4 Realtime durante una prueba manual del embudo completo). Si en el camino aparece una decisión
nueva no cubierta por ADR-15 (ej. cambiar de proveedor, agregar un evento fuera del embudo ya
especificado), esa sí es una ADR nueva (skill `nueva-adr`) — pero implementar lo ya decidido no lo
es. Cerrar con la skill `cerrar-ticket`.
