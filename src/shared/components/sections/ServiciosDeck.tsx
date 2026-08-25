import { useEffect, useRef, useState } from "react"
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
import { trackCtaClick } from "@/shared/lib/analytics"

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
 * mazo, igual que la card 01 de la referencia aparece con el heading. Su
 * rango cae en progreso YA CUMPLIDO en 0 (`[-0.0001, 0]`, no `[0, 0.0001]`,
 * que en progreso EXACTO 0 mapea al extremo INFERIOR del rango → invisible
 * en el primer frame del pin, antes de cualquier scroll).
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
  if (index <= 0) return [-0.0001, 0]
  const isLast = index === total - 1
  const end = isLast ? 1 : index / total
  const width = LIMITS.SERVICES_DECK_ENTRANCE_FRACTION / total
  const start = Math.max(end - width, 0)
  return [start, Math.max(end, start + 0.0001)]
}

/**
 * Puntos de quiebre (progreso 0-1) para la cascada de retroceso de la card
 * `index`: el propio a de su entrada (se sostiene en el valor "pico" durante
 * TODA su ventana de entrada) y después el final de la ventana de entrada de
 * cada una de las `depth` cards siguientes — cada una empuja a esta un paso
 * más atrás. Si `index + paso` se pasa del total, la cascada se corta ahí:
 * esa card ya no tiene quién la siga empujando, así que se queda en el
 * último paso alcanzado (no hay "siguiente" que la retire).
 *
 * Se reutiliza tal cual para `x` e `y` — viajan al mismo ritmo, solo cambia
 * la magnitud por paso (`step`).
 */
function cascadeBreakpoints(index: number, total: number, depth: number): number[] {
  const [, ownEnd] = entranceWindow(index, total)
  const breakpoints = [ownEnd]
  for (let step = 1; step <= depth; step++) {
    const refIndex = index + step
    if (refIndex >= total) break
    breakpoints.push(entranceWindow(refIndex, total)[1])
  }
  return breakpoints
}

/**
 * Valores para `x`/`y`: ARRANCA en 0 (paso 0, recién entrada — la card
 * queda exactamente en la esquina de anclaje, `right-0 bottom-0` del
 * contenedor, ver `DeckCard`) y RETROCEDE `step` por cada quiebre — negativo,
 * alejándose de esa esquina hacia el resto de la pila.
 */
function recedingCascade(breakpointCount: number, step: number): number[] {
  return Array.from({ length: breakpointCount }, (_, i) => -i * step)
}

