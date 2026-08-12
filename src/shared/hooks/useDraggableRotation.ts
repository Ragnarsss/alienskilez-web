import { useEffect, useRef, type RefObject } from "react"

const DEGREES_PER_PIXEL = 0.4
const INERTIA_DECAY = 0.94
const INERTIA_STOP_THRESHOLD = 0.01

interface Rotation {
  x: number
  y: number
}

/**
 * Rotación 3D por arrastre (mouse y touch, vía Pointer Events) con inercia
 * al soltar. Pensado para ALS-028 (ADR-12) — el placeholder del hero rota
 * en dos ejes mientras se arrastra y sigue girando con decaimiento al
 * soltar, como un objeto con masa.
 *
 * Escribe el `transform` directo sobre el DOM en cada frame en vez de
 * pasar por estado de React: un arrastre dispara decenas de eventos por
 * segundo, y la inercia corre en un loop de requestAnimationFrame — ninguno
 * de los dos tiene motivo para re-renderizar el árbol de componentes.
 * Por eso este hook no usa useState en ningún punto: todo el estado de
 * rotación vive en variables locales al closure del efecto, no en React.
 *
 * `prefers-reduced-motion` desactiva solo la inercia final (el objeto
 * queda donde se soltó) — el arrastre en sí sigue funcionando, porque es
 * manipulación directa del usuario, no una animación que el sitio dispara
 * por su cuenta.
 */
export function useDraggableRotation<T extends HTMLElement>(): RefObject<T | null> {
  const elementRef = useRef<T | null>(null)

  useEffect(() => {
    const element = elementRef.current
    if (!element) return

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches

    const rotation: Rotation = { x: 0, y: 0 }
    let velocity: Rotation = { x: 0, y: 0 }
    let lastPointer = { x: 0, y: 0 }
    let dragging = false
    let inertiaFrame = 0

    const applyRotation = () => {
      element.style.transform = `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`
    }

    const stopInertia = () => {
      if (inertiaFrame) cancelAnimationFrame(inertiaFrame)
      inertiaFrame = 0
    }

    const runInertia = () => {
      velocity = { x: velocity.x * INERTIA_DECAY, y: velocity.y * INERTIA_DECAY }
      rotation.x += velocity.x
      rotation.y += velocity.y
      applyRotation()

      if (
        Math.abs(velocity.x) > INERTIA_STOP_THRESHOLD ||
        Math.abs(velocity.y) > INERTIA_STOP_THRESHOLD
      ) {
        inertiaFrame = requestAnimationFrame(runInertia)
      } else {
        inertiaFrame = 0
      }
    }

    const handlePointerDown = (event: PointerEvent) => {
      stopInertia()
      dragging = true
      velocity = { x: 0, y: 0 }
      lastPointer = { x: event.clientX, y: event.clientY }
      element.setPointerCapture(event.pointerId)
      element.style.cursor = "grabbing"
    }

    const handlePointerMove = (event: PointerEvent) => {
      if (!dragging) return
      const deltaX = event.clientX - lastPointer.x
      const deltaY = event.clientY - lastPointer.y
      lastPointer = { x: event.clientX, y: event.clientY }

      // Arrastrar hacia abajo inclina el objeto "hacia el visitante"
      // (rotateX negativo), arrastrar a la derecha lo gira hacia ese lado.
      velocity = { x: -deltaY * DEGREES_PER_PIXEL, y: deltaX * DEGREES_PER_PIXEL }
      rotation.x += velocity.x
      rotation.y += velocity.y
      applyRotation()
    }

    const endDrag = (event: PointerEvent) => {
      if (!dragging) return
      dragging = false
      element.style.cursor = "grab"
      if (element.hasPointerCapture(event.pointerId)) {
        element.releasePointerCapture(event.pointerId)
      }
      if (!prefersReducedMotion) {
        inertiaFrame = requestAnimationFrame(runInertia)
      }
    }

    element.style.cursor = "grab"
    element.addEventListener("pointerdown", handlePointerDown)
    element.addEventListener("pointermove", handlePointerMove)
    element.addEventListener("pointerup", endDrag)
    element.addEventListener("pointercancel", endDrag)

    return () => {
      stopInertia()
      element.removeEventListener("pointerdown", handlePointerDown)
      element.removeEventListener("pointermove", handlePointerMove)
      element.removeEventListener("pointerup", endDrag)
      element.removeEventListener("pointercancel", endDrag)
    }
  }, [])

  return elementRef
}
