import { Button } from "@/shared/components/ui/Button"
import { Reveal, Section } from "@/shared/components/ui/Section"
import { CTA } from "@/shared/constants/content"
import { anchor, SECTION_IDS } from "@/shared/constants/sections"
import { SERVICES } from "@/shared/constants/services"

export function Servicios() {
  return (
    <Section
      id={SECTION_IDS.SERVICIOS}
      index="02"
      kicker="SERVICIOS"
      tone="surface-alt"
      title="Lo que se puede contratar"
      description="Desde una sesión suelta hasta el acompañamiento completo de una carrera. No publicamos tarifas porque el valor depende del alcance real: cuéntanos tu caso y te cotizamos."
    >
      <div className="grid gap-px overflow-hidden rounded-sm border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
        {SERVICES.map((service, index) => (
          <Reveal key={service.id} delay={Math.min(index, 5) * 0.05} className="h-full">
            <article className="hud-frame flex h-full flex-col bg-background p-7 transition-colors hover:bg-surface/25">
              <h3 className="text-lg font-semibold tracking-tight">{service.label}</h3>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-text-muted">
                {service.description}
              </p>
              <Button
                href={anchor(SECTION_IDS.CONTACTO)}
                variant="ghost"
                size="md"
                className="mt-6 w-full"
              >
                {service.tier === "sesion" ? CTA.PRIMARY : CTA.SECONDARY}
                <span className="sr-only"> — {service.label}</span>
              </Button>
            </article>
          </Reveal>
        ))}
      </div>
    </Section>
  )
}
