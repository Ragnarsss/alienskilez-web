# Guía de ingeniería — ALIENSKILEZ web

Fecha: 2026-08-12
Estado: activo y vinculante.
Alcance: **cómo** se escribe código acá. Qué se construye lo fija
[`backlog.md`](./backlog.md); las decisiones cerradas, [`architecture.md`](./architecture.md).

Este documento no inventa reglas: formaliza lo que el código ya hace y lo convierte en checklist
verificable. Donde una regla nace de un problema concreto que ya se enfrentó, se dice cuál.

## 1. TDD — test primero donde hay lógica que puede fallar

**No es dogma.** "Es frontend, hay poca lógica de negocio" es cierto y por eso mismo la regla
tiene que ser precisa, no un porcentaje de cobertura arbitrario.

La pregunta correcta no es *"¿es front o back?"* sino **"¿esto puede estar mal sin que se note?"**.

| Tipo de código | Regla | En este repo |
|---|---|---|
| Función pura de dominio | **Test primero.** Sin DI, sin I/O, sin React — testeable aislada. | `buildWhatsAppMessage()`, `todayAsInputValue()` |
| Schema de validación | **Test primero**, casos válidos e inválidos. | `booking.schema.ts` |
| Hook con orquestación | Test si tiene ramas reales; si solo cablea RHF, alcanza con testear el schema y la función pura que invoca. | `useBookingForm` — cubierto vía sus dos piezas |
| Componente presentacional | **No se testea.** Un `<section>` que mapea un array de constantes no tiene comportamiento que un test unitario pueda proteger. | Las 11 secciones |
| Primitivo de UI | No se testea salvo que tenga lógica de variantes no trivial. | `Button`, `Section`, `Kicker` |

**Estado real:** 24 tests en `src/test/booking.schema.test.ts`, todos sobre las dos piezas de la
primera y segunda fila. Cero tests de componentes, deliberadamente.

Casos que **sí** valieron un test y que ilustran el criterio:
- Que `serviceType: ""` (el valor del `<option>` vacío) sea rechazado — si no, un lead llega sin
  servicio y el mensaje de WhatsApp queda incompleto.
- Que una fecha anterior a hoy sea rechazada — una fecha pasada en una solicitud de reserva es un
  dato inútil que hay que repreguntar.
- Que `message: "   "` (solo espacios) no genere la línea `Detalle:` vacía en el mensaje.
- Que `BOOKING_DEFAULT_VALUES` **no** pase la validación — garantiza que el formulario arranque
  exigiendo una elección consciente.

**Regla dura:** ningún cambio que toque `features/booking/` se mergea sin test verde.

### Cuándo escribir un test que hoy no existe

Si aparece cualquiera de estos, hay lógica nueva y necesita test antes que implementación:

- Una función que transforma datos y se puede llamar sin montar React.
- Una condición de negocio con más de dos ramas.
- Una corrección de un bug reportado — el test que lo reproduce se escribe **primero** (en rojo),
  para que quede claro que el fix es real.

## 2. Separación de responsabilidades (SoC)

**El componente nunca orquesta.** Ésta es la regla de la que dependen casi todas las demás.

| Capa | Responsabilidad | Ejemplo real |
|---|---|---|
| Componente de sección | Renderiza y delega eventos. Cero validación, cero armado de URLs, cero `fetch`. | `Contacto.tsx` |
| Hook de feature | Orquesta el caso de uso: arma el form, invoca la función pura, ejecuta el efecto externo. | `useBookingForm.ts` |
| Función pura | Lógica sin I/O ni DI. | `buildWhatsAppMessage()` |
| Schema | Reglas de validación, sin efectos. | `booking.schema.ts` |
| Constantes | Datos de negocio y límites. Nunca literales sueltos. | `shared/constants/*` |
| Primitivo de UI | Presentación reutilizable con API `variant`/`size` consistente. | `ui/Button.tsx` |

Verificación rápida: **si un archivo `.tsx` contiene la palabra `wa.me`, `zodResolver`, o una
expresión regular de validación, está mal ubicado.**

### Regla de honestidad (contra la sobre-ingeniería)

No se crea una capa nueva hasta que exista una duplicación o complejidad **ya observada dos
veces**. Ejemplos de capas que deliberadamente **no** existen acá:

