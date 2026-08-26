import { useLayoutEffect, useState, type RefObject } from "react"

/**
 * Ancho real (px) del nodo referenciado, medido con ResizeObserver. Mismo
 * patrón que `useMeasuredHeightPx` (ver ahí el porqué de `useLayoutEffect` y
 * de `null` como estado inicial) — existe aparte porque el carrusel de Video
 * (ALS-045, `VideoCarousel.tsx`) necesita medir ANCHO, no alto: cuánto mide
 * la fila real de cards contra cuánto mide la ventana visible del pin, para
 * calcular hasta dónde puede viajar el `translateX`.
 */
export function useMeasuredWidthPx(ref: RefObject<HTMLElement | null>, enabled: boolean): number | null {
  const [widthPx, setWidthPx] = useState<number | null>(null)

  useLayoutEffect(() => {
    if (!enabled) return
    const node = ref.current
    if (!node) return

    const measure = () => setWidthPx(node.getBoundingClientRect().width)
    measure()

    const observer = new ResizeObserver(measure)
    observer.observe(node)
    return () => observer.disconnect()
  }, [ref, enabled])

  return widthPx
}
