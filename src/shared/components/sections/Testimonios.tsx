import { Reveal, Section } from "@/shared/components/ui/Section"
import { LIMITS } from "@/shared/constants/limits"
import { SECTION_IDS } from "@/shared/constants/sections"
import { TESTIMONIALS } from "@/shared/constants/testimonials"

export function Testimonios() {
  return (
    <Section
      id={SECTION_IDS.TESTIMONIOS}
      index="07"
      kicker="TESTIMONIOS"
      tone="surface-alt"
      geometry="shards"
      title="Lo que dicen los artistas"
      description="Solo citas reales, con nombre y autorización de quien las dijo."
    >
      <div className="grid gap-px overflow-hidden rounded-sm border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
        {TESTIMONIALS.map((testimonial, index) => (
          <Reveal
            key={testimonial.id}
            delay={Math.min(index, LIMITS.REVEAL_STAGGER_MAX_INDEX) * LIMITS.REVEAL_STAGGER_STEP_S}
            scaleOnView
            className="h-full"
          >
            <figure className="hud-frame flex h-full flex-col bg-background p-7">
              <span
                className="font-display text-4xl leading-none text-accent/40"
                aria-hidden="true"
              >
                &ldquo;
              </span>
              <blockquote className="mt-3 flex-1">
                <p
                  className={
                    testimonial.pending
                      ? "text-sm leading-relaxed text-text-muted/70 italic"
                      : "text-base leading-relaxed text-text"
                  }
                >
                  {testimonial.quote}
                </p>
              </blockquote>
              <figcaption className="mt-6 border-t border-border pt-4">
                <p className="text-sm font-semibold tracking-tight">{testimonial.author}</p>
                <p className="mt-0.5 font-mono text-xs tracking-wider text-text-muted">
                  {testimonial.role}
                </p>
              </figcaption>
            </figure>
          </Reveal>
        ))}
      </div>
    </Section>
  )
}
