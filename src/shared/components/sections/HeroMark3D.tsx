import { Component, lazy, Suspense, useState, type ReactNode } from "react"
import alienGlyph from "@/assets/alien-glyph.svg?raw"
import { cn } from "@/shared/components/ui/cn"
import { HERO_MARK } from "@/shared/constants/limits"
import { usePrefersReducedMotion } from "@/shared/hooks/usePrefersReducedMotion"

/**
 * Isotipo de ALIENSKILEZ extruido a 3D real, girando sobre su eje vertical
 * (ALS-028, ADR-12).
 *
 * `3dsvg` extruye el path del SVG a geometría con bisel y material PBR sobre
 * Three.js. Se carga en diferido: el motor 3D pesa más que todo el resto del
 * sitio junto y no tiene por qué bloquear el primer render.
 *
 * **Se le pasan pocas props a propósito.** Un intento anterior le pasó
 * `background`, `width`/`height` y overrides de luz, y el canvas quedó vacío.
 * Los defaults del componente están calibrados entre sí.
 */
const SVG3D = lazy(async () => {
  const { SVG3D: Component3D } = await import("3dsvg")
  return { default: Component3D }
})

/**
 * El mismo glyph, plano y en el color de marca.
 *
 * No es un spinner de carga: es la versión que **queda** si el 3D no llega a
 * verse — sin GPU, con WebGL bloqueado, o si la escena falla en silencio
 * (que es exactamente lo que pasó durante la construcción de esta pieza).
 * El hero nunca muestra un hueco vacío donde debería estar la marca.
 */
function FlatGlyph({ hidden }: { hidden: boolean }) {
  return (
    <div
      className={cn(
        "absolute inset-0 grid place-items-center transition-opacity duration-500",
        // El archivo trae su propio `fill`; se pisa por CSS para que el color
        // siga saliendo del token y no haya un segundo literal.
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

/**
 * Si la escena 3D lanza (WebGL no disponible, driver, contexto perdido), este
 * límite evita que se lleve puesto el resto del Hero: se traga el error y deja
 * el glyph plano, que ya está renderizado debajo.
 */
class Mark3DBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  render() {
    return this.state.failed ? null : this.props.children
  }
}

export function HeroMark3D() {
  const prefersReducedMotion = usePrefersReducedMotion()
  const [is3DReady, setIs3DReady] = useState(false)

  return (
    // El tamaño explícito NO es cosmético: los defaults de <SVG3D> son
    // width/height "100%", así que sobre un padre de altura automática el
    // canvas mide 0px y no se ve nada, sin ningún error en consola.
    //
    // Decorativo: el giro es estético y el contenido real del hero vive en el
    // texto contiguo. No tiene equivalente de teclado a propósito.
    <div className="relative h-56 w-56 sm:h-72 sm:w-72 lg:h-80 lg:w-80" aria-hidden="true">
      <FlatGlyph hidden={is3DReady} />

      <div className="absolute inset-0">
        <Mark3DBoundary>
          <Suspense fallback={null}>
            <SVG3D
              svg={alienGlyph}
              color={HERO_MARK.COLOR}
              smoothness={HERO_MARK.SMOOTHNESS}
              // Giro horizontal continuo; el visitante puede tomarlo y girarlo.
              animate={prefersReducedMotion ? "none" : "spin"}
              animateSpeed={HERO_MARK.SPIN_SPEED}
              draggable
              // `onLoadingChange`, NO `onReady`: onReady dispara en el primer
              // frame del canvas, que ocurre ANTES de que la geometría termine
              // de extruirse (la extrusión es asíncrona, con yields al main
              // thread). Usarlo apagaba el glyph plano cuando todavía no había
              // nada 3D que mostrar — se veía el alien un segundo y se iba.
              //
              // onLoadingChange sí está atado a la extrusión: emite
              // (false, 100) recién cuando la geometría está lista.
              onLoadingChange={(loading, progress) => {
                if (!loading && progress >= 100) setIs3DReady(true)
              }}
            />
          </Suspense>
        </Mark3DBoundary>
      </div>
    </div>
  )
}
