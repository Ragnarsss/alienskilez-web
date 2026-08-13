import { lazy, Suspense, useState } from "react"
import alienGlyph from "@/assets/alien-glyph.svg?raw"
import { cn } from "@/shared/components/ui/cn"
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

/**
 * El mismo glyph, plano. Se ve desde el primer render y el canvas 3D lo
 * reemplaza recién cuando terminó de montar.
 *
 * No es solo un placeholder de carga: es la degradación real si WebGL no
 * está disponible (GPU bloqueada, navegador viejo, `chrome://flags`). Sin
 * esto, cualquiera de esos casos deja un hueco vacío en el hero y el fallo
 * es invisible — exactamente lo que el resto del sitio evita con la regla
 * de "la ausencia degrada la presentación, no la rompe" (ADR-6).
 */
function FlatGlyph({ hidden }: { hidden: boolean }) {
  return (
    <div
      // El SVG del archivo trae su propio `fill`; se pisa por CSS para que el
      // color siga saliendo del token y no haya un segundo literal.
      className={cn(
        "absolute inset-0 grid place-items-center transition-opacity duration-700",
        "[&_path]:fill-accent [&_svg]:h-3/4 [&_svg]:w-3/4",
        hidden ? "opacity-0" : "opacity-70",
      )}
      aria-hidden="true"
      dangerouslySetInnerHTML={{ __html: alienGlyph }}
    />
  )
}

export function HeroMark3D() {
  const prefersReducedMotion = usePrefersReducedMotion()
  const [is3DReady, setIs3DReady] = useState(false)

  return (
    <div
      className="relative h-48 w-48 sm:h-64 sm:w-64 lg:h-72 lg:w-72"
      // Decorativo: no comunica información y el giro es estético. El
      // contenido real del hero vive en el texto contiguo.
      aria-hidden="true"
    >
      <FlatGlyph hidden={is3DReady} />

      <Suspense fallback={null}>
        <SVG3D
          svg={alienGlyph}
          // Rotación horizontal continua por defecto; el visitante puede
          // tomarlo y girarlo a mano en cualquier momento.
          animate={prefersReducedMotion ? "none" : "spin"}
          animateSpeed={HERO_MARK.SPIN_SPEED}
          draggable
          resetOnIdle={false}
          // `emissive`, NO `chrome`: chrome es metalness 1 / roughness 0.05,
          // o sea un espejo — no muestra color propio, refleja el entorno. Y
          // el entorno que arma 3dsvg es casi negro (#0a0a12), así que sobre
          // el fondo negro del sitio el isotipo quedaba literalmente
          // invisible. `emissive` emite su propio color y encaja además con
          // el lenguaje neón del resto del sitio.
          material="emissive"
          // Literal, no `var(--color-accent)`: Three.js no resuelve CSS
          // custom properties. Ver theme.ts y su test.
          color={THEME_COLORS.ACCENT}
          lightIntensity={HERO_MARK.LIGHT_INTENSITY}
          ambientIntensity={HERO_MARK.AMBIENT_INTENSITY}
          depth={HERO_MARK.EXTRUSION_DEPTH}
          smoothness={HERO_MARK.SMOOTHNESS}
          zoom={HERO_MARK.ZOOM}
          // Sin fondo propio: el starfield y el aura del hero se ven detrás.
          background="transparent"
          intro={prefersReducedMotion ? "none" : "fade"}
          onReady={() => {
            setIs3DReady(true)
          }}
          width="100%"
          height="100%"
        />
      </Suspense>
    </div>
  )
}
