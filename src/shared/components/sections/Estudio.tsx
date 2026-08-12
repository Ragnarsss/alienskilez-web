import { Reveal, Section } from "@/shared/components/ui/Section"
import { SECTION_IDS } from "@/shared/constants/sections"
import { SITE } from "@/shared/constants/site"

const PILLARS = [
  {
    title: "Dirección, no solo botones",
    description:
      "La diferencia entre una toma correcta y una toma que emociona casi nunca es técnica. En sala se trabaja la interpretación, no solo el nivel de entrada.",
  },
  {
    title: "Una sola cabeza en todo el proceso",
    description:
      "Producción, mezcla y máster los lleva la misma persona. El criterio de sonido no se pierde entre manos distintas ni entre versiones del archivo.",
  },
  {
    title: "El track no termina en el máster",
    description:
      "Visuales, estrategia de lanzamiento y show en vivo son parte del mismo trabajo. Un buen track que nadie escucha sigue siendo un problema sin resolver.",
  },
]

export function Estudio() {
  return (
    <Section
      id={SECTION_IDS.ESTUDIO}
      index="01"
      kicker="EL ESTUDIO"
      title={
        <>
          Un productor, no una <span className="text-accent">fábrica de tracks</span>.
        </>
      }
      description={`${SITE.NAME} es un proyecto de autor: cada sesión la dirige el mismo productor de principio a fin, desde la primera idea hasta el archivo que sube a plataformas.`}
    >
      <div className="grid gap-px overflow-hidden rounded-sm border border-border bg-border sm:grid-cols-3">
        {PILLARS.map((pillar, index) => (
          <Reveal key={pillar.title} delay={index * 0.08}>
            <article className="hud-frame h-full bg-background p-7 transition-colors hover:bg-surface-alt">
              <span className="font-mono text-xs tracking-[0.2em] text-accent" aria-hidden="true">
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-4 text-xl font-semibold tracking-tight">{pillar.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-text-muted">{pillar.description}</p>
            </article>
          </Reveal>
        ))}
      </div>
    </Section>
  )
}
