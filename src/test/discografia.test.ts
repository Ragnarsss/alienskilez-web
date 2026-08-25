import { describe, expect, it } from "vitest"
import { parseDiscographyCatalog } from "@/features/discografia/discografia"

const VALID_RELEASE = {
  id: "1uksWXl0utwHZIL154juWt",
  title: "20te",
  type: "single",
  releaseDate: "2025-02-07",
  coverUrl: "https://i.scdn.co/image/abc",
  spotifyUrl: "https://open.spotify.com/album/1uksWXl0utwHZIL154juWt",
  embedUrl: "https://open.spotify.com/embed/album/1uksWXl0utwHZIL154juWt",
}

describe("parseDiscographyCatalog", () => {
  it("extrae los lanzamientos de una respuesta válida", () => {
    const result = parseDiscographyCatalog({ releases: [VALID_RELEASE] })
    expect(result).toEqual([VALID_RELEASE])
  })

  it("acepta un catálogo vacío (el artista no tiene lanzamientos, no es un error)", () => {
    expect(parseDiscographyCatalog({ releases: [] })).toEqual([])
  })

  it("rechaza un body que no es un objeto", () => {
    expect(parseDiscographyCatalog(null)).toBeNull()
    expect(parseDiscographyCatalog("catálogo")).toBeNull()
    expect(parseDiscographyCatalog(42)).toBeNull()
  })

  it("rechaza un body sin la clave 'releases'", () => {
    expect(parseDiscographyCatalog({ error: "No se pudo obtener el catálogo de Spotify" })).toBeNull()
  })

  it("rechaza 'releases' que no es un array", () => {
    expect(parseDiscographyCatalog({ releases: "no es un array" })).toBeNull()
  })

  it("rechaza el catálogo entero si un solo elemento tiene forma inválida", () => {
    const malformed = { ...VALID_RELEASE, coverUrl: undefined }
    expect(parseDiscographyCatalog({ releases: [VALID_RELEASE, malformed] })).toBeNull()
  })
})
