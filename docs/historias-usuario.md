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

---

# Historias propuestas (mejoras, sin construir)

Alcance nuevo. Todas en estado **Propuesta**: definidas y justificadas, sin una línea escrita.

El criterio para priorizarlas es el mismo que rige todo el sitio: **¿acerca al visitante a escribir
por WhatsApp?** Una mejora que solo se ve linda va abajo, por buena que sea.

| ID | Módulo | Título corto | Prioridad | Valor (1-5) | SP | Depende de | Estado |
|---|---|---|---|---|---|---|---|
| HU-AUD-001 | Audio | Oír la diferencia antes de contratar | **Alta** | **5** | 8 | — | Propuesta |
| HU-PLT-001 | Plataformas | Ver el catálogo real y actualizado | **Alta** | 4 | 13 | ALS-031 (AWS) | Propuesta |
| HU-BKG-002 | Booking | Mandar una referencia de sonido | Media | 4 | 3 | — | Propuesta |
| HU-AUD-002 | Audio | Seguir escuchando mientras recorro | Media | 3 | 5 | HU-AUD-001 | Propuesta |
| HU-ANL-001 | Analítica | Saber qué convierte y qué no | Media | 4 | 3 | Tráfico real | Propuesta |
| HU-VIS-001 | Visual | Que el sitio se sienta un producto cuidado | Baja | 2 | 8 | — | Propuesta |

---

## HU-AUD-001 — Oír la diferencia antes de contratar

> Como **artista que evalúa a quién confiarle su mezcla**, quiero escuchar el mismo fragmento antes
> y después del trabajo del productor, para juzgar por mis oídos en vez de creerle a un texto.

- Épica: Persuasión · Prioridad: **Alta** · 8 SP · Valor 5
- RF: RF-AUD-001, RNF-AUD-001 · CU: CU-AUD-001 · Ticket: ALS-033

**Por qué es la mejora de mayor impacto del backlog.** Un productor vende una diferencia audible.
Hoy el sitio la *afirma* de tres formas —copy, cifras, testimonios— y ninguna deja comprobarla. El
comparador A/B es la única pieza que convierte una afirmación en evidencia, en diez segundos y sin
que el visitante tenga que confiar en nadie.

### Criterios de aceptación

- **CA-01:** Dado que estoy reproduciendo un fragmento, cuando alterno entre "antes" y "después",
  entonces el audio cambia **manteniendo la posición** — no vuelve a empezar.
- **CA-02:** Dado que comparo dos versiones, cuando escucho, entonces la diferencia que percibo es
  de calidad y no de volumen: los niveles están emparejados.
- **CA-03:** Dado que llego a la sección, cuando la página carga, entonces **no se descargó ningún
  audio** hasta que yo lo pida.
- **CA-04:** Dado que estoy en móvil con datos, cuando reproduzco, entonces el fragmento es corto
  (referencia: 15-30 s) y no un track completo.

### Reglas de negocio
- RN-01: **emparejar niveles es obligatorio.** Un "después" más fuerte suena mejor aunque no lo
  sea; publicarlo así sería el equivalente sonoro de inventar una cifra (ADR-6).
- RN-02: el fragmento requiere autorización del artista dueño del track, igual que un testimonio.

---

## HU-PLT-001 — Ver el catálogo real y actualizado

> Como **visitante**, quiero ver lo último que el productor publicó de verdad, para saber si sigue
> activo y qué está haciendo ahora.
>
> Como **Productor**, quiero que eso se actualice solo cuando publico en Spotify o YouTube, para no
> tener que acordarme de editar el sitio cada vez.

- Épica: Persuasión + Mantenimiento · Prioridad: **Alta** · 13 SP · Valor 4
- RF: RF-PLT-001, RF-PLT-002, RF-PLT-003, RNF-PLT-001, RNF-SEG-002 · CU: CU-PLT-001
- Tickets: ALS-026 (Spotify), ALS-027 (YouTube), ALS-031 (infraestructura)
- **Bloqueada por el Productor:** cuenta de AWS, Spotify Artist ID y registro de la app.

**Estado real, dicho claro:** esto se planteó, tiene una ADR que fija el diseño (ADR-11) y **no
tiene una sola línea escrita**. Una versión anterior de la documentación afirmaba que el handler
existía; no era cierto y quedó corregido.

### Criterios de aceptación

- **CA-01:** Dado que el Productor publica un lanzamiento en Spotify, cuando entro al sitio,
  entonces aparece sin que nadie haya tocado código ni desplegado.
- **CA-02:** Dado que la plataforma no responde, cuando entro, entonces veo el portfolio curado
  manualmente — **nunca un error ni una sección vacía**.
- **CA-03:** Dado que el catálogo está cargando, cuando espero, entonces veo un esqueleto con la
  forma del contenido, no un salto de layout.
- **CA-04:** Dado que soy alguien curioso mirando el código del sitio, cuando reviso el bundle,
  entonces **no encuentro ningún secreto** de Spotify ni de YouTube.

### Reglas de negocio
- RN-01: el contenido curado manualmente **no se borra** al conectar la plataforma. Convive: la API
  aporta novedad, la curaduría aporta criterio — un lanzamiento reciente no es necesariamente el
  mejor trabajo.
