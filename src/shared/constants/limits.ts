/** Límites y umbrales. Nunca literales sueltos en schemas ni componentes. */
export const LIMITS = {
  BOOKING_NAME_MIN_LENGTH: 2,
  BOOKING_NAME_MAX_LENGTH: 80,
  BOOKING_MESSAGE_MAX_LENGTH: 600,
  /** Scroll en píxeles a partir del cual el navbar toma fondo sólido. */
  NAVBAR_SCROLLED_OFFSET: 24,
  /**
   * Intensidad (0-1) del suavizado por frame de Lenis. Reemplaza al viejo
   * `duration`+`easing` (tween a tiempo fijo): con duración fija, un scroll
   * cortito tardaba lo mismo que uno largo, y eso se sentía raro. El `lerp`
   * es continuo y se adapta solo a cualquier distancia — la sensación
   * "líquida" de sitios como lenis.darkroom.engineering. Más bajo = más
   * flotante/lento en asentarse; 0.1 es el default de la librería y un punto
   * medio razonable entre "responsivo" y "con inercia real".
   */
  LENIS_LERP: 0.1,
  /** Paralaje vertical (px) de la capa de estrellas lejana del Hero. */
  HERO_PARALLAX_FAR_PX: 130,
  /** Paralaje vertical (px) de la capa de estrellas media del Hero. */
  HERO_PARALLAX_MID_PX: 300,
  /** Paralaje vertical (px) de la capa de estrellas cercana del Hero. */
  HERO_PARALLAX_NEAR_PX: 520,
  /** Escala máxima del cielo del Hero al final del scroll-pin — sensación de avanzar hacia adelante. */
  HERO_SKY_ZOOM_SCALE: 1.2,
  /** Alto (vh) del recorrido de scroll "extra" que ancla el Hero antes de soltar hacia Estudio. */
  HERO_PIN_RUNWAY_VH: 220,
  /** Duración (s) del scroll-reveal (headers y cards) — Section.tsx. */
  REVEAL_DURATION_S: 0.5,
  /** Margen de viewport para disparar el reveal del header de sección (más temprano que las cards). */
  REVEAL_VIEWPORT_MARGIN_HEADER: "-80px",
  /** Margen de viewport para disparar el reveal de cards individuales. */
  REVEAL_VIEWPORT_MARGIN_CARD: "-60px",
  /** Paso de delay (s) entre cada card de una grilla con stagger. */
  REVEAL_STAGGER_STEP_S: 0.06,
  /** Índice máximo que sigue sumando delay de stagger — evita que la última card de una grilla larga tarde de más. */
  REVEAL_STAGGER_MAX_INDEX: 5,
  /**
   * Presupuesto de scroll (vh) del pin del mazo de Servicios — mismo patrón
   * que `HERO_PIN_RUNWAY_VH`: un runway FIJO, no multiplicado por la
   * cantidad de servicios (`BEAT_VH * total`, la versión anterior). Con el
   * runway atado al conteo, el pin se sostenía varios cientos de vh más de
   * lo que el contenido necesitaba y la sección se sentía interminable —
   * `entranceWindow` ya reparte el progreso 0→1 en fracciones iguales
   * (`index / total`), así que el "ritmo" por card no depende de cuánto vh
   * tenga el runway, solo de cuántos servicios hay. Separar ambas cosas es
   * lo que permite que el runway sea corto (una sola pantalla de scroll,
   * como el Hero) sin apurar ninguna entrada.
   */
  SERVICES_DECK_RUNWAY_VH: 160,
  /**
   * Ancho (px) de una card del mazo. Angosta a propósito: solo lleva índice
   * + título (ver ServiceCard.tsx) — con 10 cards en cascada no hay espacio
   * real para repartir párrafos sin que se tapen. Proporción cercana a la
   * referencia (lenis.darkroom.engineering — cards altas, no cuadradas).
   */
  SERVICES_DECK_CARD_WIDTH_PX: 350,
  /**
   * Alto (px) de una card del mazo — ver `SERVICES_DECK_CARD_WIDTH_PX`.
   * Presupuesto real verificado con Playwright: el heading ahora vive en su
   * propia esquina (arriba a la derecha, `ServiciosDeck.tsx`) y no compite
   * en la misma columna vertical que el mazo, así que esta altura sube
   * respecto a la iteración anterior sin recortarse contra el viewport.
   */
  SERVICES_DECK_CARD_HEIGHT_PX: 420,
  /**
   * Cuántos PASOS hacia atrás en la cascada quedan visibles antes de que una
   * card desaparezca del todo — no cuántas cards, `+ 1` de esto (la recién
   * entrada, en el paso 0) es el total de cards simultáneamente opacas, igual
   * que la referencia (5 cards a la vez, ninguna atenuada — la 4ª versión sí
   * atenuaba el título de las tapadas, y se leía como cards "muertas"; acá se
   * sacó esa atenuación, ver `ServiceCard.tsx`). Con 10 servicios, una card
   * recorre TODOS los pasos de la cascada (entra al frente, después retrocede
   * un paso cada vez que entra la siguiente) antes de desvanecerse del todo —
   * a diferencia de la 4ª versión, que reusaba un slot fijo por índice y
   * hacía que la card recién entrada "saltara" a la posición 0 en vez de
   * empujar visualmente a las anteriores hacia atrás.
   */
  SERVICES_DECK_VISIBLE_DEPTH: 4,
  /**
   * Desplazamiento horizontal (px) por PASO de la cascada. La card recién
   * entrada arranca en offset 0 — exactamente en la esquina de anclaje del
   * mazo (`right-0 bottom-0`, ver `ServiciosDeck.tsx`), la posición más al
   * frente — y cada vez que entra la SIGUIENTE card, esta retrocede un paso
   * más (`este valor` de offset, alejándose de esa esquina hacia el resto de
   * la pila), hasta desvanecerse del todo. Es la relación de la referencia
   * (lenis.darkroom.engineering): la card más reciente ("05") es la más al
   * frente Y la que menos se movió de la esquina; la más vieja todavía
   * visible ("01") es la que más retrocedió. La 4ª versión tenía esto
   * invertido (offset fijo por `index % slots`, la card nueva "saltaba" a
   * offset 0 de un slot reusado en vez de nacer ahí y retroceder).
   */
  SERVICES_DECK_FAN_STEP_X_PX: 55,
  /**
   * Desplazamiento vertical (px) por paso de la cascada — mismo criterio que
   * `SERVICES_DECK_FAN_STEP_X_PX`, pero deliberadamente MÁS GRANDE que el
   * horizontal: el usuario pidió explícitamente que la pila se lea como una
   * diagonal hacia ABAJO, no como el arco/curva que salía con un paso
   * horizontal dominante — bajar `FAN_STEP_X_PX` y subir este valor inclina
   * la dirección dominante de la cascada de "lateral" a "descendente".
   */
  SERVICES_DECK_FAN_STEP_Y_PX: 50,
  /**
   * Distancia (px) desde la que una card SUBE hasta su posición de reposo
   * al entrar — "de abajo hacia arriba". Se suma SOLO durante la ventana de
   * entrada propia de la card (ver `entranceWindow`); una vez asentada, el
   * resto de su recorrido es la cascada de retroceso (`FAN_STEP_*`, arriba),
   * no esto.
   */
  SERVICES_DECK_RISE_PX: 64,
  /**
   * Escala a la que queda una card durante su propia entrada (0-1, sube a 1
   * al terminar). Deliberadamente sutil — la profundidad la da la cascada de
   * posición, no el tamaño.
   */
  SERVICES_DECK_SCALE_MIN: 0.98,
  /**
   * Fracción de un "beat" (1/total del progreso) que ocupa la animación de
   * entrada de una card — el resto del beat es el tramo "de espera" donde
   * solo gira el isotipo, sintiéndose como "la mano gira, después entra la
   * card" en vez de un fundido parejo.
   */
  SERVICES_DECK_ENTRANCE_FRACTION: 0.4,
  /**
   * Radianes de YAW (eje Y, `rotationY` de `AlienMark3D`) que gira el isotipo
   * por cada "beat" de 2 cards — `rotationTotalSteps` (`ServiciosDeck.tsx`,
   * ≈ `total/2`) multiplica esto para fijar el swing TOTAL a lo largo de
   * todo el mazo, pero el giro en sí se reparte de forma CONTINUA con el
   * scroll, no en saltos — pedido explícito del usuario tras ver una
   * primera versión escalonada: "más suave, como el giro que uno le hace
   * manualmente al del Hero, solo que pineado al scroll". Sigue girando
   * SOLO con el scroll (no de forma autónoma, `animate="spin"` como antes).
   * En radianes porque así es como `3dsvg` espera `rotationX`/`rotationY`
   * (ver más abajo, es three.js).
   *
   * NEGATIVO: el primer intento (positivo) giraba "al revés" de lo
   * esperado — reportado por el usuario con una captura marcando el sentido
   * de giro deseado. `rotationY` de three.js es antihorario visto desde
   * +Z (la cámara), así que invertir el signo invierte el sentido del giro.
   *
   * Hubo un intento intermedio de bajar esto a `-0.1` (swing total ≈-28.6°
   * en vez de ≈-143°) para evitar que la extrusión (fina de profundidad)
   * se viera casi de canto cerca del final del scroll — revertido: el
   * usuario ya había visto y aprobado ESTE valor ("recién rotaba bonito")
   * antes de que se hiciera ese cambio, así que el swing grande se queda.
   * Si el colapso "de canto" al final vuelve a molestar, el ajuste fino va
   * por otro lado (menos recorrido de scroll dedicado a ese tramo, o un
   * tope que no deje pasar de cierto ángulo) antes de volver a achicar esto.
   */
  SERVICES_DECK_ALIEN_YAW_STEP_RAD: -0.5,
  /**
   * Radianes de PITCH (eje X, `rotationX`) que gira el isotipo por cada
   * "beat" de 2 cards, junto con el yaw de arriba (mismo criterio de
   * `rotationTotalSteps` × continuo, ver arriba). Deliberadamente distinto
   * (más chico) y de signo OPUESTO al yaw, no cero ni el mismo signo:
   * pedido explícito del usuario — "que se gire en sentido curvo
   * diagonal... que rote sobre el espacio, no solo por su eje vertical".
   * Combinar pitch+yaw de signo distinto traza una curva oblicua (no una
   * línea recta en un solo plano), que es la sensación de "giro
   * diagonal/orbital" pedida — con el mismo signo en los dos ejes el giro
   * se ve como una diagonal derecha, no como la curva oblicua que el
   * usuario dibujó en su captura.
   */
  SERVICES_DECK_ALIEN_PITCH_STEP_RAD: 0.22,
  /**
   * Tamaño (px, cuadrado) del isotipo detrás del mazo. Única fuente de
   * verdad para su ancho/alto — se usa tanto para el `style` inline del
   * wrapper (no una clase de Tailwind: necesita el mismo número en JS para
   * calcular el offset de centrado, ver `alienX`/`alienY` en
   * `ServiciosDeck.tsx`) como, indirectamente, para saber cuánto asoma más
   * allá de la pila (`stackWidth`/`stackHeight`) en cualquier momento del
   * scroll.
   */
  SERVICES_DECK_ALIEN_SIZE_PX: 800,
  /**
   * Distancia horizontal (px) que RECORRE el isotipo a lo largo de todo el
   * scroll del mazo — pedido explícito del usuario con una captura
   * marcando el recorrido: "que parta de un punto y se mueva más por lo
   * horizontal" hacia la derecha, terminando solapando un poco el heading.
   * Antes el isotipo solo giraba en el lugar (centrado, fijo); ahora
   * también viaja.
   */
  SERVICES_DECK_ALIEN_TRAVEL_X_PX: 380,
  /**
   * Desplazamiento vertical (px) máximo del arco del recorrido horizontal
   * de arriba — un dip suave a mitad de camino (progreso 0.5), no una
   * línea perfectamente recta, pero chico a propósito frente a
   * `TRAVEL_X_PX`: el usuario pidió que se mueva "más por lo horizontal",
   * no en diagonal pareja.
   */
  SERVICES_DECK_ALIEN_ARC_Y_PX: 40,
  /** Rigidez del spring que suaviza la barra de progreso de scroll (ALS-040). Más alto = sigue más de cerca. */
  SCROLL_PROGRESS_SPRING_STIFFNESS: 300,
  /** Amortiguación del spring de la barra de progreso — evita que rebote al frenar. */
  SCROLL_PROGRESS_SPRING_DAMPING: 40,
  /**
   * Presupuesto de scroll (vh) del pin del carrusel de Video (ALS-045, 2ª
   * iteración) — mismo criterio que `SERVICES_DECK_RUNWAY_VH`/
   * `HERO_PIN_RUNWAY_VH`: fijo, no multiplicado por la cantidad de videos.
   */
  VIDEO_CAROUSEL_RUNWAY_VH: 120,
  /**
   * Ancho (px) de una card del carrusel de Video — grande a propósito
   * (pedido explícito del usuario: "que sobresalga por los bordes", viendo
   * el showcase de referencia). El carrusel es full-bleed (`VideoCarousel.tsx`,
   * escapa del `Container`), así que este tamaño se mide contra el ancho
   * real de la ventana, no contra `max-w-6xl`.
   */
  VIDEO_CAROUSEL_CARD_WIDTH_PX: 640,
  /** Espacio (px) entre cards del carrusel de Video. */
  VIDEO_CAROUSEL_GAP_PX: 48,
  /**
   * Escala de la card que está exactamente centrada en la ventana del pin —
   * referencia visual explícita del usuario (lenis.darkroom.engineering
   * showcase): la card "actual" se ve más grande que sus vecinas, como foco
   * de una cámara. `1` en la referencia sería "sin foco" — se sube apenas
   * arriba de eso, sutil, no un zoom dramático.
   */
  VIDEO_CAROUSEL_FOCUS_SCALE_MAX: 1.05,
  /** Escala de una card lejos del centro del pin — ver `VIDEO_CAROUSEL_FOCUS_SCALE_MAX`. */
  VIDEO_CAROUSEL_FOCUS_SCALE_MIN: 0.9,
  /** Distancia (px) al centro de la ventana del pin a la que una card llega a `FOCUS_SCALE_MIN`. */
  VIDEO_CAROUSEL_FOCUS_RANGE_PX: 700,
  /**
   * Segundo (del video real) donde arranca la vista previa en hover del
   * carrusel — no en 0: el arranque de un video suele ser un logo/intro
   * estático, y el punto donde ya hay contenido real varía por video, así
   * que arrancar unos segundos adentro da más chance de mostrar algo con
   * movimiento en los 10s de loop.
   */
  VIDEO_CAROUSEL_PREVIEW_START_S: 5,
  /** Segundo donde corta el loop de la vista previa — `START_S` + 10s reales, pedido explícito del usuario. */
  VIDEO_CAROUSEL_PREVIEW_END_S: 15,
} as const

