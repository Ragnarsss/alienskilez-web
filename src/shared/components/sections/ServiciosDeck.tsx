import { useRef } from "react"
import { motion, useScroll, useTransform, type MotionValue } from "framer-motion"
import alienGlyph from "@/assets/alien-glyph.svg?raw"
import { ServiceCard } from "@/shared/components/sections/ServiceCard"
import { LIMITS } from "@/shared/constants/limits"
import { SERVICES } from "@/shared/constants/services"
import type { Service } from "@/shared/constants/services"

/**
 * Ventana de progreso (0-1, sobre el scroll de TODO el mazo) en la que la
 * card `index` hace su entrada. Es el último tramo de su propio "beat"
 * (`1/total` del progreso) — el resto del beat es el tramo de espera donde
 * solo gira el isotipo (`DeckAlien`). Medido contra la referencia real
 * (capturas de lenis.darkroom.engineering con Playwright): la mano ocupa
 * la mayor parte del scroll entre una card y la siguiente, y la card recién
 * entra cerca del final — no es un fundido parejo a lo largo de todo el beat.
 *
 * La card 0 no tiene "entrada": ya está en su lugar desde que arranca el
 * mazo, igual que la card 01 de la referencia aparece con el heading.
 */
function entranceWindow(index: number, total: number): [number, number] {
  if (index <= 0) return [0, 0.0001]
  const width = LIMITS.SERVICES_DECK_ENTRANCE_FRACTION / total
  const end = index / total
  const start = Math.max(end - width, 0)
  return [start, Math.max(end, start + 0.0001)]
}

/**
 * Una card del mazo, posicionada en ABSOLUTO dentro del contenedor fijado
 * por `ServiciosDeck` — no con `position: sticky` propia. Es la corrección
 * clave sobre la primera versión: con `sticky` por card, cada una se
 * "suelta" al terminar su propio tramo y la siguiente la reemplaza en
 * secuencia, así que nunca hay más de una visible a la vez (se leía como
 * pila vertical, no como abanico). Acá el contenedor entero queda fijo en
 * pantalla (un solo `sticky` en `ServiciosDeck`) y cada card llega a un
 * offset x/y PERMANENTE vía `transform` — se queda ahí, tapada por la
 * siguiente, mientras dure el scroll fijado. Eso es lo que arma el abanico
 * con 3-4 cards visibles a la vez, como en la referencia.
 *
 * `progress` es UNA sola medición de scroll compartida por todo el mazo.
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
  const isFirst = index === 0
  const isLast = index === total - 1
  const [start, end] = entranceWindow(index, total)
  const [nextStart, nextEnd] = entranceWindow(index + 1, total)

  const restX = index * LIMITS.SERVICES_DECK_FAN_STEP_X_PX
  const restY = index * LIMITS.SERVICES_DECK_FAN_STEP_Y_PX
  const prevX = Math.max(index - 1, 0) * LIMITS.SERVICES_DECK_FAN_STEP_X_PX
  const prevY = Math.max(index - 1, 0) * LIMITS.SERVICES_DECK_FAN_STEP_Y_PX

  // Antes de su entrada, la card queda clamped en la posición de la
  // anterior (tapada, invisible por opacity 0) — "sale de atrás" de ella.
  // Después de su entrada, queda clamped en su propio lugar del abanico
  // para siempre, mientras el mazo siga fijado.
  const x = useTransform(progress, [start, end], isFirst ? [0, 0] : [prevX, restX])
  const y = useTransform(progress, [start, end], isFirst ? [0, 0] : [prevY, restY])
  const opacity = useTransform(progress, [start, end], isFirst ? [1, 1] : [0, 1])
  const scale = useTransform(
    progress,
    [start, end],
    isFirst ? [1, 1] : [LIMITS.SERVICES_DECK_SCALE_MIN, 1],
  )
  // Se atenúa el CONTENIDO (no el marco) exactamente durante la entrada de
  // la SIGUIENTE card — es el momento en que queda tapada. La última no
  // tiene quién la tape, así que nunca se atenúa (ver ServiceCard.tsx).
  const contentOpacity = useTransform(
    progress,
    [nextStart, nextEnd],
    isLast ? [1, 1] : [1, LIMITS.SERVICES_DECK_CONTENT_OPACITY_MIN],
  )

  return (
    <motion.div
      style={{ x, y, scale, opacity, zIndex: index }}
      className="absolute inset-x-0 top-0"
    >
      <ServiceCard service={service} layout="deck" index={index} contentOpacity={contentOpacity} />
    </motion.div>
  )
}

/**
 * Isotipo que gira mientras se espera la próxima card — el equivalente de
 * marca a la mano de lenis.darkroom.engineering. Plano y en CSS
 * (`rotateY` + `transformPerspective`), no el motor 3D de `HeroMark3D`: acá
 * el giro es continuo durante todo el scroll del mazo, y una segunda
 * instancia del motor de Three.js duplicaría el chunk de 320 kB de ADR-12
 * para un elemento secundario — no se justifica.
 */
