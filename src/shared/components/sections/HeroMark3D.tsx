import { lazy, Suspense } from "react"
import alienGlyph from "@/assets/alien-glyph.svg?raw"
import { HERO_MARK } from "@/shared/constants/limits"
import { THEME_COLORS } from "@/shared/constants/theme"
import { usePrefersReducedMotion } from "@/shared/hooks/usePrefersReducedMotion"

/**
 * Isotipo de ALIENSKILEZ extruido a 3D (ALS-028, ADR-12).
 *
 * `3dsvg` arrastra Three.js + @react-three/fiber + drei, que juntos pesan
 * varias veces el bundle entero del sitio. Por eso se carga con `lazy()`:
 * WebGL queda en un chunk aparte que no bloquea el primer render ni el LCP
 * del hero — el texto y los CTA (que son lo que convierte) pintan sin
 * esperar a que baje el motor 3D. Ver ADR-12 en architecture.md.
 */
const SVG3D = lazy(async () => {
  const { SVG3D: Component } = await import("3dsvg")
  return { default: Component }
})

/** Reserva el espacio exacto del canvas para que no haya salto de layout al montar. */
function MarkFallback() {
  return (
    <div className="h-full w-full animate-pulse rounded-full bg-accent/5" aria-hidden="true" />
  )
}

export function HeroMark3D() {
  const prefersReducedMotion = usePrefersReducedMotion()

  return (
    <div
      className="h-48 w-48 sm:h-56 sm:w-56"
      // Decorativo: no comunica información y el giro es estético. El
      // contenido real del hero vive en el texto contiguo.
      aria-hidden="true"
    >
      <Suspense fallback={<MarkFallback />}>
        <SVG3D
          svg={alienGlyph}
          // Rotación horizontal continua por defecto; el visitante puede
          // tomarlo y girarlo a mano en cualquier momento.
          animate={prefersReducedMotion ? "none" : "spin"}
          animateSpeed={HERO_MARK.SPIN_SPEED}
          draggable
          resetOnIdle={false}
          material="chrome"
          // Literal, no `var(--color-accent)`: Three.js no resuelve CSS
          // custom properties. Ver theme.ts y su test.
          color={THEME_COLORS.ACCENT}
          depth={HERO_MARK.EXTRUSION_DEPTH}
          smoothness={HERO_MARK.SMOOTHNESS}
          // Sin fondo propio: el starfield y el aura del hero se ven detrás.
          background="transparent"
          intro={prefersReducedMotion ? "none" : "fade"}
          width="100%"
          height="100%"
        />
      </Suspense>
    </div>
  )
}
