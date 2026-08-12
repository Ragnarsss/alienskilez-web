import { Reveal, Section } from "@/shared/components/ui/Section"
import { IMPACT_METRICS } from "@/shared/constants/alcance"
import { SECTION_IDS } from "@/shared/constants/sections"

export function Alcance() {
  return (
    <Section
      id={SECTION_IDS.ALCANCE}
      index="04"
      kicker="ALCANCE"
      tone="surface-alt"
      title="Los números"
      description="Las cifras se publican cuando están medidas, no antes."
    >
      <div className="grid gap-px overflow-hidden rounded-sm border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
        {IMPACT_METRICS.map((metric, index) => (
          <Reveal key={metric.id} delay={index * 0.07} className="h-full">
            <article className="hud-frame h-full bg-background p-7">
              <p
                className={
                  metric.pending
                    ? "font-display text-4xl font-bold tracking-tight text-text-muted/60 sm:text-5xl"
                    : "font-display text-4xl font-bold tracking-tight text-accent sm:text-5xl"
                }
              >
                {metric.value}
              </p>
              <h3 className="mt-4 text-base font-semibold tracking-tight">{metric.label}</h3>
              <p className="mt-1 font-mono text-xs tracking-wider text-text-muted">
                {metric.caption}
              </p>
            </article>
          </Reveal>
        ))}
      </div>
    </Section>
  )
}
