import { describe, expect, it } from "vitest"
import { shouldSendEvent } from "@/shared/lib/analytics"
import { parseConsentValue } from "@/shared/lib/consent"

describe("parseConsentValue", () => {
  it("reconoce 'granted'", () => {
    expect(parseConsentValue("granted")).toBe("granted")
  })

  it("reconoce 'denied'", () => {
    expect(parseConsentValue("denied")).toBe("denied")
  })

  it("cae a 'pending' cuando la llave nunca se escribió (null)", () => {
    expect(parseConsentValue(null)).toBe("pending")
  })

  it("cae a 'pending' con un valor corrupto o desconocido", () => {
    expect(parseConsentValue("cualquier-otra-cosa")).toBe("pending")
  })
})

describe("shouldSendEvent", () => {
  it("envía el evento con consentimiento otorgado y un Measurement ID real", () => {
    expect(shouldSendEvent("granted", false)).toBe(true)
  })

  it("no envía nada si el visitante todavía no decidió", () => {
    expect(shouldSendEvent("pending", false)).toBe(false)
  })

  it("no envía nada si el visitante rechazó, aunque haya Measurement ID real", () => {
    expect(shouldSendEvent("denied", false)).toBe(false)
  })

  it("no envía nada mientras el Measurement ID siga siendo el placeholder, aunque haya consentimiento", () => {
    expect(shouldSendEvent("granted", true)).toBe(false)
  })
})
