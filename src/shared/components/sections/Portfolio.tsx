import { motion, useReducedMotion, useScroll } from "framer-motion"
import { useRef } from "react"
import { Reveal, Section } from "@/shared/components/ui/Section"
import { Badge } from "@/shared/components/ui/Badge"
import { LIMITS } from "@/shared/constants/limits"
import { PORTFOLIO_ITEMS } from "@/shared/constants/portfolio"
import { SECTION_IDS } from "@/shared/constants/sections"

export function Portfolio() {
  const prefersReducedMotion = useReducedMotion()
  const timelineRef = useRef<HTMLOListElement>(null)
  const { scrollYProgress } = useScroll({
    target: timelineRef,
    offset: ["start 0.85", "end 0.65"],
  })

  return (
    <Section
      id={SECTION_IDS.PORTFOLIO}
      index="03"
      kicker="TRABAJOS"
      geometry="shards"
      title="Trayectoria de trabajos"
      description="Una progresión, no un catálogo: cada entrada muestra qué se hizo y hasta dónde llegó el proyecto."
    >
      <div className="relative">
        {/* Riel de la línea de tiempo: track fijo + trazo que avanza con el scroll. */}
        <div className="absolute inset-y-0 left-0 w-px bg-border" aria-hidden="true" />
        <motion.div
          className="absolute inset-y-0 left-0 w-px origin-top bg-accent shadow-[0_0_8px_var(--color-accent-glow)]"
          style={{ scaleY: prefersReducedMotion ? 1 : scrollYProgress }}
          aria-hidden="true"
        />
        <ol ref={timelineRef} className="relative pl-6 sm:pl-10">
          {PORTFOLIO_ITEMS.map((item, index) => (
            <li key={item.id} className="relative pb-12 last:pb-0">
              {/* Nodo de la línea de tiempo */}
              <span
                className="absolute top-2 -left-[calc(1.5rem+4.5px)] h-2 w-2 rounded-full bg-accent shadow-[0_0_10px_var(--color-accent-glow)] sm:-left-[calc(2.5rem+4.5px)]"
                aria-hidden="true"
              />
              <Reveal
                delay={Math.min(index, LIMITS.REVEAL_STAGGER_MAX_INDEX) * LIMITS.REVEAL_STAGGER_STEP_S}
                scaleOnView
              >
                <article className="hud-frame rounded-sm border border-border bg-surface-alt/40 p-6 sm:p-7">
                  <div className="flex flex-wrap items-center gap-3">
                    <Badge>{item.role}</Badge>
                    <span className="font-mono text-xs tracking-wider text-text-muted">
                      {item.year}
                    </span>
                    {item.pending && (
                      <span className="font-mono text-[0.6875rem] tracking-wider text-text-muted/70">
                        · pendiente de completar
                      </span>
                    )}
                  </div>

                  <h3 className="mt-4 text-xl font-semibold tracking-tight sm:text-2xl">
                    {item.title}
                  </h3>
                  <p className="mt-1 text-sm text-accent">{item.artist}</p>
                  <p className="mt-4 max-w-2xl text-sm leading-relaxed text-text-muted">
                    {item.description}
                  </p>

                  {item.embedUrl ? (
                    <div className="mt-6 overflow-hidden rounded-sm border border-border">
                      <iframe
                        src={item.embedUrl}
                        title={`Reproductor de ${item.title}`}
                        loading="lazy"
                        allow="encrypted-media; clipboard-write; picture-in-picture"
                        className="aspect-video w-full"
                      />
                    </div>
                  ) : (
                    <div className="mt-6 flex items-center justify-center rounded-sm border border-dashed border-border px-6 py-10">
                      <p className="text-center font-mono text-xs tracking-wider text-text-muted">
                        [Reproductor pendiente — pegar embed de Spotify o YouTube]
                      </p>
                    </div>
                  )}
                </article>
              </Reveal>
            </li>
          ))}
        </ol>
      </div>
    </Section>
  )
}
