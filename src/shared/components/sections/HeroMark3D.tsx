import alienGlyph from "@/assets/alien-glyph.svg?raw"
import { HERO_MARK } from "@/shared/constants/limits"
import { usePrefersReducedMotion } from "@/shared/hooks/usePrefersReducedMotion"
import { useSpinAndDrag } from "@/shared/hooks/useSpinAndDrag"

/**
 * Isotipo de ALIENSKILEZ con volumen real, girando sobre su eje vertical
 * (ALS-028, ADR-12).
 *
 * El volumen NO sale de WebGL: sale de apilar N copias del mismo path a
 * profundidades crecientes con `translateZ`. Rotando, esa pila se lee como
 * un objeto sólido — de canto se ve el grosor, que es exactamente lo que un
 * SVG plano no puede hacer y por lo que un `rotateY` continuo lo haría
 * desaparecer dos veces por vuelta.
 *
 * A cambio de ~320 kB gzip de Three.js: cero dependencias, funciona sin GPU,
 * y el color sale del token CSS en vez de necesitar un literal en JS.
 */

/** El `d` del path del glyph, extraído una sola vez del archivo SVG. */
const GLYPH_PATH = /\sd="([^"]+)"/.exec(alienGlyph)?.[1] ?? ""

/** El `viewBox`, para que las capas escalen con el archivo y no con números fijos. */
const GLYPH_VIEWBOX = /viewBox="([^"]+)"/.exec(alienGlyph)?.[1] ?? "0 0 17 17"

/**
 * El glyph trae los ojos como subpaths dentro del contorno de la cabeza: sin
 * `evenodd` se rellenan en vez de recortarse y el alien queda ciego. Se lee
 * del archivo en vez de asumirse, para que cambiar el SVG no lo rompa.
 */
const GLYPH_FILL_RULE = alienGlyph.includes("evenodd") ? "evenodd" : "nonzero"

const LAYERS = Array.from({ length: HERO_MARK.DEPTH_LAYERS }, (_, index) => {
  const progress = index / (HERO_MARK.DEPTH_LAYERS - 1)
  return {
    index,
    // Centrado en 0: la pila crece hacia adelante y hacia atrás por igual,
    // así el eje de giro pasa por el medio del objeto y no por su cara.
    translateZ: (progress - 0.5) * HERO_MARK.DEPTH_PX,
    // Las caras exteriores brillan; el interior se oscurece y da la
    // sensación de masa en vez de un sándwich de láminas iguales.
    brightness: 0.35 + Math.sin(progress * Math.PI) * 0.65,
  }
})

export function HeroMark3D() {
  const prefersReducedMotion = usePrefersReducedMotion()
  const spinRef = useSpinAndDrag<HTMLDivElement>({
    degreesPerSecond: HERO_MARK.DEGREES_PER_SECOND,
    degreesPerPixel: HERO_MARK.DEGREES_PER_PIXEL,
    inertiaDecay: HERO_MARK.INERTIA_DECAY,
    prefersReducedMotion,
  })

  return (
    <div
      className="hero-mark-scene h-48 w-48 sm:h-64 sm:w-64 lg:h-72 lg:w-72"
      // Decorativo: el giro es estético y el contenido real del hero vive en
      // el texto contiguo. No tiene equivalente de teclado a propósito.
      aria-hidden="true"
    >
      <div ref={spinRef} className="hero-mark-object relative h-full w-full touch-none select-none">
        {LAYERS.map((layer) => (
          <svg
            key={layer.index}
            viewBox={GLYPH_VIEWBOX}
            className="absolute inset-0 h-full w-full overflow-visible"
            style={{
              transform: `translateZ(${layer.translateZ}px)`,
              filter: `brightness(${layer.brightness})`,
            }}
          >
            <path d={GLYPH_PATH} fillRule={GLYPH_FILL_RULE} fill="var(--color-accent)" />
          </svg>
        ))}
      </div>
    </div>
  )
}
