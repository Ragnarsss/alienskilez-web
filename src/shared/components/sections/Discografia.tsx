import type { DiscographyRelease } from "@/features/discografia/discografia"
import { useDiscografia } from "@/features/discografia/hooks/useDiscografia"
import { Badge } from "@/shared/components/ui/Badge"
import { Button } from "@/shared/components/ui/Button"
import { Reveal, Section } from "@/shared/components/ui/Section"
import { LIMITS } from "@/shared/constants/limits"
import { SECTION_IDS } from "@/shared/constants/sections"
import { SOCIALS } from "@/shared/constants/site"

/** Cantidad de placeholders del skeleton — sin relación con el catálogo real, solo llena la grilla. */
const SKELETON_COUNT = 6

const RELEASE_TYPE_LABEL: Record<string, string> = {
  album: "Álbum",
  single: "Single",
  compilation: "Recopilación",
}

function ReleaseCard({ release, index }: { release: DiscographyRelease; index: number }) {
  const year = release.releaseDate.slice(0, 4)

  return (
    <Reveal
      delay={Math.min(index, LIMITS.REVEAL_STAGGER_MAX_INDEX) * LIMITS.REVEAL_STAGGER_STEP_S}
      scaleOnView
    >
      <a
        href={release.spotifyUrl}
        target="_blank"
        rel="noreferrer"
        className="hud-frame group block overflow-hidden rounded-sm border border-border bg-surface-alt/40 transition-colors hover:border-border-accent"
      >
        <div className="aspect-square w-full overflow-hidden bg-surface-alt">
          {release.coverUrl ? (
            <img
              src={release.coverUrl}
              alt={`Portada de ${release.title}`}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="grid h-full w-full place-items-center" aria-hidden="true">
              <span className="font-mono text-xs tracking-wider text-text-muted">Sin portada</span>
            </div>
          )}
        </div>
        <div className="p-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge>{RELEASE_TYPE_LABEL[release.type] ?? release.type}</Badge>
            <span className="font-mono text-xs tracking-wider text-text-muted">{year}</span>
          </div>
          <h3 className="mt-3 truncate text-base font-semibold tracking-tight">{release.title}</h3>
        </div>
      </a>
    </Reveal>
  )
}

function DiscografiaSkeleton() {
  return (
    <div
      className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4"
      role="status"
      aria-label="Cargando el catálogo de Spotify"
    >
      {Array.from({ length: SKELETON_COUNT }, (_, index) => (
        <div
          key={index}
          className="animate-pulse overflow-hidden rounded-sm border border-border bg-surface-alt/40"
        >
          <div className="aspect-square w-full bg-surface-alt" />
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
 * — nunca una sección vacía sin explicación (criterio de ALS-044/ADR-6).
 */
function DiscografiaFallback() {
  const spotify = SOCIALS.find((social) => social.id === "spotify")

  return (
    <div className="flex flex-col items-center gap-4 rounded-sm border border-dashed border-border px-6 py-12 text-center">
      <p className="max-w-md font-mono text-xs tracking-wider text-text-muted">
        No pudimos cargar el catálogo en vivo ahora mismo.
      </p>
      {spotify && !spotify.pending && (
        <Button href={spotify.url} target="_blank" rel="noreferrer" variant="secondary">
          Ver en Spotify
        </Button>
      )}
    </div>
  )
}

export function Discografia() {
  const state = useDiscografia()

  return (
    <Section
      id={SECTION_IDS.DISCOGRAFIA}
      index="04"
      kicker="CATÁLOGO"
      geometry="hex"
      title="Discografía"
      description="El catálogo completo de ALIENSKILEZ en Spotify, en vivo — se actualiza solo con cada lanzamiento nuevo."
    >
      {state.status === "loading" && <DiscografiaSkeleton />}
      {state.status === "error" && <DiscografiaFallback />}
      {state.status === "success" &&
        (state.releases.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {state.releases.map((release, index) => (
              <ReleaseCard key={release.id} release={release} index={index} />
            ))}
          </div>
        ) : (
          <DiscografiaFallback />
        ))}
    </Section>
  )
}
