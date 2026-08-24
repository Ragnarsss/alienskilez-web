import { useRef } from "react"
import { motion, useScroll, useTransform, type MotionValue } from "framer-motion"
import { ServiceCard } from "@/shared/components/sections/ServiceCard"
import { AlienMark3D } from "@/shared/components/ui/AlienMark3D"
import { Button } from "@/shared/components/ui/Button"
import { Kicker } from "@/shared/components/ui/Kicker"
import { CTA } from "@/shared/constants/content"
import { LIMITS } from "@/shared/constants/limits"
import { anchor, SECTION_IDS } from "@/shared/constants/sections"
import { SERVICES } from "@/shared/constants/services"
import type { Service } from "@/shared/constants/services"
import { useMeasuredHeightPx } from "@/shared/hooks/useMeasuredHeightPx"

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
 * exacto (no en `index/total`, que para el índice final da 0.9) — así el
 * pin se suelta apenas la última card termina de entrar, sin un tramo de
 * scroll fijado de más esperando a que el pin se soltara.
 *
 * Esta función es independiente de cuánto vh mida el runway del pin
 * (`SERVICES_DECK_RUNWAY_VH`) — reparte el progreso 0→1 en fracciones
 * iguales, así que acortar o alargar el runway cambia la VELOCIDAD de
 * scroll por card, no el ritmo relativo entre ellas.
 */
function entranceWindow(index: number, total: number): [number, number] {
  // Rango YA cumplido en progress=0 (no `[0, 0.0001]`, que en progress
  // EXACTO 0 mapea al extremo inferior del rango → opacidad 0): la card 0
  // debe verse desde el primer frame del pin, antes de cualquier scroll.
  if (index <= 0) return [-0.0001, 0]
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

  // El offset del abanico se calcula por POSICIÓN EN LA PILA VISIBLE
  // (`index % (VISIBLE_DEPTH + 1)`), no por índice absoluto — esa fue la
  // causa real del bug reportado (el CTA general tapado por la card "09 ·
  // Marketing"): con offset = index * paso, la card de índice 8 caía a
  // ~880px del borde izquierdo, bien adentro de la columna del isotipo/CTA.
  // Como una card ya desapareció del todo pasada `VISIBLE_DEPTH` de
  // profundidad, su slot del abanico queda libre para la siguiente — el
  // abanico nunca ocupa más que `VISIBLE_DEPTH` pasos de ancho, sin
  // importar cuántos servicios haya en total.
  const fanSlot = index % (LIMITS.SERVICES_DECK_VISIBLE_DEPTH + 1)
  const restX = fanSlot * LIMITS.SERVICES_DECK_FAN_STEP_X_PX
  const restY = fanSlot * LIMITS.SERVICES_DECK_FAN_STEP_Y_PX

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
        // zIndex por índice ABSOLUTO (no por `fanSlot`): una card que reusa
        // el slot de una ya desaparecida tiene que quedar por encima de
        // ella en el orden de pintado, y el índice absoluto sigue siendo
        // creciente con el tiempo de entrada.
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
 * Mazo apilable de Servicios (ALS-043, 4ª iteración). Solo se monta en
 * desktop sin `prefers-reduced-motion` — `Servicios.tsx` decide entre esto y
 * la grilla simple (`MEDIA.DECK`).
 *
 * Estructura clonada del pin del Hero (`Hero.tsx`), no reinventada: un
 * wrapper cuyo alto se MIDE (`useMeasuredHeightPx`, igual que el Hero) para
 * que `height: calc(stickyHeightPx + RUNWAY_VH)` coincida siempre con dónde
 * el pin se suelta de verdad, y un único hijo `sticky top-0 min-h-[100svh]
 * flex items-center` — el contenido llena una pantalla real, centrado,
 * igual que el Hero, no un stack chico anclado con `top: Nrem` en una
 * esquina (esa era la 3ª versión: se veía chico y rodeado de espacio negro
 * vacío).
 *
 * El heading de la sección vive ACÁ DENTRO, no en el header normal de
 * `Section` — `Servicios.tsx` no le pasa `kicker`/`title`/`description` a
 * `Section` en este modo, así que ese header no se renderiza y no hay
 * heading duplicado. La razón: el header normal de `Section` es contenido
 * de flujo normal, scrollea y desaparece ANTES de que el pin del mazo
 * siquiera arranque (el pin no se activa hasta que su wrapper llega al tope
 * del viewport) — exactamente el bug reportado ("el heading desaparece").
 * Puesto adentro del mismo `sticky` que las cards, se queda en pantalla
 * todo lo que dura la animación, como "LENIS BRINGS THE HEAT" en la
 * referencia.
 *
 * Layout de dos columnas en `lg`: el mazo a la izquierda, isotipo + un
 * único CTA general a la derecha — siempre visibles, no uno por card (con
 * 10 servicios de tiers distintos, un CTA por card duplicaba el mismo
 * destino diez veces; uno solo, general, es lo honesto).
 */
export function ServiciosDeck({
  headingId,
  kicker,
  title,
  description,
}: {
  headingId: string
  kicker: string
  title: string
  description: string
}) {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const stickyRef = useRef<HTMLDivElement>(null)
  const stickyHeightPx = useMeasuredHeightPx(stickyRef, true)
  const total = SERVICES.length

  // Mismo offset custom que el Hero (`["start start", "${RUNWAY}vh start"]`,
  // no `"end end"`): fija progress=1 exactamente a `RUNWAY_VH` de scroll
  // desde el inicio del wrapper, que es por construcción el mismo punto en
  // el que el sticky se suelta — sin importar cuánto mida el contenido real.
  const { scrollYProgress } = useScroll({
    target: wrapperRef,
    offset: ["start start", `${LIMITS.SERVICES_DECK_RUNWAY_VH}vh start`],
  })

  const stackWidth =
    LIMITS.SERVICES_DECK_CARD_WIDTH_PX +
    LIMITS.SERVICES_DECK_VISIBLE_DEPTH * LIMITS.SERVICES_DECK_FAN_STEP_X_PX

  // Presupuesto del pin = alto REAL del sticky (medido), no un 100svh fijo —
  // mismo motivo que el Hero: si el contenido no entra en el viewport, el
  // runway se ajusta para que el pin se siga sosteniendo hasta progress=1.
  const stickyHeightCss = stickyHeightPx != null ? `${stickyHeightPx}px` : "100svh"

  return (
    <div
      ref={wrapperRef}
      className="relative"
      style={{ height: `calc(${stickyHeightCss} + ${LIMITS.SERVICES_DECK_RUNWAY_VH}vh)` }}
    >
      <div
        ref={stickyRef}
        className="sticky top-0 flex min-h-[100svh] items-center pt-24 pb-16"
      >
        <div className="w-full">
          <motion.header
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: LIMITS.REVEAL_DURATION_S, ease: "easeOut" }}
            className="mb-12 max-w-3xl"
          >
            <Kicker index="02" label={kicker} className="mb-4" />
            <h2
              id={headingId}
              className="text-3xl leading-[1.1] font-semibold tracking-tight sm:text-4xl md:text-5xl"
            >
              {title}
            </h2>
            <p className="mt-5 text-base leading-relaxed text-text-muted sm:text-lg">{description}</p>
          </motion.header>

          <div className="grid gap-10 lg:grid-cols-[1fr_auto] lg:items-center">
            <div className="relative h-80" style={{ width: stackWidth }}>
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
              <AlienMark3D className="h-48 w-48" />
              <Button href={anchor(SECTION_IDS.CONTACTO)} variant="primary" size="md">
                {CTA.PRIMARY}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
