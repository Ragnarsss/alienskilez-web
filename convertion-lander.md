# ALIENSKILEZ Web — Resumen técnico para CV

## Objetivo del proyecto

One-pager de conversión para **ALIENSKILEZ**, productor musical en La Serena, Chile. Todo el
sitio existe para un solo resultado de negocio: que el visitante contacte por WhatsApp para
agendar una sesión o cotizar un proyecto. Integra el catálogo real de Spotify y YouTube del
cliente (vía funciones serverless propias) en lugar de contenido estático, y resuelve un
despliegue productivo completo en AWS (hosting, DNS, dominio custom) para un cliente real,
incluyendo la resolución documentada de incidentes de DNS en producción.

## Stack tecnológico

**Frontend**

- React 19.2 + TypeScript (estricto)
- Vite 8 (flavor rolldown) + React Compiler (auto-memoización, sin `useMemo`/`useCallback`
  manual)
- Tailwind CSS v4 (tokens de diseño vía `@theme`)
- Framer Motion 13 (animaciones)
- Lenis 1.3 (smooth scroll)
- Three.js 0.185 + React Three Fiber 9.7 + Drei 10.7 (hero 3D)

**Formularios / validación**

- React Hook Form 7.85
- Zod 4.4
- @hookform/resolvers 5.7

**Testing**

- Vitest 4 (59 tests unitarios sobre lógica de dominio pura)

**Tooling**

- ESLint 10 (flat config) + typescript-eslint 8
- eslint-plugin-react-hooks 7 (reglas del React Compiler)
- Prettier 3.9

**Backend serverless**

- 2 funciones AWS Lambda (Node.js 20.x, ESM) de solo lectura para catálogos Spotify/YouTube
- AWS Secrets Manager para credenciales

**Infraestructura / Cloud**

- AWS Amplify Hosting (build automático conectado al repo)
- AWS Lambda (Function URLs, sin API Gateway)
- AWS Secrets Manager
- Route53 / CloudFront (dominio custom `deotroplaneta.cl`)
- Google Analytics 4

## Técnicas y buenas prácticas aplicadas

**Arquitectura**

- Feature-based ligera sobre SPA/one-pager estático, sin router ni store global
- Separación estricta de responsabilidades: componentes `.tsx` nunca orquestan (nunca contienen
  `wa.me`, `zodResolver` ni regex) — esa lógica vive en `features/*/hooks/`
- Sin backend propio para el flujo de conversión (excepción acotada: 2 Lambdas de solo lectura
  para catálogo de Spotify/YouTube)
- Primitivos de UI propios sobre Tailwind, sin librería de componentes externa
- Estado externo vía `useSyncExternalStore`, no `useState`+`useEffect`
- Tokens de diseño centralizados solo en CSS (`@theme`), nunca literales en componentes
- 16 Architecture Decision Records (ADRs) documentados con contexto, decisión, justificación,
  consecuencias y alternativas descartadas — incluye reversión de un supuesto de arquitectura al
  medirlo con datos reales

**Testing**

- TDD selectivo deliberado: solo se testean funciones puras de dominio y schemas de validación
  (booking, parsing de catálogos Spotify/YouTube, construcción de mensajes de WhatsApp, eventos
  GA4, SVG del isotipo, timing del preloader)
- Cero tests de componentes presentacionales, decisión explícita y documentada
- Regla dura: ningún cambio en `features/booking/` se mergea sin test verde

**CI/CD**

- Sin pipeline de CI automatizado — decisión documentada explícitamente (proyecto de una sola
  persona, se reevalúa si crece el equipo o el sitio)
- Gate manual disciplinado: `lint + test + build` en verde antes de cada merge, exigido por
  checklist de Definition of Done
- Deploy continuo del frontend vía AWS Amplify Hosting (build automático en push a `main`)

**Manejo de errores**

- Estados de unión discriminada (`loading`/`success`/`error`) en hooks de fetch
- `AbortController` para cancelar peticiones en desmontaje
- Degradación a fallback sin romper la UI ante fallos de red o de la Lambda
- Validación de la forma de las respuestas de red antes de usarlas (no confía ciegamente en el
  JSON externo)
- Códigos HTTP explícitos en las Lambdas (ej. 502 cuando falla el proveedor de datos)

**Seguridad**

- Secretos nunca en el repo: `.env` excluido de git, credenciales de Spotify en AWS Secrets
  Manager
- CORS restringido por origen en las Function URLs de las Lambdas
- Function URLs públicas por diseño documentado (no secretas, de solo lectura)
- Sin autenticación/autorización expuesta (no aplica: sitio sin login, Lambdas de solo GET)

**Documentación**

- Documentación exhaustiva tipo SDD: arquitectura (ADRs), guías de ingeniería, quality gates,
  backlog de tickets, sistema de diseño, casos de uso, historias de usuario
- Honestidad autocrítica documentada: un supuesto de performance (chunk 3D "no bloqueaba el
  render") se registró como falso al medirlo, en vez de ocultarlo
- Procedimientos operativos codificados como skills reutilizables (cierre de tickets, nueva ADR,
  chequeo de contraste, auditoría de accesibilidad, etc.)

## Logros cuantificables (con evidencia real en el repo)

- **59 tests unitarios** (`src/test/*.test.ts`) cubriendo lógica de dominio crítica: validación
  de formulario de booking, parsing de catálogos de Spotify/YouTube, analítica GA4, SVG del
  isotipo, timing del preloader
- **16 Architecture Decision Records** documentados formalmente, incluyendo la resolución de
  **4 incidentes reales de corte de DNS** en el despliegue a producción
- Umbrales de **Lighthouse medidos y documentados** en `docs/quality-gates.md` (cifras reales de
  auditoría, no objetivos aspiracionales)

> Nota de honestidad: no hay evidencia de cobertura de tests en porcentaje ni de CI
> automatizado — es una decisión consciente y documentada por la escala del proyecto (una sola
> persona manteniéndolo), no una ausencia por descuido.
