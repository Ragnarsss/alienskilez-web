import { Component, lazy, Suspense, useState, type ReactNode } from "react"
import alienGlyph from "@/assets/alien-glyph.svg?raw"
import { cn } from "@/shared/components/ui/cn"
import { HERO_MARK } from "@/shared/constants/limits"
import { usePrefersReducedMotion } from "@/shared/hooks/usePrefersReducedMotion"

/**
 * Isotipo 3D reutilizable, factorizado de `HeroMark3D.tsx` (ADR-12) para que
 * un segundo lugar del sitio (el mazo de Servicios, ALS-043) pueda montar el
 * mismo alien girando sin duplicar el boundary/fallback a mano.
 *
 * **Deliberadamente NO se tocó `HeroMark3D.tsx` para que comparta este
 * componente.** Esa pieza tiene un historial documentado de cuatro
 * reescrituras por fallos silenciosos (ADR-12) — cualquier refactor ahí es
 * riesgo real de reintroducir uno de esos bugs. Un poco de duplicación entre
 * los dos es más barato que arriesgar el Hero por esto.
 *
 * El costo de red es el mismo que ya paga el Hero: `import("3dsvg")` es un
 * único chunk (~320 kB gzip) pedido por *specifier*, no por instancia — un
 * segundo `<SVG3D>` en otra sección reusa el chunk ya cacheado por el
 * navegador, no lo vuelve a descargar. Lo que sí paga dos veces es el canvas
 * WebGL (una escena Three.js por instancia) — costo de runtime, no de red.
 */
const SVG3D = lazy(async () => {
  const { SVG3D: Component3D } = await import("3dsvg")
  return { default: Component3D }
})

function FlatGlyph({ hidden }: { hidden: boolean }) {
  return (
    <div
      className={cn(
        "absolute inset-0 grid place-items-center transition-opacity duration-500",
        "[&_path]:fill-accent [&_svg]:h-4/5 [&_svg]:w-4/5",
        hidden ? "opacity-0" : "opacity-100",
      )}
      aria-hidden="true"
    >
      <div
        className="contents drop-shadow-[0_0_18px_var(--color-accent-glow)]"
        dangerouslySetInnerHTML={{ __html: alienGlyph }}
      />
    </div>
  )
}

class Mark3DBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  render() {
    return this.state.failed ? null : this.props.children
  }
}

/**
 * Girando de forma continua y autónoma (`animate="spin"`) — 3dsvg no expone
 * una forma de atar la rotación a un valor externo (progreso de scroll,
 * etc.), así que "gira mientras se espera" se resuelve con el mismo giro
 * autónomo del Hero, no con un giro controlado por scroll.
 */
export function AlienMark3D({
  className,
  spinSpeed = HERO_MARK.SPIN_SPEED,
}: {
  className?: string
  spinSpeed?: number
}) {
  const prefersReducedMotion = usePrefersReducedMotion()
  const [isReady, setIsReady] = useState(false)

  return (
    <div className={cn("relative", className)} aria-hidden="true">
      <FlatGlyph hidden={isReady} />
      <div className="absolute inset-0">
        <Mark3DBoundary>
          <Suspense fallback={null}>
            <SVG3D
              svg={alienGlyph}
              color={HERO_MARK.COLOR}
              smoothness={HERO_MARK.SMOOTHNESS}
              animate={prefersReducedMotion ? "none" : "spin"}
              animateSpeed={spinSpeed}
              onLoadingChange={(loading, progress) => {
                if (!loading && progress >= 100) setIsReady(true)
              }}
            />
          </Suspense>
        </Mark3DBoundary>
      </div>
    </div>
  )
}
