import { useRef, useState } from "react"
import { motion, useScroll, useTransform, type MotionValue } from "framer-motion"
import type { VideoItem } from "@/features/video/video"
import { LIMITS } from "@/shared/constants/limits"
import { useMeasuredHeightPx } from "@/shared/hooks/useMeasuredHeightPx"
import { useMeasuredWidthPx } from "@/shared/hooks/useMeasuredWidthPx"

/**
 * Una card del carrusel. `centerOffsetPx` es la distancia estática (sin
 * scroll) entre el centro de ESTA card y el borde izquierdo de la fila —
 * conocida de antemano porque todas las cards miden lo mismo
 * (`VIDEO_CAROUSEL_CARD_WIDTH_PX` + gap fijo), sin necesidad de medir cada
 * una por separado.
 *
 * `scale` se deriva de `trackX` (no de un estado propio): a medida que la
 * fila viaja, la distancia entre el centro de esta card y el centro de la
 * ventana del pin cambia frame a frame, y `useTransform` la recalcula sin
 * pasar por React — mismo mecanismo que `DeckCard` en `ServiciosDeck.tsx`,
 * la fórmula es la que cambia (distancia al centro en vez de progreso por
 * ventana de entrada).
 */
/**
 * URL de embed con un tramo recortado (`start`/`end`) en loop silencioso —
 * pedido explícito del usuario como alternativa a un GIF real. Un GIF
 * requeriría descargar el video (contra los Términos de Servicio de
 * YouTube) y una Lambda de procesamiento de video que ADR-11 descarta a
 * propósito (la función existente es de solo lectura, JSON liviano, sin
 * estado). Este mecanismo es 100% soportado por YouTube: el mismo
 * `embedUrl` que ya trae el catálogo (ver `aws/youtube-catalog/index.mjs`),
 * con parámetros de reproducción — sin descargar nada.
 *
 * `loop=1` con `playlist={id}` (el propio id, no una playlist real) es el
 * truco documentado de YouTube para que un solo video haga loop — sin
 * `playlist`, `loop=1` no tiene efecto.
 */
function previewEmbedUrl(video: VideoItem): string {
  const params = new URLSearchParams({
    start: String(LIMITS.VIDEO_CAROUSEL_PREVIEW_START_S),
    end: String(LIMITS.VIDEO_CAROUSEL_PREVIEW_END_S),
    autoplay: "1",
    mute: "1",
    loop: "1",
    controls: "0",
    modestbranding: "1",
    rel: "0",
    playlist: video.id,
  })
  return `${video.embedUrl}?${params.toString()}`
}

function CarouselCard({
  video,
  centerOffsetPx,
  trackX,
  viewportCenterPx,
  isPreviewing,
  onPreviewStart,
  onPreviewEnd,
}: {
  video: VideoItem
  centerOffsetPx: number
  trackX: MotionValue<number>
  viewportCenterPx: number
  isPreviewing: boolean
  onPreviewStart: () => void
  onPreviewEnd: () => void
}) {
  const distanceToCenter = useTransform(trackX, (x) =>
    Math.abs(centerOffsetPx + x - viewportCenterPx),
  )
  const scale = useTransform(
    distanceToCenter,
    [0, LIMITS.VIDEO_CAROUSEL_FOCUS_RANGE_PX],
    [LIMITS.VIDEO_CAROUSEL_FOCUS_SCALE_MAX, LIMITS.VIDEO_CAROUSEL_FOCUS_SCALE_MIN],
  )

  const year = video.publishedAt.slice(0, 4)

  return (
    <motion.a
      href={video.videoUrl}
      target="_blank"
      rel="noreferrer"
      onMouseEnter={onPreviewStart}
      onMouseLeave={onPreviewEnd}
      onFocus={onPreviewStart}
      onBlur={onPreviewEnd}
      className="group block shrink-0"
      style={{ width: LIMITS.VIDEO_CAROUSEL_CARD_WIDTH_PX, scale }}
    >
      <div className="hud-frame overflow-hidden rounded-sm border border-border bg-surface-alt/40 transition-colors group-hover:border-border-accent">
        <div className="aspect-video w-full overflow-hidden bg-surface-alt">
          {isPreviewing ? (
            // `pointer-events-none`: el iframe es puramente decorativo acá —
            // el click sigue yendo al `<a>` que lo envuelve, no a los
            // controles de YouTube (ya ocultos con `controls=0`, esto es
            // el resguardo real). `aria-hidden`: es una vista previa
            // silenciosa, no contenido que un lector de pantalla necesite
            // anunciar aparte del link mismo.
            <iframe
              src={previewEmbedUrl(video)}
              title={`Vista previa de ${video.title}`}
              className="h-full w-full pointer-events-none"
              allow="autoplay; encrypted-media"
              aria-hidden="true"
              tabIndex={-1}
            />
          ) : video.thumbnailUrl ? (
            <img
              src={video.thumbnailUrl}
              alt={`Miniatura de ${video.title}`}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="grid h-full w-full place-items-center" aria-hidden="true">
              <span className="font-mono text-xs tracking-wider text-text-muted">Sin miniatura</span>
            </div>
          )}
        </div>
      </div>
      {/*
        Título/subtítulo AFUERA de la card, sobre el fondo de la sección —
        referencia explícita del usuario (showcase de lenis.darkroom.engineering):
        el caption no vive dentro de un recuadro con padding, es texto suelto
        debajo de la miniatura, título en blanco y el resto en tono apagado.
      */}
      <div className="mt-3">
        <h3 className="truncate text-base font-semibold tracking-tight">{video.title}</h3>
        <p className="mt-0.5 font-mono text-xs tracking-wider text-text-muted">YouTube · {year}</p>
      </div>
    </motion.a>
  )
}

