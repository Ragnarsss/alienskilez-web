import { readFileSync } from "node:fs"
import { fileURLToPath } from "node:url"
import { describe, expect, it } from "vitest"
import { PRELOADER } from "@/shared/constants/limits"

// Se lee el archivo real en vez de importarlo con `?raw`: el plugin de CSS de
// Vite intercepta ese import y devuelve string vacío bajo Vitest.
const CSS_PATH = fileURLToPath(new URL("../styles/index.css", import.meta.url))
const css = readFileSync(CSS_PATH, "utf8")

/** Lee una custom property declarada dentro del bloque `.preloader`. */
function readPreloaderMs(property: string): number | undefined {
  const match = new RegExp(`--preloader-${property}:[ ]*(\\d+)ms;`).exec(css)
  return match?.[1] ? Number(match[1]) : undefined
}

/**
 * La coreografía del preloader vive en CSS y el ciclo de vida en TypeScript.
 * Son dos relojes distintos midiendo lo mismo, y si se separan la falla es
 * silenciosa: el overlay se desmonta a mitad del bloom del wordmark, o se
 * queda unos cuantos cientos de milisegundos tapando el sitio sin nada que
 * mostrar. Este test los mantiene atados.
 */
describe("tiempos del preloader", () => {
  it("PRELOADER.TOTAL_MS coincide con --preloader-total del CSS", () => {
    expect(readPreloaderMs("total")).toBe(PRELOADER.TOTAL_MS)
  })

  it("PRELOADER.EXIT_MS coincide con --preloader-exit del CSS", () => {
    expect(readPreloaderMs("exit")).toBe(PRELOADER.EXIT_MS)
  })

  it("la secuencia CSS termina dentro del total declarado", () => {
    const wordmarkDelay = readPreloaderMs("wordmark-delay")
    const fillEnd = (readPreloaderMs("fill-delay") ?? 0) + (readPreloaderMs("fill") ?? 0)

    expect(wordmarkDelay).toBeDefined()
    expect(wordmarkDelay ?? 0).toBeLessThan(PRELOADER.TOTAL_MS)
    expect(fillEnd).toBeLessThanOrEqual(PRELOADER.TOTAL_MS)
  })
})
