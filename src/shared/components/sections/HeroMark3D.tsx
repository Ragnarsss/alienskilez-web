import { lazy, Suspense } from "react"
import alienGlyph from "@/assets/alien-glyph.svg?raw"
import { HERO_MARK } from "@/shared/constants/limits"
import { usePrefersReducedMotion } from "@/shared/hooks/usePrefersReducedMotion"

/**
 * Isotipo de ALIENSKILEZ extruido a 3D real, girando sobre su eje vertical
 * (ALS-028, ADR-12).
 *
 * `3dsvg` extruye el path del SVG a geometría con bisel y material PBR sobre
 * Three.js — es lo que le da el volumen y el sombreado que ninguna técnica de
 * CSS reproduce.
 *
 * **Se le pasan pocas props a propósito.** Un intento anterior le pasó
 * `background="transparent"`, `width`/`height` al 100% y overrides de luz, y
 * el canvas quedó en blanco. Los defaults del componente están calibrados
 * entre sí; conviene tocar de a una y mirando el resultado, no de a cinco.
 */
const SVG3D = lazy(async () => {
  const { SVG3D: Component } = await import("3dsvg")
  return { default: Component }
})

export function HeroMark3D() {
  const prefersReducedMotion = usePrefersReducedMotion()

  return (
    // Decorativo: el giro es estético y el contenido real del hero vive en el
    // texto contiguo. No tiene equivalente de teclado a propósito.
    <div aria-hidden="true">
      <Suspense fallback={null}>
        <SVG3D
          svg={alienGlyph}
          color={HERO_MARK.COLOR}
          smoothness={HERO_MARK.SMOOTHNESS}
          // Giro horizontal continuo; el visitante puede tomarlo y girarlo.
          animate={prefersReducedMotion ? "none" : "spin"}
          animateSpeed={HERO_MARK.SPIN_SPEED}
          draggable
        />
      </Suspense>
    </div>
  )
}