- No hay "cliente de infraestructura" para WhatsApp: armar una URL y llamar `window.open` son dos
  líneas. `buildWhatsAppMessage()` sí se extrajo, porque compone varias partes con reglas —
  eso es lógica real y testeable.
- No hay interfaz ni clase abstracta con un solo implementador. Una interfaz sin segunda
  implementación es ceremonia, no SOLID.
- No hay store global. Ninguna pieza de estado se comparte entre secciones.

## 3. KISS

- Preferir el idiom directo de React/Tailwind sobre abstracciones propias.
- **Un cambio, un propósito.** Es la base de que los commits sean atómicos (§8).
- Antes de agregar una dependencia, preguntarse si el problema se resuelve con lo que ya está.
  Precedentes reales en este repo: `cn()` son 3 líneas en vez de `clsx`; el starfield es CSS puro
  en vez de un canvas con JS; `no-restricted-imports` del core en vez de `eslint-plugin-import`.
- Si dudás si algo es sobre-ingeniería, aplicá la regla de §2: ¿ya se repitió dos veces?

## 4. DRY, con criterio

**Sí es DRY:**
- Los datos de negocio viven una sola vez en `shared/constants/` y se importan. El `tier` de un
  servicio gobierna a la vez el copy del botón y el verbo del mensaje de WhatsApp — un solo dato,
  dos consumidores.
- Los anchors de scroll salen de `SECTION_IDS` + `anchor()`; ningún `href="#..."` literal.
- Los límites de validación (`LIMITS`) los comparten el schema y el contador de caracteres del
  textarea.
- Las clases de campo de formulario están en la constante `FIELD` de `Contacto.tsx`, no repetidas
  en cada `<input>`.

**No es violación de DRY:**
- Que dos secciones repitan una estructura de grilla similar. Extraer un componente genérico
  `<CardGrid>` para dos usos con necesidades distintas cuesta más de lo que ahorra.
- Que un texto de UI aparezca una sola vez en su componente. No hay i18n; un string visual usado
  una vez no es una constante.

## 5. SOLID aplicado a este frontend

- **S — Responsabilidad única.** Un archivo, una razón de cambio. `booking.schema.ts` cambia si
  cambian las reglas de validación; `useBookingForm.ts` cambia si cambia el canal de contacto.
  Que hoy sean dos archivos y no uno es exactamente esto.
- **O — Abierto/cerrado.** Agregar un servicio es agregar una entrada a `SERVICES`, no ramificar
  con un `if` dentro de `Servicios.tsx`. Agregar una sección es un archivo nuevo más una línea en
  `App.tsx`. Si agregar contenido obliga a editar lógica, el diseño está mal.
- **L — Sustitución.** Relevante en `Button`: la variante `href` (renderiza `<a>`) y la variante
  sin `href` (renderiza `<button>`) deben aceptar el mismo `variant`/`size`/`className` y
  comportarse igual visualmente. Si una variante necesitara *menos* props que la otra, no debería
  compartir el componente.
- **I — Segregación de interfaces.** Props angostas y específicas. `Section` recibe
  `kicker`/`title`/`description` opcionales en vez de un objeto `config` gigante.
- **D — Inversión de dependencias.** Los componentes dependen de **datos**, no de fuentes.
  `Portfolio.tsx` no sabe si `PORTFOLIO_ITEMS` viene de un archivo, de un CMS o de una API — si
  algún día viene de otro lado, cambia el módulo de constantes, no la sección.

## 6. Constantes y *magic strings*

Criterios adaptados de las auditorías de `radarop-front`, recortados a lo que este stack tiene
(no hay router, ni `localStorage`, ni query params, ni backend).

### Qué SÍ debe ser constante

| Categoría | Prioridad | Dónde vive | Estado |
|---|---|---|---|
| Datos de negocio (nombre, ciudad, redes, servicios) | **P0** | `constants/site.ts`, `constants/services.ts` | ✅ |
| Número de WhatsApp y builder de la URL | **P0** | `constants/whatsapp.ts` | ✅ |
| Anchors de scroll y enlaces de navegación | **P0** | `constants/sections.ts` | ✅ |
| Conjuntos finitos de valores (`tier`, ids de servicio) | **P0** | `constants/services.ts`, con `as const` | ✅ |
| Límites de validación, umbrales, timeouts | **P1** | `constants/limits.ts` | ✅ |
| Copy estructural repetido (CTA, pasos, FAQ) | **P1** | `constants/content.ts` | ✅ |
| Contenido pendiente (portfolio, métricas, testimonios) | **P1** | `constants/{portfolio,alcance,testimonials}.ts` | ✅ |

