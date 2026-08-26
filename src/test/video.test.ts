import { describe, expect, it } from "vitest"
import { parseVideoCatalog } from "@/features/video/video"

const VALID_VIDEO = {
  id: "-9asaQaRbcg",
  title: "Tobal MJ x Kail BRL x Benji - 20te (Prod by Alienskilez x 19/20)",
  publishedAt: "2026-08-13T15:52:22Z",
  thumbnailUrl: "https://i.ytimg.com/vi/-9asaQaRbcg/maxresdefault.jpg",
  videoUrl: "https://www.youtube.com/watch?v=-9asaQaRbcg",
  embedUrl: "https://www.youtube.com/embed/-9asaQaRbcg",
}

describe("parseVideoCatalog", () => {
  it("extrae los videos de una respuesta válida", () => {
    const result = parseVideoCatalog({ videos: [VALID_VIDEO] })
    expect(result).toEqual([VALID_VIDEO])
  })

  it("acepta un catálogo vacío (el canal no tiene videos, no es un error)", () => {
    expect(parseVideoCatalog({ videos: [] })).toEqual([])
  })

  it("rechaza un body que no es un objeto", () => {
    expect(parseVideoCatalog(null)).toBeNull()
    expect(parseVideoCatalog("catálogo")).toBeNull()
    expect(parseVideoCatalog(42)).toBeNull()
  })

  it("rechaza un body sin la clave 'videos'", () => {
    expect(parseVideoCatalog({ error: "No se pudo obtener el catálogo de YouTube" })).toBeNull()
  })

  it("rechaza 'videos' que no es un array", () => {
    expect(parseVideoCatalog({ videos: "no es un array" })).toBeNull()
  })

  it("rechaza el catálogo entero si un solo elemento tiene forma inválida", () => {
    const malformed = { ...VALID_VIDEO, thumbnailUrl: undefined }
    expect(parseVideoCatalog({ videos: [VALID_VIDEO, malformed] })).toBeNull()
  })
})
