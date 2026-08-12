import { SITE } from "@/shared/constants/site"

/** Copy de los CTAs. Dos CTAs de negocio, un solo destino (#contacto). */
export const CTA = {
  PRIMARY: "Agenda tu sesión",
  SECONDARY: "Cotiza tu proyecto",
} as const

/** Pasos del proceso de agendamiento — baja la fricción de quien nunca reservó. */
export const PROCESS_STEPS = [
  {
    id: "01",
    title: "Cuéntanos qué necesitas",
    description:
      "Completa el formulario con el tipo de trabajo y tu fecha estimada. Toma menos de un minuto.",
  },
  {
    id: "02",
    title: "Te cotizamos por WhatsApp",
    description:
      "Revisamos tu caso y te respondemos con un valor concreto según el alcance real, no una tarifa genérica.",
  },
  {
    id: "03",
    title: "Agendamos la fecha",
    description: "Bloqueamos día y hora, y te decimos exactamente qué traer y cómo llegar.",
  },
  {
    id: "04",
    title: "Trabajamos",
    description:
      "Sesión en sala con acompañamiento técnico hasta que el resultado esté donde tiene que estar.",
  },
] as const

/** FAQ orientado a objeciones de agendamiento. */
export const FAQ_ITEMS = [
  {
    id: "cotizacion",
    question: "¿Cómo se cotiza una sesión?",
    answer:
      "No trabajamos con tarifas fijas publicadas porque el costo depende del tipo de trabajo y de cuántas sesiones requiera. Nos cuentas qué necesitas por el formulario y te respondemos con un valor concreto por WhatsApp, sin compromiso.",
  },
  {
    id: "que-traer",
    question: "¿Qué debo traer a la sesión?",
    answer:
      "Para grabar: tu letra lista y, si tienes, una maqueta o referencia de cómo quieres que suene. Si tocas un instrumento propio, tráelo. Para mezcla o máster: las pistas exportadas por separado. Te confirmamos el detalle exacto al agendar.",
  },
  {
    id: "duracion",
    question: "¿Cuánto dura una sesión típica?",
    answer:
      "Depende del trabajo. Una sesión de grabación de voces suele resolverse en un bloque de varias horas; una producción completa se reparte en varias sesiones. Al cotizar te decimos cuántas sesiones estimamos para tu caso.",
  },
  {
    id: "cancelacion",
    question: "¿Puedo reprogramar o cancelar?",
    answer:
      "Sí. Avisando con anticipación razonable movemos la fecha sin problema. Lo importante es avisar: una hora bloqueada que no se usa es una hora que otro artista podría haber ocupado.",
  },
  {
    id: "sin-experiencia",
    question: "¿Trabajan con artistas sin experiencia en estudio?",
    answer:
      "Sí, y es buena parte de lo que hacemos. Si nunca has grabado, la sesión es dirigida: te guiamos en la toma, en la interpretación y en las decisiones técnicas. No necesitas saber nada previo.",
  },
  {
    id: "remoto",
    question: `¿Trabajan solo en ${SITE.CITY}?`,
    answer: `Las sesiones de grabación son presenciales en ${SITE.LOCATION}. La mezcla, la masterización y la asesoría se pueden trabajar a distancia enviando las pistas, así que no importa dónde estés.`,
  },
] as const