### Qué NO debe extraerse

Un string puramente visual, usado una sola vez, dentro del componente al que pertenece —
`<h3>Dirección, no solo botones</h3>` se queda donde está. Extraerlo a una constante no aporta
nada sin i18n y aleja el texto de su contexto.

**La pregunta para decidir:** *¿este string tiene significado semántico para la lógica, o es solo
lo que el usuario lee?* Si lo compara un `if`, lo usa una clave, o se repite en dos lugares → es
constante. Si solo se pinta → se queda.

### Requisitos técnicos

- `as const` en todo objeto o array de constantes.
- `satisfies` cuando exista un tipo que deba validarlas: `SERVICES` usa
  `as const satisfies readonly Service[]` — conserva los literales y valida la forma.
- Tipos inferidos, nunca duplicados a mano: `type BookingFormValues = z.infer<typeof bookingSchema>`.

## 7. Reglas específicas del stack

### React Compiler (vinculante, ver ADR-3 y ADR-4)

- **Prohibido `useMemo`, `useCallback` y `React.memo` manuales.** La regla
  `react-hooks/preserve-manual-memoization` es `error`. El compilador memoiza por vos.
- **Prohibido cómputo impuro en el cuerpo del componente** (`new Date()`, `Math.random()`,
  `crypto.randomUUID()`). Va a constante de módulo o dentro de un evento. Regla `react-hooks/purity`.
- **Prohibido `setState` dentro de un efecto** para derivar estado. Para estado externo
  (scroll, `matchMedia`, tamaño de ventana) → `useSyncExternalStore`, como en `useScrolled.ts`.

> ⚠️ El documento `performance.md` de `radarop-front` recomienda *"usar `useMemo` y `useCallback`
> para evitar re-renderizados"*. **Ese consejo no aplica acá y el lint lo rechaza.** Es correcto
> en un proyecto sin React Compiler; en éste, la memoización es responsabilidad del compilador.

### Tailwind v4

- Los tokens se definen **solo** en `@theme` dentro de `src/styles/index.css` (ADR-7).
- Prohibido el color arbitrario en un componente (`bg-[#08cb00]`). Si hace falta un valor nuevo,
  se agrega como token y se usa la utilidad generada.
- Preferir la utilidad canónica sobre la arbitraria: `py-section` en vez de `py-(--spacing-section)`,
  `scheme-dark` en vez de `[color-scheme:dark]`.

### TypeScript

- `strict: true` + `noUncheckedIndexedAccess`. Prohibido `any`; si un tipo externo es hostil, se
  acota con un tipo propio, no con `any`.
- Tipos derivados con `z.infer` / `typeof X[number]`, nunca redeclarados en paralelo.
- Alias `@/` obligatorio: `no-restricted-imports` rechaza `../*` (ADR-8).

### Accesibilidad (mínimo no negociable, detalle en `quality-gates.md`)

- Un solo `<h1>`, jerarquía `h2`/`h3` correcta por sección.
- Todo control de solo-ícono con `aria-label`.
- Errores de formulario con `role="alert"` + `aria-invalid` + `aria-describedby`.
- `<label>` real asociado por `htmlFor`, nunca solo `placeholder`.
- Foco visible con `:focus-visible`; el glow decorativo **no** reemplaza el anillo de foco.
- Toda animación respeta `prefers-reduced-motion`.

### Assets: son código, y pueden romperse en silencio

Un `.svg` que un componente parsea **no es una imagen, es una entrada de datos**. Vale las mismas
reglas que cualquier input.

Esta sección existe por un bug concreto que costó varias sesiones: un comentario de documentación
dentro de `alien-glyph.svg` contenía un doble guion, que XML prohíbe dentro de comentarios. El
`DOMParser` del navegador devolvía `parsererror`, la librería 3D no encontraba paths y abortaba
**sin lanzar ninguna excepción ni escribir nada en consola**. Solo un canvas vacío.

Reglas que quedan:

