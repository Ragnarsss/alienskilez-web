import { useRef } from "react"
import { motion, useScroll, useTransform, type MotionValue } from "framer-motion"
import { ServiceCard } from "@/shared/components/sections/ServiceCard"
import { AlienMark3D } from "@/shared/components/ui/AlienMark3D"
import { Button } from "@/shared/components/ui/Button"
import { CTA } from "@/shared/constants/content"
import { LIMITS } from "@/shared/constants/limits"
import { anchor, SECTION_IDS } from "@/shared/constants/sections"
import { SERVICES } from "@/shared/constants/services"
import type { Service } from "@/shared/constants/services"

/**
 * Ventana de progreso (0-1, sobre el scroll de TODO el mazo) en la que la
 * card `index` hace su entrada. Es el último tramo de su propio "beat"
 * (`1/total` del progreso) — el resto del beat es el tramo de espera donde
 * solo gira el isotipo. Medido contra la referencia real
 * (lenis.darkroom.engineering, capturado con Playwright): la mano ocupa la
 * mayor parte del scroll entre una card y la siguiente, y la card recién
 * entra cerca del final — no es un fundido parejo a lo largo de todo el beat.
 *
 * La card 0 no tiene "entrada": ya está en su lugar desde que arranca el
 * mazo, igual que la card 01 de la referencia aparece con el heading.
 *
 * La ÚLTIMA card es la otra excepción: su ventana termina en progreso 1.0
 * exacto (no en `index/total`, que para el índice final da 0.9). Si
 * terminara antes de 1.0, sobraba un tramo de scroll fijado sin que pasara
 * nada — la última card ya asentada, esperando a que el pin se soltara — que
 * es exactamente el síntoma reportado ("scroll de más antes de cambiar de
 * sección"), mismo tipo de desajuste entre pin y contenido que tuvo el Hero
 * (879aef8), aunque ahí el pin se soltaba antes de tiempo y acá era al revés.
 */
function entranceWindow(index: number, total: number): [number, number] {
  if (index <= 0) return [0, 0.0001]
  const isLast = index === total - 1
  const end = isLast ? 1 : index / total
  const width = LIMITS.SERVICES_DECK_ENTRANCE_FRACTION / total
  const start = Math.max(end - width, 0)
  return [start, Math.max(end, start + 0.0001)]
}

/**
 * Una card del mazo, posicionada en ABSOLUTO dentro del contenedor fijado
 * por `ServiciosDeck` — no con `position: sticky` propia (esa fue la
 * primera versión: con `sticky` por card, cada una se "suelta" al terminar
 * su propio tramo y la siguiente la reemplaza en secuencia, nunca hay más
 * de una visible a la vez). Acá el contenedor entero queda fijo en pantalla
 * y cada card llega a un offset x PERMANENTE (el abanico) mientras SUBE
 * desde abajo hasta su `y` de reposo al entrar — no se desliza en diagonal
 * desde la posición de la card anterior, que es como se leía en la versión
 * previa y no como "aparecer de abajo hacia arriba".
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
  const [start, end] = entranceWindow(index, total)
  const [nextStart, nextEnd] = entranceWindow(index + 1, total)

  // A cuántas cards de profundidad queda esta antes de desaparecer del
  // todo — no solo tapada, invisible. Sin esto, las 10 cards se acumulan a
  // baja opacidad en el mismo rincón y el mazo se lee como una mancha en
  // vez de un abanico de 3-4 piezas (ver SERVICES_DECK_VISIBLE_DEPTH).
  const vanishIndex = index + LIMITS.SERVICES_DECK_VISIBLE_DEPTH
  const canVanish = vanishIndex < total
  const [vanishStart, vanishEnd] = entranceWindow(vanishIndex, total)

  // `x` es fijo — el paso del abanico no se anima, solo posiciona. Lo único
  // que se anima al entrar es `y` (sube desde abajo) y la opacidad/escala.
  const restX = index * LIMITS.SERVICES_DECK_FAN_STEP_X_PX
  const restY = index * LIMITS.SERVICES_DECK_FAN_STEP_Y_PX

  const y = useTransform(progress, [start, end], [restY + LIMITS.SERVICES_DECK_RISE_PX, restY])
  const opacity = useTransform(
    progress,
    canVanish ? [start, end, vanishStart, vanishEnd] : [start, end],
    canVanish ? [0, 1, 1, 0] : [0, 1],
  )
  const scale = useTransform(progress, [start, end], [LIMITS.SERVICES_DECK_SCALE_MIN, 1])
  // Se atenúa el TÍTULO (no el marco) exactamente durante la entrada de la
  // SIGUIENTE card — es el momento en que queda tapada. La última no tiene
  // quién la tape, así que nunca se atenúa (ver ServiceCard.tsx).
  const contentOpacity = useTransform(
    progress,
    [nextStart, nextEnd],
    isLast ? [1, 1] : [1, LIMITS.SERVICES_DECK_CONTENT_OPACITY_MIN],
  )

  return (
    <motion.div
      style={{
        x: restX,
        y,
        scale,
        opacity,
        zIndex: index,
        width: LIMITS.SERVICES_DECK_CARD_WIDTH_PX,
      }}
      className="absolute top-0 left-0"
    >
      <ServiceCard service={service} layout="deck" index={index} contentOpacity={contentOpacity} />
    </motion.div>
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
 * end"]`).
 *
 * Layout de dos columnas en `lg`: el mazo a la izquierda, isotipo + un
 * único CTA general a la derecha — siempre visibles, no uno por card (con
 * 10 servicios de tiers distintos, un CTA por card duplicaba el mismo
 * destino diez veces; uno solo, general, es lo honesto).
 */
export function ServiciosDeck() {
  const containerRef = useRef<HTMLDivElement>(null)
  const total = SERVICES.length
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  })
  const stackWidth =
    LIMITS.SERVICES_DECK_CARD_WIDTH_PX +
    LIMITS.SERVICES_DECK_VISIBLE_DEPTH * LIMITS.SERVICES_DECK_FAN_STEP_X_PX

  return (
    <div
      ref={containerRef}
      style={{ height: `${LIMITS.SERVICES_DECK_BEAT_VH * total + LIMITS.SERVICES_DECK_TAIL_VH}vh` }}
    >
      <div
        className="sticky lg:grid lg:grid-cols-[1fr_auto] lg:items-center lg:gap-10"
        style={{ top: `${LIMITS.SERVICES_DECK_TOP_REM}rem` }}
      >
        <div className="relative min-h-56" style={{ width: stackWidth }}>
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
        <div className="hidden flex-col items-center gap-6 lg:flex">
          <AlienMark3D className="h-36 w-36" />
          <Button href={anchor(SECTION_IDS.CONTACTO)} variant="primary" size="md">
            {CTA.PRIMARY}
          </Button>
        </div>
      </div>
    </div>
  )
}
