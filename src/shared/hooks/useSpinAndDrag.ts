import { useEffect, useRef } from "react"

interface SpinAndDragOptions {
  /** Grados por segundo del giro automático sobre el eje vertical. */
  degreesPerSecond: number
  /** Grados de rotación por píxel arrastrado. */
  degreesPerPixel: number
  /** Factor de decaimiento por frame de la inercia al soltar (0-1). */
  inertiaDecay: number
  /** Si el usuario pidió menos movimiento: sin giro automático ni inercia. */
  prefersReducedMotion: boolean
}

/**
 * Gira un elemento continuamente sobre su eje vertical y deja que el
 * visitante lo tome y lo gire a mano, con inercia al soltar.
 *
 * Escribe el `transform` directo sobre el DOM en cada frame en vez de pasar
 * por estado de React: el loop corre a 60fps y un arrastre dispara decenas de
 * eventos por segundo — ninguno de los dos tiene motivo para re-renderizar el
 * árbol de componentes (mismo criterio que useMouseAura, ADR-9).
 *
 * Accesibilidad: con `prefers-reduced-motion` el giro automático y la inercia
 * se apagan, pero el arrastre sigue disponible — es manipulación directa del
 * usuario, no movimiento que el sitio inicia por su cuenta.
 */
export function useSpinAndDrag<T extends HTMLElement>({
  degreesPerSecond,
  degreesPerPixel,
  inertiaDecay,
  prefersReducedMotion,
}: SpinAndDragOptions) {
  const elementRef = useRef<T | null>(null)

  useEffect(() => {
    const element = elementRef.current
    if (!element) return

    let rotationY = 0
    let rotationX = 0
    let dragVelocityY = 0
    let dragVelocityX = 0
    let dragging = false
    let lastPointer = { x: 0, y: 0 }
    let lastFrameTime = performance.now()
    let frameId = 0

    const tick = (now: number) => {
      const deltaSeconds = Math.min((now - lastFrameTime) / 1000, 0.1)
      lastFrameTime = now

      if (!prefersReducedMotion && !dragging) {
        rotationY += degreesPerSecond * deltaSeconds
      }

      if (!dragging) {
        // La inercia del arrastre se suma al giro base y se apaga sola.
        rotationY += dragVelocityY
        rotationX += dragVelocityX
        dragVelocityY *= inertiaDecay
        dragVelocityX *= inertiaDecay
        // Sin reduced motion la inclinación vuelve despacio a su reposo, para
        // que el objeto no quede torcido para siempre tras un arrastre.
        rotationX *= 0.98
      }

      element.style.transform = `rotateX(${rotationX}deg) rotateY(${rotationY}deg)`
      frameId = requestAnimationFrame(tick)
    }

    const handlePointerDown = (event: PointerEvent) => {
      dragging = true
      dragVelocityY = 0
      dragVelocityX = 0
      lastPointer = { x: event.clientX, y: event.clientY }
      element.setPointerCapture(event.pointerId)
      element.style.cursor = "grabbing"
    }

    const handlePointerMove = (event: PointerEvent) => {
      if (!dragging) return
      const deltaX = event.clientX - lastPointer.x
      const deltaY = event.clientY - lastPointer.y
      lastPointer = { x: event.clientX, y: event.clientY }

      dragVelocityY = deltaX * degreesPerPixel
      dragVelocityX = -deltaY * degreesPerPixel
      rotationY += dragVelocityY
      rotationX += dragVelocityX
    }

    const endDrag = (event: PointerEvent) => {
      if (!dragging) return
      dragging = false
      element.style.cursor = "grab"
      if (element.hasPointerCapture(event.pointerId)) {
        element.releasePointerCapture(event.pointerId)
      }
      if (prefersReducedMotion) {
        dragVelocityY = 0
        dragVelocityX = 0
      }
    }

    element.style.cursor = "grab"
    element.addEventListener("pointerdown", handlePointerDown)
    element.addEventListener("pointermove", handlePointerMove)
    element.addEventListener("pointerup", endDrag)
    element.addEventListener("pointercancel", endDrag)
    frameId = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(frameId)
      element.removeEventListener("pointerdown", handlePointerDown)
      element.removeEventListener("pointermove", handlePointerMove)
      element.removeEventListener("pointerup", endDrag)
      element.removeEventListener("pointercancel", endDrag)
    }
  }, [degreesPerSecond, degreesPerPixel, inertiaDecay, prefersReducedMotion])

  return elementRef
}
