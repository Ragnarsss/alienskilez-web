import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import { describe, expect, it } from "vitest"

const SVG_PATH = resolve(process.cwd(), "src/assets/alien-glyph.svg")
const svg = readFileSync(SVG_PATH, "utf8")

/**
 * El isotipo del Hero se extrae de este archivo y lo parsea el DOMParser del
 * navegador en modo `image/svg+xml`, que es **XML estricto**: cualquier error
 * de buen formato devuelve un `parsererror`, y entonces 3dsvg no encuentra
 * paths, aborta la extrusión y no muestra nada — sin ningún error en consola.
 *
 * Estos tests existen porque ese fallo ya ocurrió: un comentario de
 * documentación mencionaba una custom property de CSS, cuyo doble guion es
 * ilegal dentro de un comentario XML. Costó varias sesiones encontrarlo
 * porque los parsers permisivos (happy-dom, jsdom) lo aceptan sin chistar.
 */
describe("alien-glyph.svg", () => {
  it("no contiene '--' dentro de un comentario (XML lo prohíbe)", () => {
    const comentarios = svg.match(/<!--[\s\S]*?-->/g) ?? []
    const invalidos = comentarios.filter((c) => c.slice(4, -3).includes("--"))

    expect(invalidos).toEqual([])
  })

  it("tiene viewBox y al menos un path con datos", () => {
    expect(/viewBox="[\d.\-\s]+"/.test(svg)).toBe(true)
    expect(/\sd="[^"]{50,}"/.test(svg)).toBe(true)
  })

  it("mantiene fill-rule evenodd, que recorta los ojos en vez de rellenarlos", () => {
    expect(svg).toContain("evenodd")
  })

  it('mantiene pathLength="1", del que depende el trazado del preloader', () => {
    // El preloader dibuja el contorno animando `stroke-dashoffset` de 1 a 0.
    // Eso solo funciona si el largo del path está normalizado a 1: sin este
    // atributo el dash usa el largo real (decenas de unidades), el offset de 1
    // es imperceptible y el contorno aparece entero de una, sin dibujarse.
    // El archivo no puede llevar un comentario que lo explique — un comentario
    // XML acá ya rompió la extrusión 3D una vez.
    expect(/pathLength="1"/.test(svg)).toBe(true)
  })

  it("declara un fill distinto de none, o 3dsvg descarta el path", () => {
    // parseShapesFromSVG solo extruye paths cuyo estilo tenga fill real.
    expect(/fill="(?!none|transparent)[^"]+"/.test(svg)).toBe(true)
  })
})
