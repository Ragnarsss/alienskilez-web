# Historias de Usuario — ALIENSKILEZ web

Fecha: 2026-08-12

## Convenciones

- ID: `HU-MOD-001`
- Prioridad: Alta, Media, Baja
- Estimación: Story Points (1, 2, 3, 5, 8, 13)
- Estado: Propuesta, Aprobada, En desarrollo, En prueba, **Cerrada**

## Actores

| Actor | Quién es | Qué busca |
|---|---|---|
| **Artista** | Actor primario. Músico independiente que necesita grabar, mezclar, masterizar o producir. Puede no haber pisado un estudio nunca. | Entender si este productor le sirve, cuánto le costaría, y llegar a hablar con alguien. |
| **Sello / Manager** | Actor primario secundario. Busca un estudio de confianza para sus artistas. | Evaluar trayectoria y capacidad antes de derivar trabajo. |
| **Productor** | Dueño del negocio (ALIENSKILEZ). No usa el sitio: lo mantiene. | Recibir leads calificados por WhatsApp y no repreguntar lo básico. |

## Backlog resumen

| ID | Módulo | Título corto | Prioridad | Valor (1-5) | SP | Dependencias | Estado |
|---|---|---|---|---|---|---|---|
| HU-BKG-001 | Booking | Contactar al productor con contexto | Alta | 5 | 8 | — | Cerrada |
| HU-NAV-001 | Navegación | Recorrer el sitio y llegar al CTA desde cualquier punto | Alta | 4 | 3 | — | Cerrada |
| HU-SRV-001 | Servicios | Entender qué se puede contratar | Alta | 5 | 5 | — | Cerrada |
| HU-EST-001 | Estudio | Saber quién está detrás | Alta | 4 | 2 | — | Cerrada |
| HU-PRO-001 | Proceso | Saber qué pasa después de escribir | Media | 4 | 2 | HU-BKG-001 | Cerrada |
| HU-FAQ-001 | FAQ | Resolver dudas antes de escribir | Media | 4 | 3 | — | Cerrada |
| HU-POR-001 | Portfolio | Escuchar y ver el trabajo | Media | 4 | 5 | — | Cerrada (con datos pendientes) |
| HU-TRA-001 | Trayectoria | Evaluar experiencia con datos verificables | Media | 3 | 3 | — | Cerrada (con datos pendientes) |
| HU-SEO-001 | SEO | Encontrar el estudio y compartirlo | Media | 3 | 2 | — | En desarrollo (falta `og:image`) |
| HU-MNT-001 | Mantenimiento | Actualizar el contenido sin tocar componentes | Alta | 4 | 3 | — | Cerrada |

## Épicas

| Épica | Historias |
|---|---|
| Conversión | HU-BKG-001, HU-NAV-001 |
| Persuasión | HU-SRV-001, HU-EST-001, HU-POR-001, HU-TRA-001 |
| Reducción de fricción | HU-PRO-001, HU-FAQ-001 |
| Alcance y mantenimiento | HU-SEO-001, HU-MNT-001 |

---

## HU-BKG-001 — Contactar al productor con contexto

> Como **artista interesado**, quiero enviar una solicitud indicando qué necesito y para cuándo,
> para empezar la conversación sin tener que explicar todo desde cero por WhatsApp.

- Épica: Conversión · Prioridad: **Alta** · 8 SP
- Dependencias: ninguna · Riesgo: **Alto** — es la única función del sitio; si falla, todo lo demás
  es decorado.
- RF: RF-BKG-001 a RF-BKG-005 · CU: CU-BKG-001, CU-BKG-002

### Criterios de aceptación

- **CA-01:** Dado que completo nombre y tipo de servicio, cuando envío, entonces se abre WhatsApp
  con un mensaje que me identifica e indica el servicio solicitado.
- **CA-02:** Dado que dejo el nombre vacío o el servicio sin elegir, cuando intento enviar,
  entonces el sistema me señala qué campo falta, junto al campo y anunciado por lector de pantalla.
- **CA-03:** Dado que elijo una fecha anterior a hoy, cuando envío, entonces el sistema la rechaza
  con un motivo claro.
- **CA-04:** Dado que agrego una fecha estimada y un detalle, cuando envío, entonces ambos
  aparecen en el mensaje; si los dejo vacíos, no aparecen líneas vacías.
- **CA-05:** Dado que se abrió WhatsApp, cuando reviso el chat, entonces el mensaje está escrito
  pero **no enviado** — puedo editarlo antes de mandarlo.

### Reglas de negocio

- RN-01: el verbo del mensaje depende del tipo de servicio: los de sesión se *agendan*, los de
  proyecto se *cotizan*.
- RN-02: el formulario arranca sin servicio preseleccionado, para forzar una elección consciente.
- RN-03: existe una opción de escape ("Otro / no estoy seguro") — alguien que no sabe qué necesita
  sigue siendo un lead válido y no debe quedar fuera.

