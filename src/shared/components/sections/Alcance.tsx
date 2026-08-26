import { animate, motion, useInView, useMotionValue, useReducedMotion, useTransform } from "framer-motion"
import { useEffect, useRef } from "react"
import { Reveal, Section } from "@/shared/components/ui/Section"
import { IMPACT_METRICS } from "@/shared/constants/alcance"
import { LIMITS } from "@/shared/constants/limits"
import { SECTION_IDS } from "@/shared/constants/sections"

/** Captura un valor "1200+" en dígitos + sufijo — solo aplica a métricas ya reales, nunca al placeholder `[XX]`. */
const NUMERIC_METRIC_VALUE = /^(\d+)(.*)$/

/** Cuenta 0 → valor real una sola vez al entrar en viewport. */
function AnimatedMetricValue({ target, suffix }: { target: number; suffix: string }) {
  const ref = useRef<HTMLParagraphElement>(null)
  const isInView = useInView(ref, { once: true, margin: LIMITS.REVEAL_VIEWPORT_MARGIN_CARD })
  const prefersReducedMotion = useReducedMotion()
  const count = useMotionValue(0)
  const display = useTransform(count, (latest) => `${Math.round(latest)}${suffix}`)

  useEffect(() => {
    if (!isInView) return
    if (prefersReducedMotion) {
      count.set(target)
      return
    }
    const controls = animate(count, target, { duration: 1.2, ease: "easeOut" })
    return () => controls.stop()
  }, [isInView, count, target, prefersReducedMotion])

  return (
    <motion.p
      ref={ref}
      className="font-display text-4xl font-bold tracking-tight text-accent sm:text-5xl"
    >
      {display}
    </motion.p>
  )
}

export function Alcance() {
  return (
    <Section
      id={SECTION_IDS.ALCANCE}
      index="06"
      kicker="ALCANCE"
      tone="surface-alt"
      geometry="hex"
      title="Los números"
      description="Las cifras se publican cuando están medidas, no antes."
    >
      <div className="grid gap-px overflow-hidden rounded-sm border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
        {IMPACT_METRICS.map((metric, index) => {
          const numericMatch = !metric.pending ? NUMERIC_METRIC_VALUE.exec(metric.value) : null

          return (
            <Reveal
              key={metric.id}
              delay={Math.min(index, LIMITS.REVEAL_STAGGER_MAX_INDEX) * LIMITS.REVEAL_STAGGER_STEP_S}
              scaleOnView
              className="h-full"
            >
              <article className="hud-frame h-full bg-background p-7">
                {numericMatch ? (
                  <AnimatedMetricValue
                    target={Number(numericMatch[1])}
                    suffix={numericMatch[2] ?? ""}
                  />
                ) : (
                  <p
                    className={
                      metric.pending
                        ? "font-display text-4xl font-bold tracking-tight text-text-muted/60 sm:text-5xl"
                        : "font-display text-4xl font-bold tracking-tight text-accent sm:text-5xl"
                    }
                  >
                    {metric.value}
                  </p>
                )}
                <h3 className="mt-4 text-base font-semibold tracking-tight">{metric.label}</h3>
                <p className="mt-1 font-mono text-xs tracking-wider text-text-muted">
                  {metric.caption}
                </p>
              </article>
            </Reveal>
          )
        })}
      </div>
    </Section>
  )
}