- **No pongas comentarios en un SVG que se parsea.** La documentación del asset va en el
  componente que lo consume, que es código y no puede romper el parseo de nada.
- **Todo asset parseado necesita un test.** `alien-glyph.test.ts` valida el `viewBox`, que haya
  un path con datos, el `fill-rule` y la ausencia de dobles guiones en comentarios. Son cuatro
  aserciones y habrían ahorrado todo el episodio.
- **Un test de regresión no vale hasta verlo fallar.** Reintroducí el bug, confirmá que el test se
  pone rojo, restaurá. Si no hiciste eso, no sabés qué está cubriendo.

### Diagnosticar comportamiento del navegador: cuidado con los parsers permisivos

Durante ese mismo bug usé `happy-dom` en Node para reproducir el parseo. Devolvía el resultado
correcto **porque es permisivo**: aceptaba el XML mal formado que el navegador rechazaba. Node
decía "1 forma", el navegador "0". Confié en esa medición y descarté la herramienta correcta
—dos veces— por un problema que no estaba en ella.

- Un entorno DOM emulado (`happy-dom`, `jsdom`) sirve para lógica que toca el DOM, **no** para
  decidir si algo funciona en un navegador real. Su tolerancia es distinta a propósito.
- Cuando el síntoma es "no se ve nada" y no hay excepción, la prioridad es **conseguir una señal
  real del navegador** antes de cambiar de enfoque. Una página de aislamiento que muestre el
  estado en pantalla resuelve en minutos lo que la especulación no resuelve en horas.
- Y antes de descartar una herramienta que el resto del mundo usa sin problemas, la hipótesis por
  defecto debería ser que el error está en cómo la estamos usando.

## 8. Definition of Done por ticket

1. `npm run lint` limpio.
2. `npm test` en verde (si el ticket tocó lógica).
3. `npm run build` limpio.
4. Criterios de aceptación del ticket verificados **de verdad** — corriendo el sitio, no
   "debería andar".
5. Checklist visual de [`quality-gates.md`](./quality-gates.md) si el ticket tocó UI.
6. `backlog.md` actualizado a `Estado: Hecho`.
7. Commit(s) atómico(s) referenciando el ticket (§9).

## 9. Convención de commits

Conventional Commits, con el ticket cuando el commit cierra o avanza uno:

```
feat(booking): valida que la fecha estimada no sea anterior a hoy (ALS-004)
fix(a11y): el glow de hover tapaba el anillo de foco en las cards (ALS-012)
docs(arquitectura): ADR-10 con los contrastes recalculados
chore(tooling): activa strict en los dos tsconfig
refactor(navbar): useSyncExternalStore en vez de useState+useEffect
test(booking): cubre el mensaje con solo espacios en blanco
```

Tipos: `feat`, `fix`, `refactor`, `test`, `docs`, `chore`, `style`.

Un commit = un cambio con un propósito verificable, donde `lint + build` pasan **en ese commit**,
no solo al final de la serie. Eso es lo que hace que "atómico" signifique algo.

**Rama:** `main` es la rama de producción. Trabajo en ramas `feat/…` o `fix/…` y merge cuando el
DoD de §8 esté completo.

## 10. Regla sobre los datos de negocio

Es específica de este proyecto y es la más importante de todas:

> **No se inventan datos de negocio.** Ni cifras de trayectoria, ni testimonios, ni créditos de
> portfolio, ni precios.

Si un dato no existe todavía, se publica con marcador visible (`[XX]`, `[Nombre del artista]`) y
`pending: true`. Un número plausible en un sitio de negocio es una afirmación falsa frente a un
cliente real, y "lanzamientos producidos" es verificable por cualquiera en Spotify.

Corolario práctico: **ningún componente debe romperse por un dato pendiente.** Si `embedUrl` está
vacío, se renderiza un marcador, no un `<iframe>` roto; si una red social no tiene URL confirmada,
el enlace no se renderiza. Ver ADR-6.

## 11. Documentos relacionados

- [`architecture.md`](./architecture.md) — decisiones cerradas (ADR) que estas reglas aplican.
- [`design-system.md`](./design-system.md) — tokens y contrastes.
- [`quality-gates.md`](./quality-gates.md) — umbrales y checklists previos a desplegar.
- [`backlog.md`](./backlog.md) — plan de trabajo y estado por ticket.
