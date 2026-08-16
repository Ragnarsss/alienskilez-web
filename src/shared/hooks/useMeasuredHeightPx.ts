import { useLayoutEffect, useState, type RefObject } from "react"

/**
 * Alto real (px) del nodo referenciado, medido con ResizeObserver.
 *
 * Existe para el pin del Hero: el sticky interno usa `min-h-[100svh]` y
 * puede crecer más allá de un viewport (headline+subtítulo+isotipo
 * apilados en mobile, por ejemplo). Cualquier cálculo que asuma "el sticky
 * mide un viewport" — el alto del wrapper que lo contiene, el punto de
 * scroll en el que se suelta — se desincroniza en cuanto el contenido real
 * no entra. Medir es la única fuente de verdad; ver Hero.tsx.
 *
 * `useLayoutEffect`, no `useEffect`: si algo (como el alto del wrapper del
 * pin) depende de esta medida para el layout, tiene que resolverse antes
 * del primer paint — con `useEffect` habría un frame con el valor de
 * arranque y después un salto visible al real.
 *
 * `null` mientras no hay medición todavía (primer paint) o si `enabled` es
 * `false` — el caller decide el fallback (p. ej. un valor fijo en CSS).
 */
export function useMeasuredHeightPx(ref: RefObject<HTMLElement | null>, enabled: boolean): number | null {
  const [heightPx, setHeightPx] = useState<number | null>(null)

  useLayoutEffect(() => {
    if (!enabled) return
    const node = ref.current
    if (!node) return

    const measure = () => setHeightPx(node.getBoundingClientRect().height)
    measure()

    const observer = new ResizeObserver(measure)
    observer.observe(node)
    return () => observer.disconnect()
  }, [ref, enabled])

  return heightPx
}
