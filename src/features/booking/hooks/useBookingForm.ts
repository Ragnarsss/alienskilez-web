import { zodResolver } from "@hookform/resolvers/zod"
import { useState } from "react"
import { useForm } from "react-hook-form"
import {
  bookingSchema,
  SERVICE_OPTIONS,
  type BookingFormValues,
} from "@/features/booking/booking.schema"
import { ANALYTICS_EVENTS } from "@/shared/constants/analytics"
import { SITE } from "@/shared/constants/site"
import { buildWhatsAppUrl } from "@/shared/constants/whatsapp"
import { trackEvent } from "@/shared/lib/analytics"

/**
 * Arma el mensaje que se precarga en WhatsApp.
 *
 * Función pura y exportada aparte del hook justo para poder testearla sin
 * montar React ni tocar `window`.
 */
export function buildWhatsAppMessage(data: BookingFormValues): string {
  const option = SERVICE_OPTIONS.find((item) => item.id === data.serviceType)
  const serviceLabel = option?.label ?? data.serviceType
  // El verbo sigue al mismo criterio que los dos CTAs del sitio: las líneas
  // "sesion" se agendan, las "proyecto" se cotizan.
  const intent =
    option?.tier === "sesion"
      ? `Quiero agendar una sesión de: ${serviceLabel}.`
      : `Quiero cotizar un proyecto de: ${serviceLabel}.`

  const trimmedMessage = data.message?.trim()
  const trimmedSoundReference = data.soundReferenceUrl?.trim()

  const lines = [
    `Hola ${SITE.NAME}, soy ${data.fullName.trim()}.`,
    intent,
    data.preferredDate ? `Fecha estimada: ${data.preferredDate}.` : null,
    trimmedSoundReference ? `Referencia de sonido: ${trimmedSoundReference}` : null,
    trimmedMessage ? `Detalle: ${trimmedMessage}` : null,
  ].filter((line): line is string => line !== null)

  return lines.join("\n")
}

export const BOOKING_DEFAULT_VALUES: BookingFormValues = {
  fullName: "",
  // Deja el <select> en la opción vacía: obliga a una elección consciente en
  // vez de sesgar el lead hacia el primer servicio de la lista.
  serviceType: "",
  preferredDate: "",
  message: "",
  soundReferenceUrl: "",
}

export function useBookingForm() {
  const form = useForm<BookingFormValues>({
    resolver: zodResolver(bookingSchema),
    defaultValues: BOOKING_DEFAULT_VALUES,
    mode: "onTouched",
  })

  // `null` mientras no haya un intento bloqueado — ALS-018: `window.open`
  // puede devolver `null` si el navegador bloquea la pestaña emergente, y
  // sin esto el visitante hace clic y no ve pasar nada, creyendo que ya
  // envió su consulta. Guarda la URL YA armada (mensaje incluido) para que
  // el componente pueda ofrecer un link real que la abra — un click directo
  // sobre un `<a>` es gesto de usuario, no lo bloquea el navegador aunque
  // `window.open` programático sí lo haya bloqueado.
  const [blockedWhatsAppUrl, setBlockedWhatsAppUrl] = useState<string | null>(null)

  const onSubmit = (data: BookingFormValues) => {
    // Solo se llega acá si zod ya validó `data` (react-hook-form no invoca
    // `onSubmit` si hay errores) — este es el punto de "envío válido" del
    // embudo (ALS-023). Cero PII en el evento: ni `data.fullName` ni
    // `data.message` viajan, solo el `tier` del servicio elegido.
    const tier = SERVICE_OPTIONS.find((option) => option.id === data.serviceType)?.tier
    trackEvent(ANALYTICS_EVENTS.FORM_SUBMIT, tier ? { tier } : undefined)

    const url = buildWhatsAppUrl(buildWhatsAppMessage(data))

    // Sin `noopener`/`noreferrer` en el string de features: con cualquiera
    // de los dos, la especificación obliga a que el valor de retorno sea
    // siempre `null` — no hay forma de distinguir "el navegador bloqueó el
    // popup" (ALS-018) de "se abrió bien" si se usan. En vez de eso, se abre
    // sin ellos y se anula `opener` a mano: mismo blindaje contra reverse
    // tabnabbing, con un valor de retorno que sí sirve para medir.
    const popup = window.open(url, "_blank")
    if (popup) {
      popup.opener = null
      setBlockedWhatsAppUrl(null)
      trackEvent(ANALYTICS_EVENTS.WHATSAPP_OPEN, tier ? { tier } : undefined)
    } else {
      setBlockedWhatsAppUrl(url)
      trackEvent(ANALYTICS_EVENTS.WHATSAPP_BLOCKED, tier ? { tier } : undefined)
    }
  }

  return {
    form,
    submitForm: form.handleSubmit(onSubmit),
    blockedWhatsAppUrl,
  }
}
