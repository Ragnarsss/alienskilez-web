import { Reveal, Section } from "@/shared/components/ui/Section"
import { PROCESS_STEPS } from "@/shared/constants/content"
import { SECTION_IDS } from "@/shared/constants/sections"

export function Proceso() {
  return (
    <Section
      id={SECTION_IDS.PROCESO}
      index="05"
      kicker="PROCESO"
      title="Cómo se agenda"
      description="Cuatro pasos, sin formularios eternos ni esperas de días. Si nunca has reservado un estudio, esto es todo lo que pasa."
    >
      <ol className="grid gap-px overflow-hidden rounded-sm border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
        {PROCESS_STEPS.map((step, index) => (
          <li key={step.id} className="h-full">
            <Reveal delay={index * 0.08} className="h-full">
              <div className="hud-frame flex h-full flex-col bg-background p-7">
                <span className="font-display text-3xl font-bold text-accent/35" aria-hidden="true">
                  {step.id}
                </span>
                <h3 className="mt-4 text-lg font-semibold tracking-tight">{step.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-text-muted">{step.description}</p>
              </div>
            </Reveal>
          </li>
        ))}
      </ol>
    </Section>
  )
}
