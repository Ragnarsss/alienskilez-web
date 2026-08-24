import { useSyncExternalStore } from "react"

interface QueryHandlers {
  subscribe: (onChange: () => void) => () => void
  getSnapshot: () => boolean
}

/**
 * `subscribe`/`getSnapshot` cacheados por query. Si se crearan de nuevo en
 * cada render, `useSyncExternalStore` los ve como "distintos" cada vez (falla
 * la comparación por referencia) y se resuscribe en cada render — no rompe
 * nada visible, pero es trabajo repetido en cada re-render de quien use el
 * hook. Un `Map` a nivel de módulo evita esa recreación sin usar `useMemo`
 * (el React Compiler memoiza el componente, no reemplaza una cache externa
 * a su ciclo de vida).
 */
const handlersCache = new Map<string, QueryHandlers>()

function getHandlers(query: string): QueryHandlers {
  const cached = handlersCache.get(query)
  if (cached) return cached

  const handlers: QueryHandlers = {
    subscribe(onChange) {
      const mediaQueryList = window.matchMedia(query)
      mediaQueryList.addEventListener("change", onChange)
      return () => {
        mediaQueryList.removeEventListener("change", onChange)
      }
    },
    getSnapshot() {
      return window.matchMedia(query).matches
    },
  }
  handlersCache.set(query, handlers)
  return handlers
}

/**
 * `true` mientras `query` coincide. Mismo patrón que `useScrolled` y
 * `usePrefersReducedMotion` (`useSyncExternalStore`, sin parpadeo en el
 * primer render y sin `setState` dentro de un efecto), parametrizado por
 * query para no repetir el hook por cada breakpoint con nombre de `MEDIA`.
 */
export function useMediaQuery(query: string): boolean {
  const { subscribe, getSnapshot } = getHandlers(query)
  return useSyncExternalStore(subscribe, getSnapshot, () => false)
}