### Datos
- Entrada: nombre (obligatorio), tipo de servicio (obligatorio), fecha estimada (opcional),
  detalle (opcional).
- Salida: chat de WhatsApp con el mensaje precargado.

---

## HU-NAV-001 — Recorrer el sitio y llegar al CTA desde cualquier punto

> Como **visitante**, quiero moverme entre secciones y tener siempre a la vista cómo contactar,
> para no perder el hilo ni tener que volver arriba cuando me decido.

- Épica: Conversión · Prioridad: **Alta** · 3 SP · RF: RF-NAV-001, RF-NAV-002 · CU: CU-NAV-001

### Criterios de aceptación

- **CA-01:** Dado que scrolleo, cuando paso el umbral, entonces el navbar toma fondo sólido y sigue
  fijo con el CTA visible.
- **CA-02:** Dado que hago clic en un enlace de navegación, cuando la página se desplaza, entonces
  la sección queda visible completa, sin quedar tapada por el navbar.
- **CA-03:** Dado que estoy en móvil, cuando abro el menú, entonces puedo navegar y el menú se
  cierra al elegir una opción.
- **CA-04:** Dado que navego solo con teclado, cuando presiono Tab desde el inicio, entonces el
  primer elemento es un enlace para saltar al contenido principal.

### Reglas de negocio
- RN-01: el CTA del navbar es siempre el primario ("Agenda tu sesión"), en toda la página.

---

## HU-SRV-001 — Entender qué se puede contratar

> Como **artista**, quiero ver con claridad qué servicios ofrece y de qué se trata cada uno, para
> saber si lo que necesito está acá antes de escribir.

- Épica: Persuasión · Prioridad: **Alta** · 5 SP · RF: RF-SRV-001 a RF-SRV-003 · CU: CU-SRV-001

### Criterios de aceptación

- **CA-01:** Dado que llego a Servicios, cuando la reviso, entonces veo las diez líneas con una
  descripción que explica el alcance de cada una.
- **CA-02:** Dado que un servicio me interesa, cuando miro su card, entonces tiene un CTA cuyo
  texto corresponde a cómo se contrata ese servicio.
- **CA-03:** Dado que busco precios, cuando recorro el sitio, entonces no encuentro tarifas pero sí
  la explicación de por qué se cotiza caso a caso.

### Reglas de negocio
- RN-01: **no se publican precios.** El costo depende del alcance y una tarifa publicada obligaría
  a desmentirla o a encajar proyectos que no calzan.
- RN-02: agregar o quitar un servicio es editar `constants/services.ts`, nunca un componente.

---

## HU-EST-001 — Saber quién está detrás

> Como **artista que nunca grabó acá**, quiero entender quién es el productor y cómo trabaja, para
> decidir si me da confianza antes de invertir tiempo y dinero.

- Épica: Persuasión · Prioridad: Alta · 2 SP · RF: RF-EST-001 · CU: CU-EST-001

### Criterios de aceptación
- **CA-01:** Dado que termino el hero, cuando sigo scrolleando, entonces encuentro quién es
  ALIENSKILEZ antes de que se me pida cualquier acción.
- **CA-02:** Dado que leo esa sección, cuando termino, entonces entiendo el diferencial concreto —
  un productor de autor que lleva todo el proceso, no una sala que se arrienda.

---

## HU-PRO-001 — Saber qué pasa después de escribir

> Como **artista que nunca reservó un estudio**, quiero saber qué pasa desde que envío el mensaje
> hasta que grabo, para no sentir que estoy dando un salto al vacío.

- Épica: Reducción de fricción · Prioridad: Media · 2 SP · RF: RF-PRO-001 · CU: CU-PRO-001

### Criterios de aceptación
- **CA-01:** Dado que dudo antes de escribir, cuando leo el proceso, entonces veo los cuatro pasos
  en orden y sé qué se espera de mí en cada uno.
- **CA-02:** Dado que leo el paso de cotización, cuando termino, entonces sé que recibiré un valor
  concreto y no una tarifa genérica.

---

## HU-FAQ-001 — Resolver dudas antes de escribir

> Como **artista**, quiero encontrar respondidas las dudas obvias, para no tener que preguntarlas
> ni quedarme con la duda y abandonar.

- Épica: Reducción de fricción · Prioridad: Media · 3 SP · RF: RF-FAQ-001 · CU: CU-FAQ-001

### Criterios de aceptación
- **CA-01:** Dado que llego al FAQ, cuando lo reviso, entonces encuentro cómo se cotiza, qué
  llevar, cuánto dura, si puedo reprogramar, si atienden a quien no tiene experiencia y si trabajan
  a distancia.
- **CA-02:** Dado que navego con teclado, cuando llego a una pregunta, entonces puedo abrirla con
  Enter sin necesitar mouse.

