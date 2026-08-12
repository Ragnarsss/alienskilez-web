import { useDraggableRotation } from "@/shared/hooks/useDraggableRotation"

interface RingLayer {
  radius: number
  translateZ: number
  opacity: number
}

// Tres anillos a distinta profundidad: al rotar, la perspectiva de
// .hero-mark-scene los encoge/agranda de forma distinta y da sensación de
// volumen sin geometría 3D real — mismo truco barato que el resto de los
// motivos gráficos del sitio (CSS puro, sin WebGL, ver design-system.md §5).
const RINGS: readonly RingLayer[] = [
  { radius: 78, translateZ: 36, opacity: 0.9 },
  { radius: 62, translateZ: 14, opacity: 0.65 },
  { radius: 46, translateZ: -14, opacity: 0.4 },
]

/**
 * PLACEHOLDER interino (ADR-12, ALS-028).
 *
 * El isotipo 3D definitivo lo está diseñando el Productor como SVG aparte.
 * Esta pieza es una forma geométrica abstracta — no pretende ser el "alien"
 * final — que sostiene la interacción completa (arrastre + inercia)
 * mientras tanto. Cuando llegue el asset real, el reemplazo es acá adentro
 * únicamente: cambiar el contenido de este componente por el SVG final,
 * sin tocar useDraggableRotation ni cómo lo usa HeroMark3D.
 */
function PlaceholderGlyph() {
  return (
    <>
      {RINGS.map((ring) => (
        <svg
          key={ring.radius}
          viewBox="0 0 200 200"
          className="absolute inset-0 h-full w-full"
          style={{ transform: `translateZ(${ring.translateZ}px)` }}
        >
          <circle
            cx="100"
            cy="100"
            r={ring.radius}
            fill="none"
            stroke="var(--color-accent)"
            strokeOpacity={ring.opacity}
            strokeWidth="1.5"
          />
        </svg>
      ))}
      <svg
        viewBox="0 0 200 200"
        className="absolute inset-0 h-full w-full"
        style={{ transform: "translateZ(52px)" }}
      >
        <path
          d="M100 78v44M78 100h44"
          stroke="var(--color-accent)"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    </>
  )
}

export function HeroMark3D() {
  const rotatingRef = useDraggableRotation<HTMLDivElement>()

  return (
    <div
      className="hero-mark-scene h-36 w-36 sm:h-44 sm:w-44"
      // Puramente decorativo: gira por gusto, no comunica información y no
      // tiene equivalente de teclado — mismo criterio que el resto de las
      // capas decorativas del Hero (starfield, hud-grid).
      aria-hidden="true"
    >
      <div ref={rotatingRef} className="hero-mark-object relative h-full w-full touch-none select-none">
        <PlaceholderGlyph />
      </div>
    </div>
  )
}
