/**
 * Canal de cierre principal del negocio.
 *
 * ⚠️ BLOQUEANTE ANTES DE DESPLEGAR ⚠️
 * NUMBER es un placeholder. Reemplázalo por el número real en formato
 * internacional, sin `+`, sin espacios y sin guiones (ej. "56912345678").
 * Con el valor actual el sitio abre un chat inexistente y toda conversión
 * se pierde silenciosamente.
 */
export const WHATSAPP = {
  // TODO(cliente): número real de WhatsApp Business.
  NUMBER: "000000000000",
} as const

/** `true` mientras el número siga siendo el placeholder de arriba. */
export const IS_WHATSAPP_PLACEHOLDER = WHATSAPP.NUMBER === "000000000000"

/** Construye el enlace de WhatsApp con el mensaje ya precargado. */
export function buildWhatsAppUrl(message: string): string {
  return `https://wa.me/${WHATSAPP.NUMBER}?text=${encodeURIComponent(message)}`
}
