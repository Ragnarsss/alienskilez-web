import { useSyncExternalStore } from "react"

const QUERY = "(prefers-reduced-motion: reduce)"

function subscribe(onChange: () => void) {
    const mediaQueryList = window.matchMedia(QUERY)
    mediaQueryList.addEventListener("change", onChange)
    return () => {
        mediaQueryList.removeEventListener("change", onChange)
    }
}

function getSnapshot() {
    return window.matchMedia(QUERY).matches
}

/**
 * `true` si el usuario pide menos movimiento. Vía useSyncExternalStore (mismo
 * criterio que useScrolled): lee el valor real en el primer render, sin el
 * parpadeo que tendría un efecto — importante acá porque el valor decide la
 * estructura del DOM del Hero (con o sin scroll-pin), no solo una animación.
 */
export function usePrefersReducedMotion(): boolean {
    return useSyncExternalStore(subscribe, getSnapshot, () => false)
}