/** Media queries con nombre. Ningún string de breakpoint suelto en los componentes. */
export const MEDIA = {
  /**
   * Umbral del mazo de Servicios: coincide con `lg` de Tailwind, que es donde
   * la grilla ya pasa a tres columnas. Debajo de eso el mazo apilado obliga a
   * un recorrido largo en una pantalla chica, y la grilla simple gana.
   */
  DECK: "(min-width: 64rem)",
} as const

/**
 * Parámetros del isotipo 3D del Hero (HeroMark3D.tsx, ALS-028).
 * Separados de LIMITS porque no son límites de validación sino ajustes
 * visuales de una sola pieza — se tocan mirando el resultado, no el negocio.
 */
export const HERO_MARK = {
  /**
   * Color del isotipo. Espejo de `--color-accent` en styles/index.css.
   * Es la única excepción a ADR-7 y tiene motivo: Three.js pinta sobre un
   * canvas WebGL y no resuelve `var()` — pasarle la variable da negro, en
   * silencio. `theme.test.ts` falla si este valor deja de coincidir con el CSS.
   */
  COLOR: "#08cb00",
  /**
   * Suavizado de los bordes extruidos (0-1). Impacta MUCHO el costo: cada
   * paso sube los segmentos de curva y de bisel, y con esta silueta 0.6 daba
   * ~300.000 vértices contra ~110.000 de 0.3, sin diferencia visible al
   * tamaño que ocupa en el Hero.
   */
  SMOOTHNESS: 0.3,
  /** Velocidad del giro horizontal. Lento a propósito: acompaña, no distrae del copy. */
  SPIN_SPEED: 4,
  /**
   * Tramo del scroll-pin del Hero en el que el isotipo aparece (progreso
   * 0→1). Una vez revelado se queda — igual que el resto del contenido del
   * Hero (subtítulo, botones) — hasta que el pin se suelta y toda la
   * sección se va con el scroll normal. Antes se desvanecía solo, a mitad
   * del pin, "cediendo el foco a los CTA"; se sacó porque leía como que el
   * isotipo se rompía o se perdía opacidad justo antes de pasar a la
   * siguiente sección, no como una transición intencional.
   */
  REVEAL_STAGE: [0.02, 0.28] as [number, number],
} as const

/**
 * Tiempos del preloader de marca (Preloader.tsx, ALS-041).
 *
 * Son **espejo** de las custom properties de `.preloader` en styles/index.css,
 * que es donde vive la coreografía. Acá solo se necesita saber cuándo
 * desmontar. `preloader-timing.test.ts` falla si los dos lados se separan.
 */
export const PRELOADER = {
  /** Duración de la secuencia completa, hasta que el wordmark termina de asentarse. */
  TOTAL_MS: 3400,
  /** Desvanecido del overlay una vez terminada la secuencia. */
  EXIT_MS: 400,
} as const
