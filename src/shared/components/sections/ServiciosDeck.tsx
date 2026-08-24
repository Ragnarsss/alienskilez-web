import { useRef } from "react"
import { motion, useScroll, useTransform, type MotionValue } from "framer-motion"
import { ServiceCard } from "@/shared/components/sections/ServiceCard"
import { LIMITS } from "@/shared/constants/limits"
import { SERVICES } from "@/shared/constants/services"
import type { Service } from "@/shared/constants/services"

/**
 * Una card del mazo: `sticky` con `top` incremental por índice (el "canto"
 * visible de la pila) y `zIndex: index`, así las cards de índice más alto
 * tapan a las anteriores. `progress` es UNA sola medición de scroll
 * compartida por todo el mazo — medir cada card por separado no funciona:
 * en cuanto una card queda `sticky` respecto del viewport, deja de moverse
 * y su propio progreso de scroll se congela ahí mismo.
 */
function DeckCard({
  service,
  index,
  total,
  progress,
}: {
  service: Service
  index: number
  total: number
  progress: MotionValue<number>
}) {
  const isLast = index === total - 1
  const start = index / total
  const end = (index + 1) / total

  // La última card no tiene nada encima que la tape — encogerla o
  // atenuarla igual que a las demás se leería como un bug, no como parte
  // del mazo. Se sigue llamando useTransform (nunca condicional, regla de
  // hooks) pero mapeando a un rango constante.
  const scale = useTransform(
    progress,
    [start, end],
    isLast ? [1, 1] : [1, LIMITS.SERVICES_DECK_SCALE_MIN],
  )
  const opacity = useTransform(
    progress,
    [start, end],
    isLast ? [1, 1] : [1, LIMITS.SERVICES_DECK_OPACITY_MIN],
  )

  return (
    <div style={{ height: `${LIMITS.SERVICES_DECK_BEAT_VH}vh` }}>
      <div
        className="sticky"
        style={{
          top: `calc(${LIMITS.SERVICES_DECK_TOP_REM}rem + ${index * LIMITS.SERVICES_DECK_FAN_STEP_Y_PX}px)`,
          zIndex: index,
        }}
      >
        {/* `x` es un offset fijo por índice, no ligado al scroll: es lo que
            convierte la pila vertical en un abanico diagonal. */}
        <motion.div
          style={{ x: index * LIMITS.SERVICES_DECK_FAN_STEP_X_PX, scale, opacity }}
          className="mx-auto w-full max-w-xl"
        >
          <ServiceCard service={service} layout="deck" />
        </motion.div>
      </div>
    </div>
  )
}

/**
 * Mazo apilable de Servicios (ALS-043). Solo se monta en desktop sin
 * `prefers-reduced-motion` — `Servicios.tsx` decide entre esto y la grilla
 * simple (`MEDIA.DECK`).
 *
 * El progreso de scroll se mide UNA vez sobre todo el contenedor
 * (`offset: ["start start", "end end"]`) y cada card toma su propio tramo
 * `[index/total, (index+1)/total]` de ese progreso — el mazo entero
 * comparte una sola fuente de verdad de "cuánto se scrolleó", en vez de que
 * cada card intente medirse a sí misma (ver nota en `DeckCard`).
 *
 * La altura del contenedor sale sola de sus hijos: cada card reserva
 * `SERVICES_DECK_BEAT_VH` de alto, más un espaciador final
 * (`SERVICES_DECK_TAIL_VH`) para no saltar de golpe a la sección siguiente.
 */
export function ServiciosDeck() {
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  })

  return (
    <div ref={containerRef} className="relative">
      {SERVICES.map((service, index) => (
        <DeckCard
          key={service.id}
          service={service}
          index={index}
          total={SERVICES.length}
          progress={scrollYProgress}
        />
      ))}
      <div style={{ height: `${LIMITS.SERVICES_DECK_TAIL_VH}vh` }} aria-hidden="true" />
    </div>
  )
}
