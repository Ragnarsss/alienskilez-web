import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import {
  bookingSchema,
  SERVICE_OPTIONS,
  type BookingFormValues,
} from "@/features/booking/booking.schema"
import { SITE } from "@/shared/constants/site"
import { buildWhatsAppUrl } from "@/shared/constants/whatsapp"

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

  const lines = [
    `Hola ${SITE.NAME}, soy ${data.fullName.trim()}.`,
    intent,
    data.preferredDate ? `Fecha estimada: ${data.preferredDate}.` : null,
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
}

export function useBookingForm() {
  const form = useForm<BookingFormValues>({
    resolver: zodResolver(bookingSchema),
    defaultValues: BOOKING_DEFAULT_VALUES,
    mode: "onTouched",
  })

  const onSubmit = (data: BookingFormValues) => {
    window.open(buildWhatsAppUrl(buildWhatsAppMessage(data)), "_blank", "noopener,noreferrer")
  }

  return {
    form,
    submitForm: form.handleSubmit(onSubmit),
  }
}
