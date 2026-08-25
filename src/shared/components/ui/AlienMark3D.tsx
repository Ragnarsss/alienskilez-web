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
 * Por default gira de forma continua y autónoma (`animate="spin"`) — es lo
 * que usa el Hero, que no necesita atar el giro a nada más.
 *
 * **Corrección sobre una suposición de ALS-043 (5ª iteración):** el
 * comentario original acá decía "3dsvg no expone una forma de atar la
 * rotación a un valor externo" — nunca se verificó contra la librería real,
 * solo se asumió. Sí lo expone: `rotationX`/`rotationY` (radianes, tipo
 * three.js) son props REACTIVAS — `node_modules/3dsvg/dist/index.js`
 * (`SmoothControls`) las observa con un `useEffect` y las suaviza hacia el
 * nuevo valor en cada frame (`useFrame`) aunque `animate="none"`, así que
 * pasar un número nuevo produce un giro suave hacia ese ángulo, no un salto.
 * Cuando se pasan `rotationX`/`rotationY` acá, este componente cambia a
 * `animate="none"` (si no, el giro autónomo de `LoopAnimation` se sumaría
 * al de `SmoothControls` sobre el mismo mesh) y el giro pasa a depender
 * solo de lo que le pase el caller — usado por el mazo de Servicios para
 * un giro atado al scroll en pasos, no continuo (ver `ServiciosDeck.tsx`).
 */
export function AlienMark3D({
  className,
  spinSpeed = HERO_MARK.SPIN_SPEED,
  rotationX,
  rotationY,
}: {
  className?: string
  spinSpeed?: number
  /** Radianes. Si se pasa (junto con `rotationY` o solo), el giro deja de ser autónomo. */
  rotationX?: number
  /** Radianes. Si se pasa (junto con `rotationX` o solo), el giro deja de ser autónomo. */
  rotationY?: number
}) {
  const prefersReducedMotion = usePrefersReducedMotion()
  const [isReady, setIsReady] = useState(false)
  const scrollControlled = rotationX !== undefined || rotationY !== undefined

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
              animate={prefersReducedMotion || scrollControlled ? "none" : "spin"}
              animateSpeed={spinSpeed}
              rotationX={rotationX}
              rotationY={rotationY}
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
