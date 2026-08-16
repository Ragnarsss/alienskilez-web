/** Límites y umbrales. Nunca literales sueltos en schemas ni componentes. */
export const LIMITS = {
  BOOKING_NAME_MIN_LENGTH: 2,
  BOOKING_NAME_MAX_LENGTH: 80,
  BOOKING_MESSAGE_MAX_LENGTH: 600,
  /** Scroll en píxeles a partir del cual el navbar toma fondo sólido. */
  NAVBAR_SCROLLED_OFFSET: 24,
  /** Duración (s) del suavizado de Lenis — cinematográfico medio, no glacial. */
  LENIS_DURATION: 1.1,
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
   * Scroll (vh) que consume cada card del mazo de Servicios.
   * Con 10 servicios, 40 deja el recorrido en ~4 pantallas: suficiente para
   * que cada card se lea sola, sin convertir la sección en un túnel.
   */
  SERVICES_DECK_BEAT_VH: 40,
  /** Alto (rem) al que se clava la primera card del mazo: despeja el navbar (h-16) con aire. */
  SERVICES_DECK_TOP_REM: 6,
  /** Desplazamiento vertical (px) por índice — el "canto" visible de cada card ya apilada. */
  SERVICES_DECK_FAN_STEP_Y_PX: 12,
  /** Desplazamiento horizontal (px) por índice: convierte la pila en un abanico diagonal. */
  SERVICES_DECK_FAN_STEP_X_PX: 14,
  /** Escala a la que queda una card ya tapada. No baja más: el fondo del mazo no se sigue encogiendo. */
  SERVICES_DECK_SCALE_MIN: 0.92,
  /** Opacidad a la que queda una card ya tapada — atenuada pero todavía legible como parte de la pila. */
  SERVICES_DECK_OPACITY_MIN: 0.45,
  /** Aire (vh) después de la última card del mazo, para no saltar de golpe a la sección siguiente. */
  SERVICES_DECK_TAIL_VH: 15,
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
