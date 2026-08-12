import { useEffect, type RefObject } from "react"

/**
 * Actualiza --mouse-x/--mouse-y sobre el elemento referenciado al mover el
 * mouse, para alimentar un radial-gradient que sigue al cursor (la clase
 * `.mouse-aura-layer` de index.css). Escribe directo sobre el DOM en vez de
 * pasar por estado de React: un `pointermove` dispara decenas de eventos
 * por segundo y no hay ninguna razón para que eso re-renderice el árbol de
 * componentes (ver ADR-9 en architecture.md — mismo criterio que
 * useScrolled).
 *
 * No se activa en touch (no hay cursor que seguir) ni con
 * prefers-reduced-motion — mismo criterio que el resto del movimiento del
 * sitio (design-system.md §6).
 */
export function useMouseAura(ref: RefObject<HTMLElement | null>): void {
  useEffect(() => {
    const el = ref.current
    if (!el) return

    const supportsFinePointer = window.matchMedia("(pointer: fine)").matches
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    if (!supportsFinePointer || prefersReducedMotion) return

    el.classList.add("mouse-aura-active")

    const handlePointerMove = (event: PointerEvent) => {
      const rect = el.getBoundingClientRect()
      el.style.setProperty("--mouse-x", `${event.clientX - rect.left}px`)
      el.style.setProperty("--mouse-y", `${event.clientY - rect.top}px`)
    }

    el.addEventListener("pointermove", handlePointerMove)
    return () => {
      el.removeEventListener("pointermove", handlePointerMove)
      el.classList.remove("mouse-aura-active")
    }
  }, [ref])
}
