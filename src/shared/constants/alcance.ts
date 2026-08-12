/**
 * Métricas de trayectoria ("Alcance").
 *
 * Decisión deliberada: NO se inventan cifras. Cada métrica se publica con el
 * marcador visible `[XX]` hasta que exista el dato real, porque una cifra
 * falsa en un sitio de negocio es algo que después hay que desmentir frente
 * a un cliente.
 *
 * `measurement` es documentación (no se renderiza): describe de dónde sale
 * el número, para que al llenarlo se sepa exactamente qué se está contando
 * y el dato sea reproducible el próximo año.
 */
export interface ImpactMetric {
  readonly id: string
  readonly value: string
  readonly label: string
  readonly caption: string
  /** Cómo se obtiene el dato. Referencia interna, no se muestra en pantalla. */
  readonly measurement: string
  readonly pending: boolean
}

export const PLACEHOLDER_VALUE = "[XX]"

export const IMPACT_METRICS = [
  {
    id: "anos-activo",
    value: PLACEHOLDER_VALUE,
    label: "Años en producción",
    caption: "Trayectoria activa",
    measurement:
      "Año actual menos el año en que empezaste a producir profesionalmente. Es el dato más fácil de tener y el que más confianza genera: defínelo una vez y se autoactualiza.",
    pending: true,
  },
  {
    id: "sesiones",
    value: PLACEHOLDER_VALUE,
    label: "Sesiones realizadas",
    caption: "Horas de sala con artistas",
    measurement:
      "Conteo de sesiones cerradas y pagadas. Fuente práctica: el propio historial de WhatsApp Business o una planilla de reservas. Cuenta sesiones, no clientes (un artista puede volver muchas veces).",
    pending: true,
  },
  {
    id: "artistas",
    value: PLACEHOLDER_VALUE,
    label: "Artistas atendidos",
    caption: "Proyectos únicos",
    measurement:
      "Clientes ÚNICOS, deduplicados — es la métrica de alcance real. Si un artista grabó 12 sesiones, cuenta 1. Sale de la misma planilla de reservas, columna de nombre de artista.",
    pending: true,
  },
  {
    id: "lanzamientos",
    value: PLACEHOLDER_VALUE,
    label: "Lanzamientos publicados",
    caption: "Con crédito de producción",
    measurement:
      "Singles, EPs y álbumes ya publicados en plataformas donde figuras como productor/mezcla/máster. Fuente: Spotify for Artists (pestaña de créditos) o tu propia discografía. Es la métrica más verificable por un cliente, así que conviene que sea exacta.",
    pending: true,
  },
] as const satisfies readonly ImpactMetric[]

/** `true` mientras quede al menos una métrica sin dato real. */
export const HAS_PENDING_METRICS = IMPACT_METRICS.some((metric) => metric.pending)
