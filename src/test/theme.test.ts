import { readFileSync } from "node:fs"
import { fileURLToPath } from "node:url"
import { describe, expect, it } from "vitest"
import { HERO_MARK } from "@/shared/constants/limits"

// Se lee el archivo real en vez de importarlo con `?raw`: el plugin de CSS
// de Vite intercepta ese import y devuelve string vacío bajo Vitest.
const CSS_PATH = fileURLToPath(new URL("../styles/index.css", import.meta.url))

/** Extrae el valor de un token declarado dentro del bloque `@theme`. */
function readThemeToken(css: string, token: string): string | undefined {
  return new RegExp(`--${token}:[ ]*([^;]+);`).exec(css)?.[1]?.trim()
}

describe("HERO_MARK.COLOR", () => {
  // ADR-7: los tokens viven en CSS. Este literal es la única excepción,
  // porque Three.js no resuelve var() sobre un canvas WebGL. El test evita
  // que la excepción se convierta en deriva silenciosa.
  it("sigue coincidiendo con --color-accent del CSS", () => {
    const cssAccent = readThemeToken(readFileSync(CSS_PATH, "utf8"), "color-accent")

    expect(cssAccent).toBeDefined()
    expect(HERO_MARK.COLOR.toLowerCase()).toBe(cssAccent?.toLowerCase())
  })
})
