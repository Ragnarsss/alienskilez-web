import { motion } from "framer-motion"
import { useRef } from "react"
import { Button } from "@/shared/components/ui/Button"
import { Container } from "@/shared/components/ui/Container"
import { HeroMark3D } from "@/shared/components/sections/HeroMark3D"
import { Kicker } from "@/shared/components/ui/Kicker"
import { CTA } from "@/shared/constants/content"
import { anchor, SECTION_IDS } from "@/shared/constants/sections"
import { SITE } from "@/shared/constants/site"
import { useMouseAura } from "@/shared/hooks/useMouseAura"

export function Hero() {
  const heroRef = useRef<HTMLElement>(null)
  useMouseAura(heroRef)

  return (
    <section
      ref={heroRef}
      className="relative flex min-h-[100svh] items-center overflow-hidden pt-24 pb-20"
    >
      {/* Capas decorativas: starfield + grid HUD + aura de mouse + halo verde. */}
      <div className="starfield pointer-events-none absolute inset-0 opacity-70" aria-hidden="true" />
      <div className="hud-grid pointer-events-none absolute inset-0 opacity-40" aria-hidden="true" />
      <div className="mouse-aura-layer pointer-events-none absolute inset-0" aria-hidden="true" />
      <div
        className="pointer-events-none absolute top-1/3 left-1/2 h-[36rem] w-[36rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/8 blur-[120px]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-background to-transparent"
        aria-hidden="true"
      />

      <Container className="relative">
        <div className="flex flex-col-reverse items-center gap-10 md:flex-row md:items-center md:justify-between md:gap-16">
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="max-w-4xl text-center md:max-w-2xl md:text-left"
          >
            <Kicker label={`SIGNAL_ORIGIN · ${SITE.LOCATION}`} className="mb-6 justify-center md:justify-start" />

            <h1 className="font-display text-4xl leading-[1.05] font-bold tracking-tight sm:text-6xl md:text-7xl">
              No es una sala con micrófonos.
              <br />
              <span className="text-accent">Es una nave.</span>
            </h1>

            <p className="mt-7 max-w-2xl text-lg leading-relaxed text-text-muted sm:text-xl">
              {SITE.NAME} produce, graba, mezcla y masteriza música para artistas independientes en{" "}
              {SITE.LOCATION}. Y cuando el track ya está listo, también se encarga de lo que viene
              después: visuales, estrategia y show en vivo.
            </p>

            <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center md:justify-start">
              <Button href={anchor(SECTION_IDS.CONTACTO)} variant="primary" size="lg">
                {CTA.PRIMARY}
              </Button>
              <Button href={anchor(SECTION_IDS.CONTACTO)} variant="secondary" size="lg">
                {CTA.SECONDARY}
              </Button>
            </div>

            <p className="mt-6 font-mono text-xs tracking-wider text-text-muted">
              Sin tarifas genéricas — cotización según el alcance real de tu proyecto.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, ease: "easeOut", delay: 0.15 }}
            className="flex flex-col items-center"
          >
            <HeroMark3D />
            <p className="mt-4 font-mono text-[0.6875rem] tracking-[0.2em] text-text-muted/60 uppercase">
              Arrastra para girar
            </p>
          </motion.div>
        </div>
      </Container>
    </section>
  )
}
