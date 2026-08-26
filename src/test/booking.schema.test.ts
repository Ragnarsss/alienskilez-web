import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { bookingSchema, todayAsInputValue } from "@/features/booking/booking.schema"
import {
  BOOKING_DEFAULT_VALUES,
  buildWhatsAppMessage,
} from "@/features/booking/hooks/useBookingForm"
import { LIMITS } from "@/shared/constants/limits"
import { SITE } from "@/shared/constants/site"

const VALID = {
  fullName: "Ana Rivas",
  serviceType: "mezcla",
  preferredDate: "",
  message: "",
  soundReferenceUrl: "",
}

describe("bookingSchema", () => {
  it("acepta un formulario con solo los campos obligatorios", () => {
    const result = bookingSchema.safeParse(VALID)
    expect(result.success).toBe(true)
  })

  it("rechaza un nombre demasiado corto", () => {
    const result = bookingSchema.safeParse({ ...VALID, fullName: "A" })
    expect(result.success).toBe(false)
    expect(result.error?.issues[0]?.message).toBe("Ingresa tu nombre")
  })

  it("rechaza un nombre que solo tiene espacios", () => {
    const result = bookingSchema.safeParse({ ...VALID, fullName: "   " })
    expect(result.success).toBe(false)
  })

  it("rechaza un nombre por sobre el largo máximo", () => {
    const result = bookingSchema.safeParse({
      ...VALID,
      fullName: "x".repeat(LIMITS.BOOKING_NAME_MAX_LENGTH + 1),
    })
    expect(result.success).toBe(false)
  })

  it("rechaza el valor vacío del selector de servicio", () => {
    const result = bookingSchema.safeParse({ ...VALID, serviceType: "" })
    expect(result.success).toBe(false)
    expect(result.error?.issues[0]?.message).toBe("Selecciona el tipo de servicio")
  })

  it("rechaza un servicio que no está en la lista", () => {
    const result = bookingSchema.safeParse({ ...VALID, serviceType: "cocina-molecular" })
    expect(result.success).toBe(false)
  })

  it("acepta la opción de escape 'otro'", () => {
    const result = bookingSchema.safeParse({ ...VALID, serviceType: "otro" })
    expect(result.success).toBe(true)
  })

  it("rechaza un mensaje que supera el límite", () => {
    const result = bookingSchema.safeParse({
      ...VALID,
      message: "x".repeat(LIMITS.BOOKING_MESSAGE_MAX_LENGTH + 1),
    })
    expect(result.success).toBe(false)
  })

  it("acepta un mensaje justo en el límite", () => {
    const result = bookingSchema.safeParse({
      ...VALID,
      message: "x".repeat(LIMITS.BOOKING_MESSAGE_MAX_LENGTH),
    })
    expect(result.success).toBe(true)
  })

  describe("soundReferenceUrl", () => {
    it("acepta que venga vacío (es opcional)", () => {
      expect(bookingSchema.safeParse({ ...VALID, soundReferenceUrl: "" }).success).toBe(true)
    })

    it("acepta una URL válida", () => {
      const result = bookingSchema.safeParse({
        ...VALID,
        soundReferenceUrl: "https://open.spotify.com/track/abc123",
      })
      expect(result.success).toBe(true)
    })

    it("rechaza un valor que no es una URL", () => {
      const result = bookingSchema.safeParse({ ...VALID, soundReferenceUrl: "quiero que suene así" })
      expect(result.success).toBe(false)
      expect(result.error?.issues[0]?.message).toBe(
        "Ingresa un enlace válido (ej. Spotify, YouTube, Drive)",
      )
    })

    it("rechaza una URL por sobre el largo máximo", () => {
      const longPath = "x".repeat(LIMITS.BOOKING_SOUND_REFERENCE_URL_MAX_LENGTH)
      const result = bookingSchema.safeParse({
        ...VALID,
        soundReferenceUrl: `https://example.com/${longPath}`,
      })
      expect(result.success).toBe(false)
    })
  })

  describe("preferredDate", () => {
    beforeEach(() => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date(2026, 5, 15, 12, 0, 0))
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it("acepta que la fecha venga vacía (es opcional)", () => {
      expect(bookingSchema.safeParse({ ...VALID, preferredDate: "" }).success).toBe(true)
    })

    it("acepta una fecha futura", () => {
      expect(bookingSchema.safeParse({ ...VALID, preferredDate: "2026-07-01" }).success).toBe(true)
    })

    it("acepta la fecha de hoy", () => {
      expect(bookingSchema.safeParse({ ...VALID, preferredDate: "2026-06-15" }).success).toBe(true)
    })

    it("rechaza una fecha anterior a hoy", () => {
      const result = bookingSchema.safeParse({ ...VALID, preferredDate: "2026-06-14" })
      expect(result.success).toBe(false)
      expect(result.error?.issues[0]?.message).toBe("La fecha no puede ser anterior a hoy")
    })

    it("formatea la fecha local con ceros a la izquierda", () => {
      expect(todayAsInputValue(new Date(2026, 0, 5))).toBe("2026-01-05")
    })
  })
})

