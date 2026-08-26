import { motion, useScroll, useTransform, type MotionValue } from "framer-motion"
import { useRef, useSyncExternalStore } from "react"
import { Button } from "@/shared/components/ui/Button"
import { cn } from "@/shared/components/ui/cn"
import { Container } from "@/shared/components/ui/Container"
import { HeroMark3D } from "@/shared/components/sections/HeroMark3D"
import { HeroSkyScene } from "@/shared/components/sections/HeroSkyScene"
import { Kicker } from "@/shared/components/ui/Kicker"
import { CTA } from "@/shared/constants/content"
import { HERO_MARK, LIMITS } from "@/shared/constants/limits"
import { anchor, SECTION_IDS } from "@/shared/constants/sections"
import { SITE } from "@/shared/constants/site"
import { useMeasuredHeightPx } from "@/shared/hooks/useMeasuredHeightPx"
import { trackCtaClick } from "@/shared/lib/analytics"
import { useMouseAura } from "@/shared/hooks/useMouseAura"
import { usePrefersReducedMotion } from "@/shared/hooks/usePrefersReducedMotion"

const HEADLINE_LINE_1 = "No es una sala con micrófonos.".split(" ")
const HEADLINE_LINE_2 = "Es una nave.".split(" ")

// El subtítulo se resuelve a texto plano y se separa en palabras — cada una
// revela su propio tramo del scroll-pin (ver SubheadWord más abajo).
const SUBHEAD_TEXT =
  `${SITE.NAME} produce, graba, mezcla y masteriza música para artistas independientes en ` +
  `${SITE.LOCATION}. Y cuando el track ya está listo, también se encarga de lo que viene ` +
  `después: visuales, estrategia y show en vivo.`
const SUBHEAD_WORDS = SUBHEAD_TEXT.split(" ")

// Tramos del progreso 0→1 del scroll-pin: primero solo el heading, después el
// subtítulo se va revelando palabra por palabra, y al final aparecen los
// botones y la nota final — como "llegar" tras viajar por el espacio.
const SUBHEAD_STAGE: [number, number] = [0.06, 0.42]
const BUTTONS_STAGE: [number, number] = [0.48, 0.62]
const FINE_PRINT_STAGE: [number, number] = [0.58, 0.7]

/** Ventana de progreso [start, end] en la que la palabra `index` (de `total`) se revela. */
function wordRange(index: number, total: number, stage: readonly [number, number]): [number, number] {
  const [start, end] = stage
  const step = (end - start) / total
  return [start + step * index, start + step * (index + 2.4)]
}

/** `true` una vez que el valor de scroll supera el umbral — gatea foco/clicks de contenido aún invisible. */
function useMotionValueThreshold(value: MotionValue<number>, threshold: number): boolean {
  return useSyncExternalStore(
    (onChange) => value.on("change", onChange),
    () => value.get() > threshold,
  )
}

function SubheadWord({
  word,
  progress,
  range,
  reveal,
}: {
  word: string
  progress: MotionValue<number>
  range: [number, number]
  reveal: boolean
}) {
  const animatedOpacity = useTransform(progress, range, [0, 1])
  const animatedY = useTransform(progress, range, [10, 0])
  const isBrand = word === SITE.NAME

  return (
    <motion.span
      style={{ opacity: reveal ? 1 : animatedOpacity, y: reveal ? 0 : animatedY }}
      className={cn("inline-block", isBrand && "text-pulse font-extrabold text-accent")}
    >
      {/* \u00A0 (no-break space), no " ": un espacio normal se colapsa entre inline-block. */}
      {word}
      {"\u00A0"}
    </motion.span>
  )
}

