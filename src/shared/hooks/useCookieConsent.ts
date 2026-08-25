import { useSyncExternalStore } from "react"
import { loadGtag } from "@/shared/lib/analytics"
import {
  getConsentSnapshot,
  setConsent,
  subscribeConsent,
  type ConsentStatus,
} from "@/shared/lib/consent"

/**
 * Estado de consentimiento de cookies (ALS-023, ADR-15) vía
 * `useSyncExternalStore` — mismo criterio que `useMediaQuery`: lee el valor
 * real (de `localStorage`) en el primer render, sin el parpadeo que tendría
 * un `useState` + `useEffect`.
 */
export function useCookieConsent(): {
  status: ConsentStatus
  accept: () => void
  reject: () => void
} {
  const status = useSyncExternalStore(subscribeConsent, getConsentSnapshot, (): ConsentStatus => "pending")

  return {
    status,
    accept: () => {
      setConsent("granted")
      // Carga el script recién ahora, con la decisión ya tomada — nunca
      // antes de que el visitante acepte.
      loadGtag()
    },
    reject: () => {
      setConsent("denied")
    },
  }
}
