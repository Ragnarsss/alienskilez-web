import { COOKIE_CONSENT_STORAGE_KEY } from "@/shared/constants/analytics"

export type ConsentStatus = "pending" | "granted" | "denied"

const GRANTED = "granted"
const DENIED = "denied"

/**
 * Decide qué status representa un valor crudo de `localStorage`. Función
 * pura y testeable aparte de cualquier acceso a `window` — `undefined` (la
 * llave nunca se escribió, o el storage no está disponible) es "pending":
 * el visitante todavía no vio el aviso o no decidió.
 */
export function parseConsentValue(raw: string | null | undefined): ConsentStatus {
  if (raw === GRANTED) return GRANTED
  if (raw === DENIED) return DENIED
  return "pending"
}

const listeners = new Set<() => void>()

function readStorage(): string | null {
  try {
    return window.localStorage.getItem(COOKIE_CONSENT_STORAGE_KEY)
  } catch {
    // Storage no disponible (modo privado estricto, iframe con permisos
    // reducidos, etc.) — se degrada a "pending" en vez de romper el sitio.
    return null
  }
}

/** Snapshot para `useSyncExternalStore` — mismo patrón que `useMediaQuery`. */
export function getConsentSnapshot(): ConsentStatus {
  return parseConsentValue(readStorage())
}

export function subscribeConsent(onChange: () => void): () => void {
  listeners.add(onChange)
  return () => {
    listeners.delete(onChange)
  }
}

function writeStorage(value: string): boolean {
  try {
    window.localStorage.setItem(COOKIE_CONSENT_STORAGE_KEY, value)
    return true
  } catch {
    return false
  }
}

/**
 * Persiste la decisión del visitante y notifica a los suscriptores (el
 * banner, que debe ocultarse apenas hay una decisión). Devuelve `false` si
 * el storage no está disponible — quien llama puede optar por no ocultar el
 * aviso en ese caso, pero por ahora no hay UI que dependa de eso.
 */
export function setConsent(status: "granted" | "denied"): boolean {
  const ok = writeStorage(status)
  for (const listener of listeners) listener()
  return ok
}