export function Hero() {
  const wrapperRef = useRef<HTMLElement>(null)
  const stickyRef = useRef<HTMLDivElement>(null)
  const prefersReducedMotion = usePrefersReducedMotion()
  const stickyHeightPx = useMeasuredHeightPx(stickyRef, !prefersReducedMotion)
  useMouseAura(stickyRef)

  // "end end" (fondo del wrapper contra fondo del viewport) da progress=1 en
  // el punto equivocado apenas el sticky es más alto que el viewport: el pin
  // se suelta cuando el scroll dentro del wrapper llega a
  // `wrapperHeight - stickyHeight`, y eso solo coincide con "fondo contra
  // fondo" si stickyHeight === viewportHeight. En mobile (stack de
  // headline+subtítulo+isotipo) casi nunca lo es, así que quedaba un tramo
  // final del reveal reproduciéndose ya con el Hero deslizándose fuera de
  // pantalla. `${RUNWAY}vh start` fija el progress=1 exactamente a
  // RUNWAY vh de scroll desde el inicio del wrapper — que es, por
  // construcción (ver `stickyHeightCss` más abajo), el mismo punto exacto en
  // el que el sticky se suelta, sin importar cuánto mida el contenido.
  const { scrollYProgress } = useScroll({
    target: wrapperRef,
    offset: ["start start", `${LIMITS.HERO_PIN_RUNWAY_VH}vh start`],
  })

  const buttonsAnimatedOpacity = useTransform(scrollYProgress, BUTTONS_STAGE, [0, 1])
  const buttonsAnimatedY = useTransform(scrollYProgress, BUTTONS_STAGE, [16, 0])
  const finePrintAnimatedOpacity = useTransform(scrollYProgress, FINE_PRINT_STAGE, [0, 1])
  const buttonsRevealed = useMotionValueThreshold(buttonsAnimatedOpacity, 0.05) || prefersReducedMotion

  // El isotipo entra al principio del pin, como si la nave se acercara, y
  // después se queda — igual que el subtítulo y los botones — hasta que el
  // pin se suelta y el Hero se va con el scroll normal, junto con todo lo
  // demás. Arranca en 0.35, no en 0: al cargar la página el visitante ya lo
  // ve, y el scroll lo termina de traer. Con 0 quedaba invisible justo en
  // el primer pantallazo, que es cuando más importa que la marca esté.
  const markAnimatedOpacity = useTransform(scrollYProgress, HERO_MARK.REVEAL_STAGE, [0.35, 1])
  const markAnimatedScale = useTransform(scrollYProgress, HERO_MARK.REVEAL_STAGE, [0.88, 1])
  const markAnimatedY = useTransform(scrollYProgress, HERO_MARK.REVEAL_STAGE, [24, 0])
  // La pista de interacción llega después del isotipo: primero se ve, después
  // se descubre que se puede tocar. Igual que el mark, aparece y se queda.
  const markHintAnimatedOpacity = useTransform(
    scrollYProgress,
    [HERO_MARK.REVEAL_STAGE[1], HERO_MARK.REVEAL_STAGE[1] + 0.08],
    [0, 1],
  )

  // Presupuesto del pin = alto REAL del sticky (medido), no un 100svh fijo:
  // si el contenido no entra en el viewport (el stack mobile de
  // headline+subhead+isotipo suele pasarse), el runway se ajusta para que
  // el pin siga sosteniéndose hasta que scrollYProgress llegue a 1. Antes
  // de la primera medición cae a 100svh como aproximación de arranque.
  const stickyHeightCss = stickyHeightPx != null ? `${stickyHeightPx}px` : "100svh"

  return (
    <section
      ref={wrapperRef}
      className="relative"
      style={
        prefersReducedMotion
          ? undefined
          : { height: `calc(${stickyHeightCss} + ${LIMITS.HERO_PIN_RUNWAY_VH}vh)` }
      }
    >
      <div
        ref={stickyRef}
        className={cn(
          "relative flex min-h-[100svh] items-center overflow-hidden pt-24 pb-20",
          // min-h, no h fija: si el contenido es más alto que el viewport (pantallas
          // bajas), puede crecer en vez de recortarse y taparse con el navbar.
          !prefersReducedMotion && "sticky top-0",
        )}
      >
        {/* Cielo nocturno: tres capas de estrellas con paralaje + zoom de avance. */}
        <HeroSkyScene scrollYProgress={scrollYProgress} />
        <div className="mouse-aura-layer pointer-events-none absolute inset-0" aria-hidden="true" />
        <div
          className="pointer-events-none absolute top-1/3 left-1/2 h-[36rem] w-[36rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/8 blur-[120px]"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-background to-transparent"
          aria-hidden="true"
        />

        <Container className="relative">
          <div className="flex flex-col-reverse items-center gap-10 md:flex-row md:items-center md:justify-between md:gap-16">
            <motion.div
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="max-w-4xl text-center md:max-w-2xl md:text-left"
            >
              <Kicker
                label={`SIGNAL_ORIGIN · ${SITE.LOCATION}`}
                className="mb-6 justify-center md:justify-start"
              />

              <div className="relative">
                {/* Panel geométrico detrás del headline — reemplaza al planeta suelto de esquina. */}
                <svg
                  aria-hidden="true"
                  preserveAspectRatio="none"
                  viewBox="0 0 100 100"
                  className="pointer-events-none absolute -inset-x-4 -inset-y-3 -z-10 sm:-inset-x-6 sm:-inset-y-4"
                >
                  <defs>
                    <radialGradient id="hero-heading-panel-fill" cx="30%" cy="20%" r="85%">
                      <stop offset="0%" stopColor="var(--color-surface)" />
                      <stop offset="100%" stopColor="var(--color-background)" />
                    </radialGradient>
                  </defs>
                  <polygon
                    points="8,0 100,0 100,92 92,100 0,100 0,8"
                    fill="url(#hero-heading-panel-fill)"
                    stroke="var(--color-border-accent)"
                    strokeWidth="1"
                    vectorEffect="non-scaling-stroke"
                  />
                </svg>

                <h1
                  aria-label={`${HEADLINE_LINE_1.join(" ")} ${HEADLINE_LINE_2.join(" ")}`}
                  className="font-display text-4xl leading-[1.05] font-bold tracking-tight sm:text-6xl md:text-7xl"
                >
                  <span aria-hidden="true">
                    {HEADLINE_LINE_1.map((word, index) => (
                      <motion.span
                        key={word}
                        initial={{ opacity: 0, y: 14 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, ease: "easeOut", delay: 0.15 + index * 0.05 }}
                        className="inline-block"
                      >
                        {word}
                        {index < HEADLINE_LINE_1.length - 1 ? "\u00A0" : ""}
                      </motion.span>
                    ))}
                  </span>
                  <br />
                  <span aria-hidden="true" className="text-accent">
                    {HEADLINE_LINE_2.map((word, index) => (
                      <motion.span
                        key={word}
                        initial={{ opacity: 0, y: 14 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                          duration: 0.4,
                          ease: "easeOut",
                          delay: 0.15 + (HEADLINE_LINE_1.length + index) * 0.05,
                        }}
                        className="inline-block"
                      >
                        {word}
                        {index < HEADLINE_LINE_2.length - 1 ? "\u00A0" : ""}
                      </motion.span>
                    ))}
                  </span>
                </h1>
              </div>

              {/*
                `aria-label` en un `<p>` es un atributo ARIA prohibido (un
                párrafo no tiene un rol que soporte "naming") — Lighthouse lo
                marca como error real (`aria-prohibited-attr`, auditoría
                ALS-019). Mismo arreglo que ya usa `Kicker.tsx` para el mismo
                problema (texto real partido en spans animados por palabra,
                todos `aria-hidden`): un `sr-only` con el texto completo al
                lado, en vez de un atributo ARIA que el elemento no soporta.
              */}
              <p className="mt-7 max-w-2xl text-lg leading-relaxed text-text-muted sm:text-xl">
                <span className="sr-only">{SUBHEAD_TEXT}</span>
                <span aria-hidden="true">
                  {SUBHEAD_WORDS.map((word, index) => (
                    <SubheadWord
                      key={`${word}-${index}`}
                      word={word}
                      progress={scrollYProgress}
                      range={wordRange(index, SUBHEAD_WORDS.length, SUBHEAD_STAGE)}
                      reveal={prefersReducedMotion}
                    />
                  ))}
                </span>
              </p>

              <motion.div
                style={{
                  opacity: prefersReducedMotion ? 1 : buttonsAnimatedOpacity,
                  y: prefersReducedMotion ? 0 : buttonsAnimatedY,
                  pointerEvents: buttonsRevealed ? "auto" : "none",
                }}
                className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center md:justify-start"
              >
                <Button
                  href={anchor(SECTION_IDS.CONTACTO)}
                  variant="primary"
                  size="lg"
                  tabIndex={buttonsRevealed ? undefined : -1}
                  onClick={() => {
                    trackCtaClick("sesion")
                  }}
                >
                  {CTA.PRIMARY}
                </Button>
                <Button
                  href={anchor(SECTION_IDS.CONTACTO)}
                  variant="secondary"
                  size="lg"
                  tabIndex={buttonsRevealed ? undefined : -1}
                  onClick={() => {
                    trackCtaClick("proyecto")
                  }}
                >
                  {CTA.SECONDARY}
                </Button>
              </motion.div>

              <motion.p
                style={{ opacity: prefersReducedMotion ? 1 : finePrintAnimatedOpacity }}
                className="mt-6 font-mono text-xs tracking-wider text-text-muted"
              >
                Sin tarifas genéricas — cotización según el alcance real de tu proyecto.
              </motion.p>
            </motion.div>

            {/* El isotipo entra con el scroll (como si la nave se acercara) y se
                queda — no se retira antes de que el Hero se vaya con el scroll. */}
            <motion.div
              style={{
                opacity: prefersReducedMotion ? 1 : markAnimatedOpacity,
                scale: prefersReducedMotion ? 1 : markAnimatedScale,
                y: prefersReducedMotion ? 0 : markAnimatedY,
              }}
              className="flex flex-col items-center"
            >
              <HeroMark3D />
              <motion.p
                style={{ opacity: prefersReducedMotion ? 1 : markHintAnimatedOpacity }}
                className="mt-4 font-mono text-[0.6875rem] tracking-[0.2em] text-text-muted/60 uppercase"
              />
            </motion.div>
          </div>
        </Container>
      </div>
    </section>
  )
}
