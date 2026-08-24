import { ServiceCard } from "@/shared/components/sections/ServiceCard"
import { ServiciosDeck } from "@/shared/components/sections/ServiciosDeck"
import { Reveal, Section } from "@/shared/components/ui/Section"
import { LIMITS, MEDIA } from "@/shared/constants/limits"
import { SECTION_IDS } from "@/shared/constants/sections"
import { SERVICES } from "@/shared/constants/services"
import { useMediaQuery } from "@/shared/hooks/useMediaQuery"
import { usePrefersReducedMotion } from "@/shared/hooks/usePrefersReducedMotion"

export function Servicios() {
  // Los dos hooks se llaman siempre, sin condicional — solo cambia qué se
  // renderiza. El mazo (ALS-043) es una decisión de layout, no de "hay o no
  // hay movimiento": por eso sigue mirando `prefers-reduced-motion` acá,
  // aunque Lenis y el resto del sitio la ignoren a propósito (f8d4623) — ahí
  // la decisión fue "el scroll suave se queda", acá es "el mazo requiere
  // scroll largo y transforms que no tienen sentido si el visitante pidió
  // menos movimiento".
  const isDeckViewport = useMediaQuery(MEDIA.DECK)
  const prefersReducedMotion = usePrefersReducedMotion()
  const isDeck = isDeckViewport && !prefersReducedMotion

  return (
    <Section
      id={SECTION_IDS.SERVICIOS}
      index="02"
      kicker="SERVICIOS"
      tone="surface-alt"
      geometry="chevrons"
      title="Lo que se puede contratar"
      description="Desde una sesión suelta hasta el acompañamiento completo de una carrera. No publicamos tarifas porque el valor depende del alcance real: cuéntanos tu caso y te cotizamos."
    >
      {isDeck ? (
        <ServiciosDeck />
      ) : (
        <div className="grid gap-px overflow-hidden rounded-sm border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
          {SERVICES.map((service, index) => (
            <Reveal
              key={service.id}
              delay={Math.min(index, LIMITS.REVEAL_STAGGER_MAX_INDEX) * LIMITS.REVEAL_STAGGER_STEP_S}
              scaleOnView
              className="h-full"
            >
              <ServiceCard service={service} layout="grid" />
            </Reveal>
          ))}
        </div>
      )}
    </Section>
  )
}
