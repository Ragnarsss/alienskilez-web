/**
 * Testimonios de artistas.
 *
 * Mismo criterio que las métricas de alcance: no se inventan citas. Los
 * slots quedan con contenido explícitamente marcado como pendiente para que
 * sea imposible confundirlo con un testimonio real y publicarlo por error.
 *
 * Al llenarlos, pide la cita por escrito al artista (un audio de WhatsApp
 * transcrito sirve) y su autorización para publicarla con nombre.
 */
export interface Testimonial {
  readonly id: string
  readonly quote: string
  readonly author: string
  readonly role: string
  readonly pending: boolean
}

export const TESTIMONIALS = [
  {
    id: "slot-1",
    quote: "[Testimonio pendiente — cita textual del artista sobre la sesión]",
    author: "[Nombre del artista]",
    role: "[Género o proyecto]",
    pending: true,
  },
  {
    id: "slot-2",
    quote: "[Testimonio pendiente — cita textual del artista sobre la sesión]",
    author: "[Nombre del artista]",
    role: "[Género o proyecto]",
    pending: true,
  },
  {
    id: "slot-3",
    quote: "[Testimonio pendiente — cita textual del artista sobre la sesión]",
    author: "[Nombre del artista]",
    role: "[Género o proyecto]",
    pending: true,
  },
] as const satisfies readonly Testimonial[]

export const HAS_PENDING_TESTIMONIALS = TESTIMONIALS.some((testimonial) => testimonial.pending)
