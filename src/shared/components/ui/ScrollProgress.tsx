import { motion, useScroll, useSpring } from "framer-motion"
import { LIMITS } from "@/shared/constants/limits"

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
 */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, {
    stiffness: LIMITS.SCROLL_PROGRESS_SPRING_STIFFNESS,
    damping: LIMITS.SCROLL_PROGRESS_SPRING_DAMPING,
    restDelta: 0.001,
  })

  return (
    <div className="fixed inset-x-0 top-0 z-60 h-0.75 bg-border/40" aria-hidden="true">
      <motion.div
        className="h-full origin-left bg-accent shadow-[0_0_10px_var(--color-accent-glow)]"
        style={{ scaleX }}
      />
    </div>
  )
}
