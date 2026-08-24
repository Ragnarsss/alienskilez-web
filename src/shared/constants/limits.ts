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
   * Scroll (vh) que consume cada card del mazo de Servicios.
   * Con 10 servicios, 40 deja el recorrido en ~4 pantallas: suficiente para
   * que cada card se lea sola, sin convertir la sección en un túnel.
   */
  SERVICES_DECK_BEAT_VH: 40,
  /** Alto (rem) al que se clava la primera card del mazo: despeja el navbar (h-16) con aire. */
  SERVICES_DECK_TOP_REM: 6,
  /**
   * Desplazamiento vertical (px) por índice — el abanico diagonal.
   * Referencia real medida contra lenis.darkroom.engineering (captura con
   * Playwright): el offset entre cards ahí es una fracción notoria del alto
   * de la card, no un "canto" de unos pocos píxeles — la primera versión de
   * este valor (12px) se leía como pila vertical, no como abanico.
   */
  SERVICES_DECK_FAN_STEP_Y_PX: 56,
  /** Desplazamiento horizontal (px) por índice: convierte la pila en abanico. */
  SERVICES_DECK_FAN_STEP_X_PX: 64,
  /**
   * Escala a la que queda una card durante su propia entrada (0-1, sube a 1
   * al terminar). Deliberadamente sutil: en la referencia el "encogimiento"
   * no es perceptible — lo que separa una card tapada de una activa es que
   * su contenido se atenúa (SERVICES_DECK_CONTENT_OPACITY_MIN), no su
   * tamaño. Un scale más agresivo se probó y se leía como que la card se
   * "rompía", no como profundidad.
   */
  SERVICES_DECK_SCALE_MIN: 0.98,
  /**
   * Opacidad mínima del CONTENIDO (título, descripción, botón) de una card
   * ya tapada por la siguiente — no de la card completa. El marco
   * (hud-frame + borde) se queda 100% nítido siempre; es lo que en la
   * referencia mantiene el "mazo" legible como pila de tarjetas reales en
   * vez de disolverse. El índice numérico de la card tampoco se atenúa
   * nunca, mismo criterio que el "01/02/03" de la referencia.
   */
  SERVICES_DECK_CONTENT_OPACITY_MIN: 0.35,
  /**
   * Fracción de un "beat" (1/total del progreso) que ocupa la animación de
   * entrada de una card — el resto del beat es el tramo "de espera" donde
   * solo gira el isotipo (ver SERVICES_DECK_ALIEN_TURNS_PER_BEAT). En la
   * referencia la mano gira gran parte del tramo entre una card y la
   * siguiente, y la card recién entra cerca del final — no es un fundido
   * parejo a lo largo de todo el beat.
   */
  SERVICES_DECK_ENTRANCE_FRACTION: 0.24,
  /** Vueltas completas que gira el isotipo por cada beat de scroll (1 = una vuelta entre card y card, como el brazo de la referencia). */
  SERVICES_DECK_ALIEN_TURNS_PER_BEAT: 1,
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
