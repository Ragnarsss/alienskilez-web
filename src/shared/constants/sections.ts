/** Anchors de scroll del one-pager. Ningún `href="#..."` suelto en el JSX. */
export const SECTION_IDS = {
  MAIN: "contenido",
  ESTUDIO: "estudio",
  SERVICIOS: "servicios",
  PORTFOLIO: "portfolio",
  DISCOGRAFIA: "discografia",
  ALCANCE: "alcance",
  PROCESO: "proceso",
  TESTIMONIOS: "testimonios",
  FAQ: "faq",
  CONTACTO: "contacto",
} as const

export const anchor = (id: string) => `#${id}`

/** Enlaces del navbar, en orden de aparición. */
export const NAV_LINKS = [
  { id: SECTION_IDS.SERVICIOS, label: "Servicios" },
  { id: SECTION_IDS.PORTFOLIO, label: "Portfolio" },
  { id: SECTION_IDS.PROCESO, label: "Proceso" },
  { id: SECTION_IDS.FAQ, label: "FAQ" },
  { id: SECTION_IDS.CONTACTO, label: "Contacto" },
] as const
