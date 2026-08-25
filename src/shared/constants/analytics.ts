/**
 * Analítica de conversión (ALS-023, ADR-15 — GA4 estándar + aviso de cookies
 * mínimo no bloqueante). Ver skill `analitica-conversion` para el porqué.
 */

const PLACEHOLDER_ID = "G-XXXXXXXXXX"

/**
 * Measurement ID de la propiedad GA4. Vacío o el placeholder de
 * `.env.example` mientras no se configure `VITE_GA_MEASUREMENT_ID` — mismo
 * criterio que `IS_WHATSAPP_PLACEHOLDER` (whatsapp.ts): un valor que falta
 * apaga la función en silencio, no rompe el build.
 */
export const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID ?? ""

/** `true` mientras no haya un Measurement ID real configurado. */
export const IS_GA_PLACEHOLDER =
  GA_MEASUREMENT_ID === "" || GA_MEASUREMENT_ID === PLACEHOLDER_ID

/**
 * Nombres de evento del embudo (HU-ANL-001). Un solo lugar para no repetir
 * strings sueltos entre los componentes que disparan cada uno.
 */
export const ANALYTICS_EVENTS = {
  /** Clic en cualquiera de los CTA ("Agenda tu sesión" / "Cotiza tu proyecto"), con su `tier`. */
  CTA_CLICK: "cta_click",
  /** El formulario de `Contacto` pasó la validación de zod — envío válido. */
  FORM_SUBMIT: "booking_form_submit",
  /** `window.open` al chat de WhatsApp se ejecutó sin bloqueo del navegador. */
  WHATSAPP_OPEN: "whatsapp_open",
  /**
   * El navegador bloqueó la pestaña emergente (mismo caso que ALS-018) — dato
   * de embudo roto por el navegador, no ruido a descartar.
   */
  WHATSAPP_BLOCKED: "whatsapp_blocked",
} as const

/** Llave de `localStorage` donde vive la decisión de cookies del visitante. */
export const COOKIE_CONSENT_STORAGE_KEY = "als-cookie-consent"
