---
name: seo-check
description: Verifica metadatos SEO — title, meta description, Open Graph, og:image, lang, JSON-LD LocalBusiness — contra el checklist de docs/quality-gates.md §6. Usar antes de desplegar, o al tocar index.html o cualquier dato de docs/rf-rnf-catalogo.md relacionado a negocio local.
---

# SEO y metadatos

Este es un negocio **local** (La Serena, Chile) — el criterio no es "SEO genérico", es que
búsquedas locales y que compartir el link en WhatsApp/Instagram se vea bien.

## Checklist (`docs/quality-gates.md` §6)

- [ ] `<title>` y `<meta name="description">` en `index.html`, mencionando la ciudad — es lo que
      hace que una búsqueda local encuentre el sitio.
- [ ] Open Graph completo: `og:title`, `og:description`, `og:type`, `og:locale`, `og:site_name`.
- [ ] `<html lang="es">`.
- [ ] `og:image` presente y resolviendo. **Estado conocido del proyecto: falta** (bloqueado por
      pieza gráfica, ver `docs/backlog.md` ALS-016) — si esta skill se corre y sigue faltando, no
      es una regresión nueva, es deuda ya documentada. No inventar una imagen para completarlo;
      confirmar con el negocio si ya hay una pieza gráfica real antes de agregarla (regla de
      "no se inventan datos de negocio" también aplica a assets visuales que representan la
      marca).
- [ ] JSON-LD `LocalBusiness`/`MusicGroup` — también pendiente (ALS-017) si no se agregó todavía.
      Si se agrega: usar solo datos ya confirmados de `constants/site.ts`, nunca placeholders con
      `pending: true` — JSON-LD estructurado que un buscador indexa no debe llevar marcadores
      visibles de "pendiente", así que si el dato no está confirmado, ese campo del schema se
      omite entero en vez de rellenarse con un placeholder.

## Verificación práctica

1. Lighthouse categoría SEO, umbral ≥ 95 (ver skill `lighthouse-audit`).
2. Compartir la URL de `preview` en un chat de WhatsApp/Telegram propio para confirmar que la
   previsualización (imagen, título, descripción) se ve como se espera — el Lighthouse score no
   captura cómo se ve la card real.
3. Si se agregó o cambió JSON-LD: validar con el
   [Rich Results Test de Google](https://search.google.com/test/rich-results) antes de dar por
   bueno el schema — un JSON-LD con un typo pasa el build sin error y falla en silencio en
   búsqueda.

## Al terminar

Actualizar `docs/quality-gates.md` §6 y `docs/backlog.md` (ALS-016/ALS-017) si el estado cambió.
Cerrar con la skill `cerrar-ticket` si corresponde a un ticket del backlog.
