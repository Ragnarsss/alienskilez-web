# Documentación — ALIENSKILEZ web

Fecha: 2026-08-12
Estado: sitio implementado y verificado (`lint`, `test` 24/24, `build` limpios).
**No desplegado** — bloqueado por [ALS-001](./backlog.md) (número de WhatsApp).

## Qué es este proyecto

One-pager de conversión para **ALIENSKILEZ**, productor musical en La Serena, Chile. Diez líneas de
servicio, sin precios publicados, y un solo objetivo: que un artista termine escribiendo por
WhatsApp.

Sitio 100% estático: React 19 + TypeScript estricto + Vite (rolldown) + Tailwind v4 + Framer
Motion. Sin backend, sin base de datos, sin router.

## Contenido

### Producto

1. [Requisitos](./requirements.md) — versión narrativa breve. **Punto de entrada rápido.**
2. [Catálogo RF-RNF](./rf-rnf-catalogo.md) — requisitos formales con métricas, umbrales y
   trazabilidad. Incluye §5: lo que todavía **no** se pudo verificar.
3. [Historias de usuario](./historias-usuario.md) — actores, épicas y fichas `HU-MOD-NNN` con
   criterios Given/When/Then.
4. [Casos de uso](./casos-uso.md) — fichas `CU-MOD-NNN` con flujos principal, alternos y de
   excepción, más el diagrama de casos de uso.

### Ingeniería

5. [**Arquitectura**](./architecture.md) — stack, mapa de módulos, modelo de contenido, el flujo
   de agendamiento y **10 ADR** con las decisiones cerradas y su porqué.
6. [**Guía de ingeniería**](./engineering-guidelines.md) — TDD acotado, SoC, KISS, DRY, SOLID,
   constantes y *magic strings*, reglas del React Compiler, Definition of Done y convención de
   commits.
7. [Sistema de diseño](./design-system.md) — paleta con contrastes **calculados**, tipografía,
   forma, motivos gráficos y cómo extenderlo.
8. [Puertas de calidad](./quality-gates.md) — umbrales de rendimiento y checklists de responsive,
   UX y accesibilidad. Incluye el checklist bloqueante previo a desplegar.

### Planificación

9. [**Backlog**](./backlog.md) — tickets `ALS-XXX`, qué está hecho y qué falta. **Fuente de verdad
   del estado del proyecto.**

## Orden de lectura sugerido

**Sin contexto previo:**
`requirements.md` → `architecture.md` → `engineering-guidelines.md` → `backlog.md`

**Para escribir código:**
`engineering-guidelines.md` → `architecture.md` (ADRs) → `design-system.md`

**Para retomar el trabajo:** `backlog.md` — cada ticket referencia el documento que explica la
decisión detrás.

## Convenciones del proyecto

- **Idioma:** español para dominio, copy y documentación; inglés solo para lo técnico
  (`Component`, `Service`, nombres de archivo).
- **Alias de import:** `@/` en vez de rutas relativas al padre (regla de lint, ADR-8).
- **Constantes:** ningún dato de negocio, ancla o límite fuera de `src/shared/constants/`.
- **React Compiler activo:** prohibidos `useMemo`, `useCallback` y `React.memo` manuales.
- **Tokens de diseño:** solo en `@theme` de `src/styles/index.css`. Ningún color literal en
  componentes.
- **Commits:** Conventional Commits con el ticket — `feat(booking): … (ALS-012)`.

## La regla que atraviesa todo el proyecto

> **No se inventan datos de negocio.** Ni cifras, ni testimonios, ni créditos de portfolio, ni
> precios.

Lo que no existe todavía se publica con marcador visible (`[XX]`, `[Nombre del artista]`) y
`pending: true`. Una cifra plausible en un sitio de negocio es una afirmación falsa frente a un
cliente real, y varias de ellas —como "lanzamientos producidos"— son verificables por cualquiera
en Spotify.

Corolario: ningún componente puede romperse por un dato pendiente. Un `embedUrl` vacío muestra un
marcador, no un `<iframe>` roto; una red sin URL confirmada no renderiza el enlace.

Ver ADR-6 en [`architecture.md`](./architecture.md) y §10 de
[`engineering-guidelines.md`](./engineering-guidelines.md).

## Estado en una tabla

| | Estado |
|---|---|
| Secciones implementadas | 9 + navbar + footer |
| Tests | 24/24 en verde (schema y armado del mensaje) |
| Lint / build | Limpios |
| Contrastes de la paleta | 10 combinaciones calculadas |
| Lighthouse | ⏳ Sin correr (ALS-019) |
| Lector de pantalla | ⏳ Sin recorrer (ALS-019) |
| Datos reales de negocio | ⏳ Portfolio, cifras y testimonios pendientes (ALS-003 a ALS-005) |
| Número de WhatsApp | 🔴 **Placeholder — bloquea el lanzamiento (ALS-001)** |
| Despliegue | ⏳ Pendiente (ALS-022) |