function DeckAlien({ progress }: { progress: MotionValue<number> }) {
  const totalTurns = SERVICES.length * LIMITS.SERVICES_DECK_ALIEN_TURNS_PER_BEAT
  const rotateY = useTransform(progress, [0, 1], [0, 360 * totalTurns])

  return (
    <div className="hidden items-center justify-center lg:flex" aria-hidden="true">
      <motion.div
        style={{ rotateY, transformPerspective: 800 }}
        className="h-40 w-40 opacity-70 drop-shadow-[0_0_18px_var(--color-accent-glow)] [&_path]:fill-accent [&_svg]:h-full [&_svg]:w-full"
        dangerouslySetInnerHTML={{ __html: alienGlyph }}
      />
    </div>
  )
}

/**
 * Mazo apilable de Servicios (ALS-043). Solo se monta en desktop sin
 * `prefers-reduced-motion` — `Servicios.tsx` decide entre esto y la grilla
 * simple (`MEDIA.DECK`).
 *
 * Estructura: un contenedor alto (`SERVICES_DECK_BEAT_VH * total`, la pista
 * de scroll) con un único hijo `sticky` que queda fijado en pantalla
 * mientras dura ese scroll. Todo lo demás — cada card y el isotipo — vive
 * DENTRO de ese hijo fijado, así que nunca se desplaza con la página; lo
 * que cambia es el `transform` de cada card según el progreso compartido
 * (`scrollYProgress`, medido una sola vez con `offset: ["start start", "end
 * end"]`). Esa es la diferencia con la primera versión (sticky por card),
 * que solo mostraba una card a la vez.
 *
 * Layout de dos columnas en `lg`: el mazo a la izquierda, el isotipo a la
 * derecha — mismo reparto que la referencia (texto/cards a un lado, mano al
 * otro), no centrado.
 */
export function ServiciosDeck() {
  const containerRef = useRef<HTMLDivElement>(null)
  const total = SERVICES.length
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  })

  return (
    <div
      ref={containerRef}
      style={{ height: `${LIMITS.SERVICES_DECK_BEAT_VH * total + LIMITS.SERVICES_DECK_TAIL_VH}vh` }}
    >
      <div
        className="sticky lg:grid lg:grid-cols-[1fr_auto] lg:items-center lg:gap-10"
        style={{ top: `${LIMITS.SERVICES_DECK_TOP_REM}rem` }}
      >
        <div className="relative min-h-[26rem] w-full max-w-xl">
          {SERVICES.map((service, index) => (
            <DeckCard
              key={service.id}
              service={service}
              index={index}
              total={total}
              progress={scrollYProgress}
            />
          ))}
        </div>
        <DeckAlien progress={scrollYProgress} />
      </div>
    </div>
  )
}
