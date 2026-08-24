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
   * Scroll (vh) que consume cada card del mazo de Servicios — el "beat"
   * completo (espera + entrada), no la entrada sola.
   * Bajado de 40 a 16: con 40, el tramo de espera (donde solo gira el
   * isotipo, `1 - SERVICES_DECK_ENTRANCE_FRACTION` de cada beat) hacía la
   * sección larguísima — el pin se sostenía mucho más de lo que el
   * contenido necesitaba, mismo síntoma de fondo que el pin del Hero
   * (879aef8), aunque ahí era el pin soltándose antes de tiempo y acá es
   * al revés: sosteniéndose de más.
   */
  SERVICES_DECK_BEAT_VH: 16,
  /** Alto (rem) al que se clava la primera card del mazo: despeja el navbar (h-16) con aire. */
  SERVICES_DECK_TOP_REM: 6,
  /**
   * Ancho (px) de una card del mazo. Deliberadamente angosta: solo lleva
   * índice + título (ver ServiceCard.tsx), no descripción ni botón — con 10
   * cards en abanico dentro de `Container` (`max-w-6xl`, la mitad del ancho
   * cedida al isotipo) no hay espacio real para repartir párrafos sin que
   * se tapen.
   */
  SERVICES_DECK_CARD_WIDTH_PX: 300,
  /**
   * Cuántas cards quedan visibles a la vez (la actual + esta cantidad de
   * anteriores) antes de que la más vieja desaparezca del todo. Con 10
   * servicios y el ancho real de `Container` no entran las 10 en abanico sin
   * que se conviertan en una franja ilegible de 40-50px cada una — la
   * versión que dejaba las 10 acumuladas se veía como una mancha en el
   * medio del mazo, ni siquiera las que estaban "tapadas pero legibles" se
   * distinguían. Con esto, una card se desvanece por completo (no solo su
   * título) en cuanto queda a más de esta profundidad de la card activa —
   * el mazo nunca muestra más de `SERVICES_DECK_VISIBLE_DEPTH + 1` cards.
   */
  SERVICES_DECK_VISIBLE_DEPTH: 3,
  /**
   * Desplazamiento horizontal (px) por índice — el abanico diagonal. Con
   * `SERVICES_DECK_VISIBLE_DEPTH` cards visibles a la vez (no las 10), el
   * ancho a repartir es `SERVICES_DECK_CARD_WIDTH_PX +
   * SERVICES_DECK_VISIBLE_DEPTH * este valor` — bastante menos que
   * `SERVICES_DECK_CARD_WIDTH_PX * total`, así que el paso puede ser
   * generoso sin desbordar la columna izquierda del mazo a 1024px (el
   * breakpoint más angosto donde el mazo se activa, ≈730px de ancho real).
   */
  SERVICES_DECK_FAN_STEP_X_PX: 90,
  /**
   * Desplazamiento vertical PERMANENTE (px) por índice — el reposo final de
   * cada card en el abanico. Chico a propósito frente al horizontal: es
   * solo el "canto" que arma la diagonal, no de dónde viene la card al
   * entrar (eso es `SERVICES_DECK_RISE_PX`).
   */
  SERVICES_DECK_FAN_STEP_Y_PX: 20,
  /**
   * Distancia (px) desde la que una card SUBE hasta su posición de reposo
   * al entrar — "de abajo hacia arriba", no un deslizamiento diagonal desde
   * la card anterior (esa fue la versión previa). Independiente del paso
   * del abanico (`SERVICES_DECK_FAN_STEP_Y_PX`): esto es el recorrido de la
   * animación de entrada, no el offset final entre cards.
   */
  SERVICES_DECK_RISE_PX: 64,
  /**
   * Escala a la que queda una card durante su propia entrada (0-1, sube a 1
   * al terminar). Deliberadamente sutil — el "encogimiento" no es lo que
   * separa una card tapada de una activa, es su opacidad
   * (SERVICES_DECK_CONTENT_OPACITY_MIN). Un scale más agresivo se leía como
   * que la card se "rompía", no como profundidad.
   */
  SERVICES_DECK_SCALE_MIN: 0.98,
  /**
   * Opacidad mínima del título de una card ya tapada por la siguiente — no
   * de la card completa. El marco (hud-frame + borde) se queda 100% nítido
   * siempre, y el índice numérico tampoco se atenúa nunca — ambos son lo
   * que mantiene el mazo legible como pila de cards reales. Bajo a
   * propósito (casi invisible, no "atenuado pero legible"): con 10 cards
   * superpuestas, varios títulos a la vez a media opacidad se acumulan en
   * ruido visual — mejor que solo el título de la card activa se lea, y el
   * resto quede como textura numerada.
   */
  SERVICES_DECK_CONTENT_OPACITY_MIN: 0.08,
  /**
   * Fracción de un "beat" (1/total del progreso) que ocupa la animación de
   * entrada de una card — el resto del beat es el tramo "de espera" donde
   * solo gira el isotipo. Subido de 0.24 a 0.4 junto con la baja de
   * `SERVICES_DECK_BEAT_VH`: con la espera más corta, no hace falta que sea
   * una fracción tan chica del beat para seguir sintiéndose "la mano gira,
   * después entra la card" en vez de un fundido parejo.
   */
  SERVICES_DECK_ENTRANCE_FRACTION: 0.4,
  /**
   * Aire (vh) después de que la ÚLTIMA card termina de entrar, antes de
   * soltar el pin. Chico a propósito: la entrada de la última card ya
   * termina justo al final del progreso del mazo (ver `entranceWindow` en
   * `ServiciosDeck.tsx`), así que esto es solo un respiro de lectura, no un
   * tramo muerto de scroll — el síntoma reportado (scroll de más después de
   * que la última card ya apareció) era exactamente por tener este valor
   * grande (15) sumado a que la última card terminaba su entrada al 90%
   * del progreso, no al 100%.
   */
  SERVICES_DECK_TAIL_VH: 6,
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
