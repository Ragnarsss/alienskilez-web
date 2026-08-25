import { ANALYTICS_EVENTS, GA_MEASUREMENT_ID, IS_GA_PLACEHOLDER } from "@/shared/constants/analytics"
import { getConsentSnapshot, type ConsentStatus } from "@/shared/lib/consent"
import type { ServiceTier } from "@/shared/constants/services"

/**
 * Decide si un evento debe viajar a GA4. Función pura — sin `window`, sin
 * `localStorage` — para poder testearla sin DOM (el resto de este módulo sí
 * toca `window` y por eso no se testea, mismo criterio que `useLenis`).
 *
 * Cero PII es una regla de qué datos arma cada `trackEvent(...)`, no de
 * este gate — acá solo decide si el evento sale o no.
 */
export function shouldSendEvent(consent: ConsentStatus, isPlaceholder: boolean): boolean {
  return consent === "granted" && !isPlaceholder
}

declare global {
  interface Window {
    dataLayer?: unknown[]
    gtag?: (...args: unknown[]) => void
  }
}

let gtagLoaded = false

/**
 * Inyecta `gtag.js` de forma async/diferida. Idempotente — llamarla más de
 * una vez (el visitante acepta, recarga, vuelve a aceptar) no duplica el
 * script. No hace nada si el Measurement ID sigue siendo el placeholder:
 * cargar el script contra un ID que no existe no mide nada, solo suma peso.
 */
export function loadGtag(): void {
  if (gtagLoaded || IS_GA_PLACEHOLDER) return
  gtagLoaded = true

  const script = document.createElement("script")
  script.async = true
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`
  document.head.appendChild(script)

  window.dataLayer = window.dataLayer ?? []
  window.gtag = function gtag(...args: unknown[]) {
    window.dataLayer?.push(args)
  }
  window.gtag("js", new Date())
  // `anonymize_ip` ya no aplica en GA4 (la IP no se registra por diseño);
  // no hace falta pasarlo.
  window.gtag("config", GA_MEASUREMENT_ID)
}

/**
 * Dispara un evento del embudo (HU-ANL-001). Cero PII: `params` solo debe
 * llevar hechos del evento (`tier`, éxito/error), nunca nombre, teléfono ni
 * el campo `message` del formulario — quien llama es responsable de eso,
 * este módulo no sanitiza el payload.
 *
 * No hace nada si el visitante no dio consentimiento o si GA4 no está
 * configurado — ver `shouldSendEvent`.
 */
export function trackEvent(name: string, params?: Record<string, string>): void {
  if (!shouldSendEvent(getConsentSnapshot(), IS_GA_PLACEHOLDER)) return
  loadGtag()
  window.gtag?.("event", name, params)
}

/**
 * Clic en cualquiera de los CTA de negocio ("Agenda tu sesión" / "Cotiza tu
 * proyecto"), con su `tier` — se llama igual desde el Hero, el Navbar, cada
 * `ServiceCard` y el mazo de Servicios, así que vive acá una sola vez en vez
 * de repetir el nombre del evento en cada sección.
 */
export function trackCtaClick(tier: ServiceTier): void {
  trackEvent(ANALYTICS_EVENTS.CTA_CLICK, { tier })
}
