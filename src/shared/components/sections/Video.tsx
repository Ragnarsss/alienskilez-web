import type { VideoItem } from "@/features/video/video"
import { useVideoCatalog } from "@/features/video/hooks/useVideoCatalog"
import { VideoCarousel } from "@/shared/components/sections/VideoCarousel"
import { Badge } from "@/shared/components/ui/Badge"
import { Button } from "@/shared/components/ui/Button"
import { Reveal, Section } from "@/shared/components/ui/Section"
import { LIMITS, MEDIA } from "@/shared/constants/limits"
import { SECTION_IDS } from "@/shared/constants/sections"
import { SOCIALS } from "@/shared/constants/site"
import { useMediaQuery } from "@/shared/hooks/useMediaQuery"
import { usePrefersReducedMotion } from "@/shared/hooks/usePrefersReducedMotion"

/** Cantidad de placeholders del skeleton — sin relación con el catálogo real, solo llena la grilla. */
const SKELETON_COUNT = 6

function VideoCard({ video, index }: { video: VideoItem; index: number }) {
  const year = video.publishedAt.slice(0, 4)

  return (
    <Reveal
      delay={Math.min(index, LIMITS.REVEAL_STAGGER_MAX_INDEX) * LIMITS.REVEAL_STAGGER_STEP_S}
      scaleOnView
    >
      <a
        href={video.videoUrl}
        target="_blank"
        rel="noreferrer"
        className="hud-frame group block overflow-hidden rounded-sm border border-border bg-surface-alt/40 transition-colors hover:border-border-accent"
      >
        <div className="aspect-video w-full overflow-hidden bg-surface-alt">
          {video.thumbnailUrl ? (
            <img
              src={video.thumbnailUrl}
              alt={`Miniatura de ${video.title}`}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="grid h-full w-full place-items-center" aria-hidden="true">
              <span className="font-mono text-xs tracking-wider text-text-muted">Sin miniatura</span>
            </div>
          )}
        </div>
        <div className="p-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge>Video</Badge>
            <span className="font-mono text-xs tracking-wider text-text-muted">{year}</span>
          </div>
          <h3 className="mt-3 truncate text-base font-semibold tracking-tight">{video.title}</h3>
        </div>
      </a>
    </Reveal>
  )
}

function VideoSkeleton() {
  return (
    <div
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
      role="status"
      aria-label="Cargando el catálogo de YouTube"
    >
      {Array.from({ length: SKELETON_COUNT }, (_, index) => (
        <div
          key={index}
          className="animate-pulse overflow-hidden rounded-sm border border-border bg-surface-alt/40"
        >
          <div className="aspect-video w-full bg-surface-alt" />
          <div className="space-y-2 p-4">
            <div className="h-3 w-16 rounded-sm bg-surface-alt" />
            <div className="h-4 w-3/4 rounded-sm bg-surface-alt" />
          </div>
        </div>
      ))}
    </div>
  )
}

/**
 * Fallback cuando la Function URL falla, no responde, o no está configurada
 * — nunca una sección vacía sin explicación (mismo criterio que
 * `DiscografiaFallback`, ver ALS-044/ADR-6).
 */
function VideoFallback() {
  const youtube = SOCIALS.find((social) => social.id === "youtube")

  return (
    <div className="flex flex-col items-center gap-4 rounded-sm border border-dashed border-border px-6 py-12 text-center">
      <p className="max-w-md font-mono text-xs tracking-wider text-text-muted">
        No pudimos cargar el catálogo en vivo ahora mismo.
      </p>
      {youtube && !youtube.pending && (
        <Button href={youtube.url} target="_blank" rel="noreferrer" variant="secondary">
          Ver en YouTube
        </Button>
      )}
    </div>
  )
}

export function Video() {
  const state = useVideoCatalog()
  // Mismo criterio que `Servicios.tsx`/`ServiciosDeck.tsx`: el carrusel
  // pineado exige scroll largo y transforms que no tienen sentido si el
  // visitante pidió menos movimiento, y en mobile el travelling horizontal
  // no cabe cómodo — ahí gana la grilla simple ya construida.
  const isCarouselViewport = useMediaQuery(MEDIA.DECK)
  const prefersReducedMotion = usePrefersReducedMotion()
  const isCarousel = isCarouselViewport && !prefersReducedMotion

  return (
    <Section
      id={SECTION_IDS.VIDEO}
      index="05"
      kicker="EN VIVO"
      geometry="hex"
      title="Video"
      description="Lo que ALIENSKILEZ sube a YouTube, en vivo — se actualiza solo con cada video nuevo."
    >
      {state.status === "loading" && <VideoSkeleton />}
      {state.status === "error" && <VideoFallback />}
      {state.status === "success" &&
        (state.videos.length > 0 ? (
          isCarousel ? (
            <VideoCarousel videos={state.videos} />
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {state.videos.map((video, index) => (
                <VideoCard key={video.id} video={video} index={index} />
              ))}
            </div>
          )
        ) : (
          <VideoFallback />
        ))}
    </Section>
  )
}
