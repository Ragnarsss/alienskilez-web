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
  SERVICES_DECK_CARD_WIDTH_PX: 280,
  /**
   * Alto (px) de una card del mazo — ver `SERVICES_DECK_CARD_WIDTH_PX`.
   * Presupuesto real verificado con Playwright: heading + CTA + esta altura
   * + `SERVICES_DECK_VISIBLE_DEPTH * FAN_STEP_Y_PX` de cascada tienen que
   * entrar en el `min-h-svh` del sticky SIN recortarse — el primer valor
   * (380) se probó y la card de más atrás quedaba cortada contra el borde
   * inferior del viewport en una pantalla de 900px de alto, así que bajó a
   * este número junto con `FAN_STEP_Y_PX` más chico.
   */
  SERVICES_DECK_CARD_HEIGHT_PX: 340,
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
  SERVICES_DECK_FAN_STEP_X_PX: 80,
  /** Desplazamiento vertical (px) por paso de la cascada — mismo criterio que `SERVICES_DECK_FAN_STEP_X_PX`. */
  SERVICES_DECK_FAN_STEP_Y_PX: 20,
  /**
   * Rotación (grados) por paso de la cascada — pieza que faltaba por
   * completo en las iteraciones anteriores y es gran parte de por qué no se
   * leía como un abanico de cartas real: en la referencia cada card está
   * tirada con un ángulo levemente distinto, no solo desplazada en x/y. La
   * card recién entrada (paso 0, al frente) no tiene rotación — se ve
   * derecha, como recién puesta encima — y cada paso que retrocede suma
   * este valor de tilt, hasta `VISIBLE_DEPTH * este valor` en la card más
   * vieja todavía visible.
   */
  SERVICES_DECK_FAN_ROTATE_STEP_DEG: 4,
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
   * posición/rotación, no el tamaño.
   */
  SERVICES_DECK_SCALE_MIN: 0.98,
  /**
   * Fracción de un "beat" (1/total del progreso) que ocupa la animación de
   * entrada de una card — el resto del beat es el tramo "de espera" donde
   * solo gira el isotipo, sintiéndose como "la mano gira, después entra la
   * card" en vez de un fundido parejo.
   */
  SERVICES_DECK_ENTRANCE_FRACTION: 0.4,
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
