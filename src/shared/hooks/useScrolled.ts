import { useSyncExternalStore } from "react"
import { LIMITS } from "@/shared/constants/limits"

function subscribe(onChange: () => void) {
  window.addEventListener("scroll", onChange, { passive: true })
  return () => {
    window.removeEventListener("scroll", onChange)
  }
}

function getSnapshot() {
  return window.scrollY > LIMITS.NAVBAR_SCROLLED_OFFSET
}

/**
 * `true` cuando la página está scrolleada más allá del umbral.
 *
 * Vía useSyncExternalStore en vez de useState+useEffect: lee el valor real
 * en el primer render (sin parpadeo) y evita escribir estado dentro de un
 * efecto, que las reglas del React Compiler marcan como error.
 */
export function useScrolled(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, () => false)
}