/**
 * Carrusel pineado del catálogo de YouTube (ALS-045, 2ª iteración — pedido
 * explícito del usuario tras ver la grilla estática: "más efecto
 * cinemático", con el showcase de lenis.darkroom.engineering como
 * referencia visual directa). Estructura de pin CLONADA de
 * `ServiciosDeck.tsx`/`Hero.tsx`, no reinventada: wrapper cuyo alto se MIDE
 * (`useMeasuredHeightPx`) para que `height: calc(stickyHeightPx +
 * RUNWAY_VH)` coincida con dónde el pin se suelta de verdad, y un único
 * hijo `sticky top-0`.
 *
 * A diferencia del mazo de Servicios (cascada apilada, mismo punto de
 * anclaje), acá el movimiento es un travelling horizontal: la fila ENTERA
 * de cards se traduce en `x` con el scroll vertical, como una cámara
 * recorriendo una fila de posters. El recorrido máximo se CALCULA, no se
 * asume: `useMeasuredWidthPx` mide tanto el ancho real de la fila
 * (`trackRef`) como el ancho de la ventana visible del pin (`stickyRef`) —
 * la diferencia es cuánto tiene que viajar la fila para que la última card
 * termine exacto en el borde derecho.
 *
 * **Radio de esquinas SIN cambios** respecto al resto del sitio
 * (`rounded-sm`) — la referencia usa esquinas muy redondeadas, pero
 * `design-system.md` §4 lo descarta a propósito ("identidad instrumental
 * técnica, no SaaS amigable"); decisión confirmada con el usuario antes de
 * construir esto, no se copia ese detalle puntual de la referencia.
 *
 * **Efecto "foco"** (sí tomado de la referencia): la card centrada en la
 * ventana del pin en cada instante se ve más grande que sus vecinas
 * (`CarouselCard`, `scale` derivado de la distancia al centro) — sensación
 * de "la actual" sin necesitar tamaños de card distintos por posición.
 */
export function VideoCarousel({ videos }: { videos: readonly VideoItem[] }) {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const stickyRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)

  const stickyHeightPx = useMeasuredHeightPx(stickyRef, true)
  const stickyWidthPx = useMeasuredWidthPx(stickyRef, true)
  const trackWidthPx = useMeasuredWidthPx(trackRef, true)

  const { scrollYProgress } = useScroll({
    target: wrapperRef,
    offset: ["start start", `${LIMITS.VIDEO_CAROUSEL_RUNWAY_VH}vh start`],
  })

  const maxTravelPx =
    stickyWidthPx != null && trackWidthPx != null ? Math.max(trackWidthPx - stickyWidthPx, 0) : 0
  const trackX = useTransform(scrollYProgress, [0, 1], [0, -maxTravelPx])

  const stickyHeightCss = stickyHeightPx != null ? `${stickyHeightPx}px` : "60vh"
  const viewportCenterPx = (stickyWidthPx ?? 0) / 2
  const cardStridePx = LIMITS.VIDEO_CAROUSEL_CARD_WIDTH_PX + LIMITS.VIDEO_CAROUSEL_GAP_PX

  // Una sola instancia de preview viva a la vez, por construcción: es un
  // solo id de estado, no un flag por card — el mouse solo puede estar
  // sobre una card a la vez, así que como mucho una lee `true` acá.
  const [previewingId, setPreviewingId] = useState<string | null>(null)

  return (
    <div
      ref={wrapperRef}
      // Full-bleed a propósito — pedido explícito del usuario ("que
      // sobresalga por los bordes"), viendo el showcase de referencia con
      // las cards cortadas contra el borde de la ventana. `Section` envuelve
      // esto en `<Container>` (max-w-6xl + padding lateral), así que el
      // carrusel necesita escapar de ese ancho: `w-screen` + `left-1/2
      // -translate-x-1/2` es la técnica estándar para que un hijo mida el
      // viewport completo sin importar el ancho del padre que lo contiene —
      // `Section` ya tiene `overflow-clip` en el wrapper de la sección, así
      // que esto no genera scroll horizontal.
      className="relative left-1/2 w-screen -translate-x-1/2"
      style={{ height: `calc(${stickyHeightCss} + ${LIMITS.VIDEO_CAROUSEL_RUNWAY_VH}vh)` }}
    >
      <div ref={stickyRef} className="sticky top-0 flex min-h-[100svh] items-center overflow-hidden">
        <motion.div
          ref={trackRef}
          className="flex items-start"
          style={{ x: trackX, gap: LIMITS.VIDEO_CAROUSEL_GAP_PX }}
        >
          {videos.map((video, index) => (
            <CarouselCard
              key={video.id}
              video={video}
              centerOffsetPx={index * cardStridePx + LIMITS.VIDEO_CAROUSEL_CARD_WIDTH_PX / 2}
              trackX={trackX}
              viewportCenterPx={viewportCenterPx}
              isPreviewing={previewingId === video.id}
              onPreviewStart={() => setPreviewingId(video.id)}
              onPreviewEnd={() => setPreviewingId((current) => (current === video.id ? null : current))}
            />
          ))}
        </motion.div>
      </div>
    </div>
  )
}