describe("buildWhatsAppMessage", () => {
  it("usa el verbo 'agendar' para los servicios de tipo sesión", () => {
    const message = buildWhatsAppMessage({ ...VALID, serviceType: "mezcla" })
    expect(message).toBe(`Hola ${SITE.NAME}, soy Ana Rivas.\nQuiero agendar una sesión de: Mezcla.`)
  })

  it("usa el verbo 'cotizar' para los servicios de tipo proyecto", () => {
    const message = buildWhatsAppMessage({ ...VALID, serviceType: "marketing" })
    expect(message).toContain("Quiero cotizar un proyecto de: Marketing.")
  })

  it("resuelve el id del servicio a su etiqueta legible", () => {
    const message = buildWhatsAppMessage({ ...VALID, serviceType: "construccion-estudios" })
    expect(message).toContain("Construcción de estudios")
    expect(message).not.toContain("construccion-estudios")
  })

  it("omite la fecha cuando no se indicó", () => {
    const message = buildWhatsAppMessage({ ...VALID, preferredDate: "" })
    expect(message).not.toContain("Fecha estimada")
  })

  it("incluye la fecha cuando se indicó", () => {
    const message = buildWhatsAppMessage({ ...VALID, preferredDate: "2026-09-30" })
    expect(message).toContain("Fecha estimada: 2026-09-30.")
  })

  it("omite la referencia de sonido cuando no se indicó", () => {
    const message = buildWhatsAppMessage({ ...VALID, soundReferenceUrl: "" })
    expect(message).not.toContain("Referencia de sonido")
  })

  it("incluye la referencia de sonido cuando se indicó", () => {
    const message = buildWhatsAppMessage({
      ...VALID,
      soundReferenceUrl: "https://open.spotify.com/track/abc123",
    })
    expect(message).toContain("Referencia de sonido: https://open.spotify.com/track/abc123")
  })

  it("omite el detalle cuando el mensaje viene vacío o en blanco", () => {
    expect(buildWhatsAppMessage({ ...VALID, message: "" })).not.toContain("Detalle")
    expect(buildWhatsAppMessage({ ...VALID, message: "   " })).not.toContain("Detalle")
  })

  it("incluye el detalle recortado cuando hay mensaje", () => {
    const message = buildWhatsAppMessage({ ...VALID, message: "  Tengo 3 tracks listos  " })
    expect(message).toContain("Detalle: Tengo 3 tracks listos")
  })

  it("arma el mensaje completo con todos los campos", () => {
    const message = buildWhatsAppMessage({
      fullName: "  Kali  ",
      serviceType: "produccion",
      preferredDate: "2026-10-02",
      soundReferenceUrl: "https://open.spotify.com/track/abc123",
      message: "Busco un sonido tipo trap melódico.",
    })

    expect(message).toBe(
      [
        `Hola ${SITE.NAME}, soy Kali.`,
        "Quiero agendar una sesión de: Producción musical.",
        "Fecha estimada: 2026-10-02.",
        "Referencia de sonido: https://open.spotify.com/track/abc123",
        "Detalle: Busco un sonido tipo trap melódico.",
      ].join("\n"),
    )
  })

  it("cae al id crudo si el servicio no existe, en vez de romper", () => {
    const message = buildWhatsAppMessage({ ...VALID, serviceType: "servicio-fantasma" })
    expect(message).toContain("servicio-fantasma")
  })

  it("los valores por defecto del formulario no pasan la validación", () => {
    // Garantiza que el form arranca vacío y exige una elección consciente.
    expect(bookingSchema.safeParse(BOOKING_DEFAULT_VALUES).success).toBe(false)
  })
})