/**
 * Una card del mazo, posicionada en ABSOLUTO dentro del contenedor fijado
 * por `ServiciosDeck` — no con `position: sticky` propia (esa fue la
 * primera versión: con `sticky` por card, cada una se "suelta" al terminar
 * su propio tramo y la siguiente la reemplaza en secuencia, nunca hay más
 * de una visible a la vez).
 *
 * A diferencia de la 4ª versión (offset fijo por `index % slots`), acá cada
 * card viaja por una CASCADA real: entra al frente (paso 0 — exactamente en
 * la esquina de anclaje del mazo) y RETROCEDE un paso — más lejos de esa
 * esquina — cada vez que la siguiente card entra, hasta desvanecerse del
 * todo. Es la misma relación que en la referencia
 * (lenis.darkroom.engineering): la card más reciente es la más al frente Y
 * la que menos se movió de la esquina; la más vieja todavía visible es la
 * que más retrocedió.
 *
 * **Sin rotación** (la 5ª/6ª versión sí rotaba cada card un poco por paso)
 * — pedido explícito del usuario: la pila tiene que leerse como una
 * diagonal RECTA, no como el abanico/curva que salía con las cards
 * inclinadas. El giro ahora es cosa solo del isotipo (`ServiciosDeck`, más
 * abajo), no de las cards.
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
  const [start, end] = entranceWindow(index, total)
  const depth = LIMITS.SERVICES_DECK_VISIBLE_DEPTH
  const breakpoints = cascadeBreakpoints(index, total, depth)

  const x = useTransform(
    progress,
    breakpoints,
    recedingCascade(breakpoints.length, LIMITS.SERVICES_DECK_FAN_STEP_X_PX),
  )
  const restY = useTransform(
    progress,
    breakpoints,
    recedingCascade(breakpoints.length, LIMITS.SERVICES_DECK_FAN_STEP_Y_PX),
  )
  // El "sube desde abajo" es una animación TEMPORAL que solo corre durante la
  // ventana de entrada propia — se suma encima de `restY` (que ya vale su
  // pico de cascada desde el instante en que arranca la entrada), no la
  // reemplaza. `useTransform(() => a.get() + b.get())` combina dos motion
  // values sin re-render de React (framer-motion las suscribe directo).
  const riseOffset = useTransform(progress, [start, end], [LIMITS.SERVICES_DECK_RISE_PX, 0])
  const y = useTransform(() => restY.get() + riseOffset.get())

  // Card ya empujada a través de TODOS sus pasos de retroceso (no hay
  // ninguna card siguiente que la siga empujando): se desvanece del todo en
  // vez de quedar congelada en el paso 0 para siempre.
  const vanishIndex = index + depth + 1
  const canVanish = vanishIndex < total
  const [vanishStart, vanishEnd] = entranceWindow(vanishIndex, total)
  const opacity = useTransform(
    progress,
    canVanish ? [start, end, vanishStart, vanishEnd] : [start, end],
    canVanish ? [0, 1, 1, 0] : [0, 1],
  )
  const scale = useTransform(progress, [start, end], [LIMITS.SERVICES_DECK_SCALE_MIN, 1])

  return (
    <motion.div
      style={{
        x,
        y,
        scale,
        opacity,
        // `index + 1`, no `index`: el isotipo detrás del mazo vive en
        // `zIndex: 0` (ver `ServiciosDeck.tsx`) y un `zIndex` NEGATIVO en el
        // wrapper del isotipo se escapaba de este contexto de apilamiento y
        // terminaba pintado detrás del fondo de la propia sección — invisible
        // del todo, no solo tapado. Manteniendo todo en el rango [0, total]
        // sin negativos se evita ese escape.
        zIndex: index + 1,
        width: LIMITS.SERVICES_DECK_CARD_WIDTH_PX,
        height: LIMITS.SERVICES_DECK_CARD_HEIGHT_PX,
      }}
      className="absolute right-0 bottom-0"
    >
      <ServiceCard service={service} layout="deck" index={index} />
    </motion.div>
  )
}

/**
 * Mazo apilable de Servicios (ALS-043, 5ª iteración). Solo se monta en
 * desktop sin `prefers-reduced-motion` — `Servicios.tsx` decide entre esto y
 * la grilla simple (`MEDIA.DECK`).
 *
 * Estructura clonada del pin del Hero (`Hero.tsx`), no reinventada: un
 * wrapper cuyo alto se MIDE (`useMeasuredHeightPx`, igual que el Hero) para
 * que `height: calc(stickyHeightPx + RUNWAY_VH)` coincida siempre con dónde
 * el pin se suelta de verdad, y un único hijo `sticky top-0 min-h-[100svh]
 * flex items-center` — el contenido llena una pantalla real, centrado.
 *
 * El heading de la sección vive ACÁ DENTRO, no en el header normal de
 * `Section` — `Servicios.tsx` no le pasa `kicker`/`title`/`description` a
 * `Section` en este modo, así que ese header no se renderiza y no hay
 * heading duplicado. Puesto adentro del mismo `sticky` que las cards, se
 * queda en pantalla todo lo que dura la animación, como "LENIS BRINGS THE
 * HEAT" en la referencia. El CTA general vive junto al heading, en flujo
 * normal — no en una columna aparte flotando junto al isotipo (esa fue la
 * 4ª versión: quedaba visualmente desconectado del resto).
 *
 * El heading vive en su propia esquina arriba a la derecha (`absolute`, no
 * en flujo con el mazo) — pedido explícito del usuario tras ver la 5ª
 * iteración: el heading llevaba toda las versiones ancladas arriba a la
 * izquierda, y quería el layout espejado (mazo a la izquierda, heading a la
 * derecha), más parecido a cómo "LENIS BRINGS THE HEAT" se para en la
 * referencia. El isotipo 3D vive DETRÁS de todo el mazo, centrado (`z-index`
 * por debajo de TODAS las cards) y se ve translúcido a través de las cards
 * que tiene encima (`ServiceCard.tsx`).
 *
 * El giro del isotipo YA NO ES AUTÓNOMO (6ª iteración) — pedido explícito
 * del usuario: "que el alien gire SOLO con el scroll". `alienRotation`
 * (yaw + pitch, radianes) crece de forma CONTINUA y proporcional con
 * `scrollYProgress` — no en escalones (un primer intento saltaba de golpe
 * cada 2 cards; el usuario pidió "más suave, como el giro que uno le hace
 * manualmente al del Hero arrastrando con el mouse, solo que pineado al
 * scroll" — el mismo suavizado de `3dsvg` que atenúa el arrastre manual
 * atenúa cualquier cambio de `rotationX`/`rotationY`, así que alimentarlo
 * con progreso continuo da esa sensación de arrastre fluido). Pasarle
 * `rotationX`/`rotationY` apaga el giro autónomo de la librería
 * (`animate="spin"`) — ver la corrección de suposición sobre esto en
 * `AlienMark3D.tsx`. Pitch Y yaw combinados, de signo OPUESTO entre sí (no
 * solo yaw, no el mismo signo) es lo que da el "gira en sentido diagonal,
 * como si rotara sobre el espacio" pedido — un solo eje se ve como un
 * simple spin vertical, el mismo signo en los dos ejes traza una diagonal
 * derecha en vez de la curva oblicua pedida.
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

  // Giro del isotipo CONTINUO, no en escalones — pedido explícito del
  // usuario tras ver la versión con `Math.floor` ("cada 2 beat gira un
  // poco"): esa saltaba de golpe entre ángulos; esto tiene que sentirse
  // "más suave, como el giro que uno le hace manualmente al del Hero
  // (arrastrando con el mouse), solo que pineado al scroll" — el mismo
  // `SmoothControls` de `3dsvg` que suaviza el arrastre manual (ver
  // `AlienMark3D.tsx`) suaviza CUALQUIER cambio de `rotationX`/`rotationY`
  // frame a frame, así que alimentarlo con un valor CONTINUO en vez de
  // saltos da esa misma sensación de "arrastre fluido", nada más que la
  // "mano" ahora es el progreso de scroll. `rotationTotalSteps` sigue
  // fijando cuánto gira en total a lo largo de TODO el mazo (mismo rango
  // que la versión escalonada); lo que cambia es que ahora se reparte
  // proporcional a cada pixel de scroll, no de a saltos cada 2 cards.
  //
  // El `useEffect` de abajo SÍ dispara un `setState` en cada cambio — no
  // hay forma de pasarle un `MotionValue` directo a `rotationX`/`rotationY`
  // de `SVG3D` (son props de React normales, no valores CSS que
  // framer-motion pueda escribir sin re-render) — pero el umbral (`0.004`
  // de progreso, ~250 actualizaciones en todo el scroll) evita disparar un
  // render por cada pixel: el propio suavizado de `SmoothControls` ya hace
  // el resto del trabajo de que se vea fluido entre esas actualizaciones.
  const rotationTotalSteps = Math.ceil(total / 2)
  const totalYaw = rotationTotalSteps * LIMITS.SERVICES_DECK_ALIEN_YAW_STEP_RAD
  const totalPitch = rotationTotalSteps * LIMITS.SERVICES_DECK_ALIEN_PITCH_STEP_RAD
  const [alienRotation, setAlienRotation] = useState({ yaw: 0, pitch: 0 })
  useEffect(() => {
    let lastProgress = -1
    return scrollYProgress.on("change", (p) => {
      if (Math.abs(p - lastProgress) < 0.004) return
      lastProgress = p
      setAlienRotation({ yaw: p * totalYaw, pitch: p * totalPitch })
    })
  }, [scrollYProgress, totalYaw, totalPitch])

  // Recorrido horizontal del isotipo (pedido explícito del usuario, ver
  // `SERVICES_DECK_ALIEN_TRAVEL_X_PX`): a diferencia del giro, esto SÍ puede
  // ser un `MotionValue` puro sin pasar por `useState` — es un valor CSS
  // (`transform`) que `motion.div` escribe directo al DOM, no una prop de
  // React hacia un componente Three.js. `alienX`/`alienY` arrancan en
  // `-mitad del tamaño` (el offset de centrado que antes hacía la clase
  // `-translate-x-1/2 -translate-y-1/2`) y le SUMAN el recorrido/arco.
  const alienSize = LIMITS.SERVICES_DECK_ALIEN_SIZE_PX
  const alienTravelX = useTransform(scrollYProgress, [0, 1], [0, LIMITS.SERVICES_DECK_ALIEN_TRAVEL_X_PX])
  const alienArcY = useTransform(scrollYProgress, [0, 0.5, 1], [0, LIMITS.SERVICES_DECK_ALIEN_ARC_Y_PX, 0])
  const alienX = useTransform(() => -alienSize / 2 + alienTravelX.get())
  const alienY = useTransform(() => -alienSize / 2 + alienArcY.get())

  const depth = LIMITS.SERVICES_DECK_VISIBLE_DEPTH
  const stackWidth =
    LIMITS.SERVICES_DECK_CARD_WIDTH_PX + depth * LIMITS.SERVICES_DECK_FAN_STEP_X_PX
  const stackHeight =
    LIMITS.SERVICES_DECK_CARD_HEIGHT_PX + depth * LIMITS.SERVICES_DECK_FAN_STEP_Y_PX

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
      <div ref={stickyRef} className="sticky top-0 flex min-h-[100svh] items-center pt-16 pb-8">
        <div className="relative w-full" style={{ minHeight: stackHeight }}>
          {/*
            Esquina arriba a la derecha, `absolute` — no en flujo con el
            mazo, para que las cards puedan ocupar la columna izquierda
            completa por debajo/al lado sin que el heading les robe ancho
            (esa era la 5ª versión: heading y mazo apilados en la misma
            columna, compitiendo por el mismo presupuesto vertical).
            Tamaños FIJOS, no responsive (`text-3xl sm:text-4xl md:text-5xl`
            como el resto de `Section`): este componente solo se monta en
            `MEDIA.DECK` (≥1024px, ya por encima de `md`), así que las clases
            para viewports más chicos nunca aplicarían.
          */}
          <motion.header
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: LIMITS.REVEAL_DURATION_S, ease: "easeOut" }}
            className="absolute top-0 right-0 z-20 max-w-md text-right"
          >
            <Kicker index="02" label={kicker} className="mb-3" />
            <h2 id={headingId} className="text-4xl leading-[1.1] font-semibold tracking-tight">
              {title}
            </h2>
            <p className="mt-4 text-base leading-relaxed text-text-muted">{description}</p>
            <div className="mt-6 flex justify-end">
              <Button
                href={anchor(SECTION_IDS.CONTACTO)}
                variant="primary"
                size="md"
                onClick={() => {
                  trackCtaClick("sesion")
                }}
              >
                {CTA.PRIMARY}
              </Button>
            </div>
          </motion.header>

          <div className="relative" style={{ width: stackWidth, height: stackHeight }}>
            {/* Isotipo DETRÁS de todas las cards (`zIndex: 0`, las cards
                arrancan en 1) — grande y centrado en la pila, visible a
                través de las cards translúcidas que tiene encima
                (`ServiceCard.tsx`). El posicionamiento va en este wrapper,
                NO en `AlienMark3D` directo: el componente antepone
                `"relative"` a su propio `className` (lo necesita para el
                `absolute` interno de `FlatGlyph`/`Mark3DBoundary`) y `cn()`
                acá es un join simple sin dedupe tipo tailwind-merge —
                pasarle clases de posicionamiento directo perdía contra ese
                `"relative"` (orden del stylesheet de Tailwind, no del string
                de clases). */}
            <motion.div
              className="pointer-events-none absolute top-1/2 left-1/2"
              style={{ zIndex: 0, width: alienSize, height: alienSize, x: alienX, y: alienY }}
            >
              {/*
                Bastante más grande que la pila ENTERA
                (stackWidth×stackHeight), a propósito solapando un poco el
                heading — pedido explícito del usuario con una captura
                marcando el tamaño ("por ejemplo como de ese tamaño"): con
                `h-96` (384px) y después 672px (más chico que el peek
                necesario) el isotipo se seguía tapando del todo en tramos
                del scroll donde se acumulan varias cards encima. Con este
                tamaño (`SERVICES_DECK_ALIEN_SIZE_PX`) el margen que asoma
                más allá de cualquier card es generoso en las dos
                dimensiones, así que nunca desaparece del todo.

                Centrado con `x`/`y` (`alienX`/`alienY` arrancan en
                `-alienSize/2`), NO con clases `-translate-1/2` de
                Tailwind: acá también viaja horizontalmente con el scroll
                (`SERVICES_DECK_ALIEN_TRAVEL_X_PX`, pedido explícito del
                usuario — "que parta de un punto y se mueva más por lo
                horizontal"), y framer-motion necesita ser dueño de TODO el
                `transform` del elemento a la vez — mezclar una clase
                Tailwind que fija el transform con un `style.x`/`style.y`
                de framer-motion pisaría uno al otro. Motivo de por qué NO
                se usa `flex items-center justify-center` para centrar
                (versión anterior): un hijo de flex más grande que su
                contenedor se ENCOGE por default (`flex-shrink: 1`) para
                entrar en el eje principal — acá el contenedor mide
                `stackWidth` (más angosto que el isotipo), así que el ancho
                pedido se comprimía en silencio hasta el ancho de la pila,
                sin error ni warning.
              */}
              <AlienMark3D className="h-full w-full" rotationY={alienRotation.yaw} rotationX={alienRotation.pitch} />
            </motion.div>
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
        </div>
      </div>
    </div>
  )
}
