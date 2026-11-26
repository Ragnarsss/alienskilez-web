import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import { describe, expect, it } from "vitest"

const read = (relative: string) => readFileSync(resolve(process.cwd(), relative), "utf8")

const ORIGIN = "https://deotroplaneta.cl"

const indexHtml = read("index.html")
const sitemap = read("public/sitemap.xml")
const robots = read("public/robots.txt")

/**
 * El dominio canónico (apex, https, sin www) vive repetido en tres archivos
 * que no se importan entre sí. Si alguien cambia uno solo, Google recibe
 * señales contradictorias y el error no se ve en el sitio. Estos tests fallan
 * si se desalinean.
 */
describe("SEO: sitemap, robots y canonical", () => {
  it("index.html declara el canonical y og:url con el origen canónico", () => {
    expect(indexHtml).toContain(`<link rel="canonical" href="${ORIGIN}/" />`)
    expect(indexHtml).toContain(`<meta property="og:url" content="${ORIGIN}/" />`)
  })

  it("robots.txt apunta al sitemap del origen canónico", () => {
    expect(robots).toContain(`Sitemap: ${ORIGIN}/sitemap.xml`)
  })

  it("sitemap.xml es XML con el namespace correcto y solo URLs del origen canónico", () => {
    expect(sitemap.startsWith('<?xml version="1.0" encoding="UTF-8"?>')).toBe(true)
    expect(sitemap).toContain('xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"')

    const locs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1] ?? "")
    expect(locs.length).toBeGreaterThan(0)
    for (const loc of locs) {
      expect(loc.startsWith(`${ORIGIN}/`)).toBe(true)
    }
  })

  it("cada lastmod es una fecha ISO válida (YYYY-MM-DD)", () => {
    const dates = [...sitemap.matchAll(/<lastmod>([^<]+)<\/lastmod>/g)].map((m) => m[1] ?? "")
    for (const date of dates) {
      expect(date).toMatch(/^\d{4}-\d{2}-\d{2}$/)
      expect(Number.isNaN(Date.parse(date))).toBe(false)
    }
  })
})
