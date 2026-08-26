import { motion, useScroll, useSpring } from "framer-motion"
import { LIMITS } from "@/shared/constants/limits"
import { usePrefersReducedMotion } from "@/shared/hooks/usePrefersReducedMotion"

/**
 * Barra fija de progreso de scroll de TODA la página (ALS-040). `useScroll()`
 * sin `target` mide el scroll del documento completo (a diferencia de
 * `ServiciosDeck.tsx`/`Hero.tsx`, que le pasan un `target` acotado a su
 * propio wrapper) — es el mismo hook, el caso de uso es el que cambia.
 *
 * `useSpring` sobre `scrollYProgress` (no el valor crudo): Lenis ya suaviza
 * el scroll en sí, pero el valor crudo de framer-motion todavía salta en
 * pasos con cada evento de scroll — el spring le da a la barra un
 * seguimiento fluido, no un tirón perceptible.
 *
 * `scaleX` sobre un elemento `origin-left`, no `width`: transform es
 * compuesto por la GPU sin relayout, mismo motivo por el que
 * `SERVICES_DECK_*`/`Hero.tsx` mueven todo por `x`/`y`/`scale` en vez de
 * propiedades de layout.
 *
 * `usePrefersReducedMotion()` propio — hallazgo real de la auditoría de
 * accesibilidad (`design-system.md` §6, punto 3): `MotionConfig` NO cubre
 * motion imperativo (`useScroll`/`useSpring` fuera de props declarativas),
 * cada uno necesita su propio chequeo. La barra en sí SIGUE, informa
 * posición real de scroll — no es el tipo de movimiento que dispara
 * mareo/vestibular (nada de escala grande, paralaje ni rebote); lo único
 * que se apaga es el SUAVIZADO del spring, usando el valor crudo de
 * `scrollYProgress` directo cuando el visitante pidió menos movimiento.
 */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll()
  const prefersReducedMotion = usePrefersReducedMotion()
  const smoothScaleX = useSpring(scrollYProgress, {
    stiffness: LIMITS.SCROLL_PROGRESS_SPRING_STIFFNESS,
    damping: LIMITS.SCROLL_PROGRESS_SPRING_DAMPING,
    restDelta: 0.001,
  })
  const scaleX = prefersReducedMotion ? scrollYProgress : smoothScaleX

  return (
    <div className="fixed inset-x-0 top-0 z-60 h-0.75 bg-border/40" aria-hidden="true">
      <motion.div
        className="h-full origin-left bg-accent shadow-[0_0_10px_var(--color-accent-glow)]"
        style={{ scaleX }}
      />
    </div>
  )
}