### Reglas de negocio
- RN-01: el FAQ nace de las preguntas que ya llegan por WhatsApp. Una pregunta nueva y repetida se
  agrega acá para dejar de responderla a mano.

---

## HU-POR-001 — Escuchar y ver el trabajo

> Como **artista o manager**, quiero escuchar producciones anteriores, para juzgar el resultado por
> mí mismo en vez de creer en adjetivos.

- Épica: Persuasión · Prioridad: Media · 5 SP · RF: RF-POR-001, RF-POR-002 · CU: CU-POR-001
- Estado: **Cerrada con datos pendientes** — la estructura funciona; faltan los créditos reales.

### Criterios de aceptación
- **CA-01:** Dado que llego a Trabajos, cuando la reviso, entonces veo una progresión temporal, no
  una grilla plana.
- **CA-02:** Dado que un trabajo tiene pista publicada, cuando lo abro, entonces puedo
  reproducirla sin salir del sitio.
- **CA-03:** Dado que un trabajo aún no tiene pista cargada, cuando lo veo, entonces aparece un
  marcador de pendiente, **nunca un reproductor roto**.
- **CA-04 (RF-POR-002, decidido pero aún no desplegado):** Dado que sale un lanzamiento nuevo en
  Spotify, cuando visito el sitio, entonces lo veo reflejado sin que nadie haya tocado código —
  la arquitectura ya está definida en `architecture.md` §6 (ADR-11), falta el despliegue real
  (ALS-026 en `backlog.md`).

---

## HU-TRA-001 — Evaluar experiencia con datos verificables

> Como **manager que evalúa a quién derivar sus artistas**, quiero ver trayectoria en números y
> opiniones de otros artistas, para tomar la decisión con algo más que una impresión.

- Épica: Persuasión · Prioridad: Media · 3 SP · RF: RF-TRA-001, RF-TRA-002 · CU: CU-TRA-001
- Estado: **Cerrada con datos pendientes.**

### Criterios de aceptación
- **CA-01:** Dado que existen cifras reales, cuando llego a Alcance, entonces las veo destacadas
  con su etiqueta.
- **CA-02:** Dado que **no** existen cifras reales todavía, cuando llego a Alcance, entonces veo
  marcadores explícitos de dato pendiente y **ninguna cifra inventada**.
- **CA-03:** Dado que soy el Productor y voy a llenar una cifra, cuando abro las constantes,
  entonces cada métrica documenta de dónde sale el número.

### Reglas de negocio
- RN-01: **jamás se publica una cifra o testimonio ficticio.** "Lanzamientos producidos" es
  verificable por cualquiera en Spotify; una cifra falsa se desmiente sola.
- RN-02: un testimonio se publica solo con cita textual y autorización de su autor.

---

## HU-SEO-001 — Encontrar el estudio y compartirlo

> Como **artista buscando un estudio en La Serena**, quiero encontrar el sitio y que se vea bien al
> compartirlo, para llegar y para pasárselo a mi banda.

- Épica: Alcance · Prioridad: Media · 2 SP · RF: RF-SEO-001
- Estado: **En desarrollo** — falta `og:image` (ALS-016) y JSON-LD (ALS-017).

### Criterios de aceptación
- **CA-01:** Dado que busco "productor musical La Serena", cuando aparece el sitio, entonces el
  título y la descripción dicen qué hace y dónde.
- **CA-02:** Dado que comparto el enlace por WhatsApp, cuando se genera la vista previa, entonces
  incluye título, descripción **e imagen**. ❌ *No cumple todavía.*

---

## HU-MNT-001 — Actualizar el contenido sin tocar componentes

> Como **Productor**, quiero cambiar servicios, portfolio, cifras o el número de WhatsApp editando
> un solo lugar, para no depender de alguien que entienda React cada vez que cambia algo.

- Épica: Mantenimiento · Prioridad: **Alta** · 3 SP · RF: RNF-MNT-001

### Criterios de aceptación
- **CA-01:** Dado que quiero cambiar el número de WhatsApp, cuando lo busco, entonces está en un
  único archivo y en ningún otro lado.
- **CA-02:** Dado que agrego un trabajo al portfolio, cuando edito la constante, entonces aparece
  en el sitio sin tocar ningún componente.
- **CA-03:** Dado que el número sigue siendo el placeholder, cuando levanto el sitio en desarrollo,
  entonces el formulario me avisa — y ese aviso **no** aparece en producción.

---

## Documentos relacionados

- [`rf-rnf-catalogo.md`](./rf-rnf-catalogo.md) — requisitos formales que estas historias satisfacen.
- [`casos-uso.md`](./casos-uso.md) — flujos detallados de cada historia.
- [`backlog.md`](./backlog.md) — tickets técnicos que las implementan.
