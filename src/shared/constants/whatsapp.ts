/**
 * Canal de cierre principal del negocio.
 *
 * NUMBER es hoy un WhatsApp personal (ALS-001). Cuando exista la cuenta de
 * WhatsApp Business (ALS-030) el número puede cambiar — sigue viviendo acá
 * y en ningún otro lugar del código.
 */
export const WHATSAPP = {
  NUMBER: "56938765513",
} as const

const PLACEHOLDER_NUMBER = "000000000000"

/** `true` mientras el número siga siendo el placeholder original. */
export const IS_WHATSAPP_PLACEHOLDER = (WHATSAPP.NUMBER as string) === PLACEHOLDER_NUMBER

/** Construye el enlace de WhatsApp con el mensaje ya precargado. */
export function buildWhatsAppUrl(message: string): string {
  return `https://wa.me/${WHATSAPP.NUMBER}?text=${encodeURIComponent(message)}`
}
