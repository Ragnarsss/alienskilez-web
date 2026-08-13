import { readFileSync } from "node:fs"
import { fileURLToPath } from "node:url"
import { describe, expect, it } from "vitest"
import { THEME_COLORS } from "@/shared/constants/theme"

// Se lee el archivo real en vez de importarlo con `?raw`: el plugin de CSS
// de Vite intercepta ese import y devuelve string vacío bajo Vitest.
const CSS_PATH = fileURLToPath(new URL("../styles/index.css", import.meta.url))

/** Extrae el valor de un token declarado dentro del bloque `@theme`. */
function readThemeToken(css: string, token: string): string | undefined {
  return new RegExp(`--${token}:\\s*([^;]+);`).exec(css)?.[1]?.trim()
}

describe("THEME_COLORS", () => {
  // ADR-7: los tokens viven en CSS. THEME_COLORS es la única excepción,
  // porque Three.js no resuelve var(). Este test evita que la excepción
  // se convierta en deriva silenciosa (ver theme.ts).
  it("ACCENT sigue coincidiendo con --color-accent del CSS", () => {
    const css = readFileSync(CSS_PATH, "utf8")
    const cssAccent = readThemeToken(css, "color-accent")

    expect(cssAccent).toBeDefined()
    expect(THEME_COLORS.ACCENT.toLowerCase()).toBe(cssAccent?.toLowerCase())
  })
})