- RN-02: los secretos viven en el servidor. Es lo único que obliga a tener una función serverless
  en un sitio que por lo demás es estático (ADR-11).

---

## HU-BKG-002 — Mandar una referencia de sonido

> Como **artista**, quiero adjuntar un enlace a un track que me gusta como referencia, para
> explicar en un link lo que me costaría tres párrafos.

- Épica: Conversión · Prioridad: Media · 3 SP · Valor 4
- RF: RF-BKG-006 · CU: CU-BKG-001 · Ticket: ALS-036

**Por qué vale:** "quiero que suene tipo X" es la forma en que los artistas realmente explican lo
que buscan. Capturarlo en el formulario mejora la calidad del lead y le ahorra al Productor una
ronda entera de repreguntas.

### Criterios de aceptación
- **CA-01:** Dado que pego un enlace de Spotify, YouTube o Drive, cuando envío, entonces viaja en
  el mensaje de WhatsApp como línea propia.
- **CA-02:** Dado que pego algo que no es un enlace, cuando envío, entonces el sistema me lo dice
  antes de continuar.
- **CA-03:** Dado que no tengo referencia, cuando envío, entonces el campo se omite del mensaje —
  sigue siendo opcional.

---

## HU-AUD-002 — Seguir escuchando mientras recorro

> Como **visitante**, quiero que la pista que puse siga sonando mientras sigo leyendo el sitio,
> para no tener que elegir entre escuchar y avanzar hacia el formulario.

- Épica: Persuasión · Prioridad: Media · 5 SP · Valor 3
- RF: RF-AUD-002 · CU: CU-AUD-002 · Ticket: ALS-034 · Depende de HU-AUD-001

**Por qué vale para la conversión:** hoy escuchar y avanzar compiten. Si el audio sobrevive al
scroll, el visitante puede llegar al formulario **con la música del productor sonando** — que es
exactamente el estado mental en el que uno decide contratarlo.

### Criterios de aceptación
- **CA-01:** Dado que hay una pista sonando, cuando scrolleo fuera de Portfolio, entonces aparece
  un control persistente que dice qué suena y permite pausar.
- **CA-02:** Dado que el control está visible, cuando llego al formulario, entonces **no tapa
  ningún campo ni el botón de envío**.
- **CA-03:** Dado que no hay nada sonando, cuando recorro el sitio, entonces el control no existe.

---

## HU-ANL-001 — Saber qué convierte y qué no

> Como **Productor**, quiero saber cuántos visitantes llegan al formulario y cuántos abren
> WhatsApp, para decidir cambios con datos en vez de con intuición.

- Épica: Medición · Prioridad: Media · 3 SP · Valor 4
- RF: RF-ANL-001, RNF-ANL-001 · CU: CU-ANL-001 · Ticket: ALS-023

**Por qué recién ahora:** estuvo diferido a propósito desde el principio, con el argumento de que
instrumentar sin tráfico es medir a ciegas. Ese argumento vence en el momento en que el sitio se
publique (ALS-022) y empiece a recibir visitas reales.

### Criterios de aceptación
- **CA-01:** Dado que un visitante hace clic en un CTA, cuando reviso el panel, entonces sé si fue
  "Agenda tu sesión" o "Cotiza tu proyecto".
- **CA-02:** Dado que alguien envía el formulario, cuando reviso, entonces distingo envíos válidos
  de intentos con error de validación.
- **CA-03:** Dado que soy un visitante, cuando entro al sitio, entonces **no veo ningún banner de
  cookies** — la medición no puede costar fricción justo antes del CTA.

### Reglas de negocio
- RN-01: sin datos personales, sin cookies, sin fingerprinting. Métricas agregadas.

---

## HU-VIS-001 — Que el sitio se sienta un producto cuidado

> Como **visitante**, quiero que el sitio se sienta pulido en los detalles, porque si el sitio de un
> profesional del audio se siente descuidado, me hace dudar de su trabajo.

- Épica: Refinamiento · Prioridad: **Baja** · 8 SP · Valor 2
- RNF: RNF-VIS-001 · Tickets: ALS-037 a ALS-042

**Por qué es Baja pese a ser real.** El argumento —el sitio de un productor comunica su estándar de
calidad— es cierto, pero de segundo orden: ninguno de estos ítems hace que alguien escriba que no
iba a escribir. Van después de todo lo que sí mueve la aguja, y el primero de la lista (fotos
reales del estudio) vale más que los otros cinco juntos.

### Criterios de aceptación
- **CA-01:** Dado que activo `prefers-reduced-motion`, cuando recorro el sitio, entonces **ningún**
  refinamiento nuevo se mueve.
- **CA-02:** Dado que cualquiera de estos cambios entra, cuando corro el checklist de calidad,
  entonces el contraste y el foco visible siguen cumpliendo.
- **CA-03:** Dado que se suma un refinamiento, cuando mido el bundle, entonces el JS inicial no
  sube de su umbral por una mejora decorativa.

---

## Documentos relacionados

- [`rf-rnf-catalogo.md`](./rf-rnf-catalogo.md) — requisitos formales que estas historias satisfacen.
- [`casos-uso.md`](./casos-uso.md) — flujos detallados de cada historia.
- [`backlog.md`](./backlog.md) — tickets técnicos que las implementan.
