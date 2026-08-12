import { z } from "zod"
import { LIMITS } from "@/shared/constants/limits"
import { OTHER_SERVICE, SERVICES } from "@/shared/constants/services"

/**
 * Opciones del selector de servicio: las 10 líneas reales + la opción de
 * escape para quien todavía no sabe qué necesita (esa persona igual es un
 * lead válido, y forzarla a elegir mal la haría abandonar el formulario).
 */
export const SERVICE_OPTIONS = [
  ...SERVICES.map(({ id, label, tier }) => ({ id, label, tier })),
  { ...OTHER_SERVICE, tier: "proyecto" as const },
] as const

const SERVICE_IDS = SERVICE_OPTIONS.map((option) => option.id) as [string, ...string[]]

/** Fecha local de hoy en formato YYYY-MM-DD, igual al de `<input type="date">`. */
export function todayAsInputValue(now: Date = new Date()): string {
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, "0")
  const day = String(now.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

export const bookingSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(LIMITS.BOOKING_NAME_MIN_LENGTH, "Ingresa tu nombre")
    .max(LIMITS.BOOKING_NAME_MAX_LENGTH, `Máximo ${LIMITS.BOOKING_NAME_MAX_LENGTH} caracteres`),
  serviceType: z.enum(SERVICE_IDS, { message: "Selecciona el tipo de servicio" }),
  preferredDate: z
    .string()
    .optional()
    // Las fechas en formato YYYY-MM-DD ordenan lexicográficamente, así que
    // comparar strings evita construir Date y lidiar con zonas horarias.
    .refine((value) => !value || value >= todayAsInputValue(), {
      message: "La fecha no puede ser anterior a hoy",
    }),
  message: z
    .string()
    .trim()
    .max(
      LIMITS.BOOKING_MESSAGE_MAX_LENGTH,
      `Máximo ${LIMITS.BOOKING_MESSAGE_MAX_LENGTH} caracteres`,
    )
    .optional(),
})

export type BookingFormValues = z.infer<typeof bookingSchema>
