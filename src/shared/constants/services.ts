/**
 * Las 10 líneas de servicio reales de ALIENSKILEZ.
 *
 * `tier` define qué CTA muestra cada card:
 *  - "sesion"   -> "Agenda tu sesión"   (trabajo con fecha y sala reservada)
 *  - "proyecto" -> "Cotiza tu proyecto" (trabajo por alcance, no por sesión)
 *
 * Ambos CTAs llevan al mismo formulario (#contacto): cambia el copy, no el
 * destino. El visitante elige el servicio exacto en el propio selector.
 */
export type ServiceTier = "sesion" | "proyecto"

export interface Service {
  readonly id: string
  readonly label: string
  readonly description: string
  readonly tier: ServiceTier
}

export const SERVICES = [
  {
    id: "produccion",
    label: "Producción musical",
    description:
      "Del demo al track terminado: beatmaking, arreglos y dirección de sonido para que la idea llegue a su versión final.",
    tier: "sesion",
  },
  {
    id: "grabacion",
    label: "Grabación",
    description:
      "Captura de voces e instrumentos con acompañamiento técnico en sala. Tomas dirigidas, no solo apretar rec.",
    tier: "sesion",
  },
  {
    id: "mezcla",
    label: "Mezcla",
    description:
      "Balance, espacio y carácter. Cada elemento en su lugar para que el track suene parejo en cualquier parlante.",
    tier: "sesion",
  },
  {
    id: "master",
    label: "Masterización",
    description:
      "El paso final antes de publicar: volumen competitivo y traducción consistente en streaming, radio y club.",
    tier: "sesion",
  },
  {
    id: "visuales",
    label: "Visuales",
    description:
      "Contenido visual que acompaña el lanzamiento: video, cover art y piezas para redes con la misma identidad del track.",
    tier: "sesion",
  },
  {
    id: "show-en-vivo",
    label: "Show en vivo",
    description:
      "Armado del set en vivo: pistas, transiciones y montaje técnico para que el directo suene como el disco.",
    tier: "sesion",
  },
  {
    id: "asesoria",
    label: "Asesoría musical",
    description:
      "Sesión de dirección artística: qué grabar, en qué orden y con qué criterio para que el catálogo tenga sentido.",
    tier: "proyecto",
  },
  {
    id: "manager",
    label: "Manager",
    description:
      "Gestión de carrera: planificación de lanzamientos, contactos y decisiones que un artista solo no alcanza a cubrir.",
    tier: "proyecto",
  },
  {
    id: "marketing",
    label: "Marketing",
    description:
      "Estrategia de lanzamiento y presencia digital: que el trabajo terminado efectivamente llegue a alguien.",
    tier: "proyecto",
  },
  {
    id: "construccion-estudios",
    label: "Construcción de estudios",
    description:
      "Diseño y montaje de salas de grabación: acústica, aislamiento y flujo de trabajo pensados desde cero.",
    tier: "proyecto",
  },
] as const satisfies readonly Service[]

/** Opción de escape del formulario para quien no sabe qué necesita. */
export const OTHER_SERVICE = {
  id: "otro",
  label: "Otro / no estoy seguro",
} as const
