import { Button } from "@/shared/components/ui/Button"
import { CTA } from "@/shared/constants/content"
import { anchor, SECTION_IDS } from "@/shared/constants/sections"
import type { Service } from "@/shared/constants/services"

/**
 * Markup de una card de servicio, compartido entre la grilla (mobile) y el
 * mazo apilable (desktop, `ServiciosDeck.tsx`) — mismos datos, presentación
 * distinta según cuánto espacio real hay para leerlos.
 *
 * `layout="grid"`: título, descripción completa y CTA propio (agenda/cotiza
 * según `tier`) — sin borde propio, lo dibuja el contenedor de la grilla con
 * el truco `gap-px`/`bg-border` (ver `Servicios.tsx`).
 *
 * `layout="deck"`: solo índice + título, GRANDE — la card ocupa un alto real
 * (`SERVICES_DECK_CARD_HEIGHT_PX`), no una franja angosta, así que el
 * índice y el título se reparten arriba/abajo en vez de amontonarse. **Sin
 * descripción ni botón propio** — con 10 cards en cascada no hay espacio
 * real para separar 10 párrafos sin que se tapen; el detalle completo de
 * cada servicio ya vive en la grilla, el mazo es la pieza de impacto visual.
 * El CTA del mazo es uno solo, general, en `ServiciosDeck.tsx`.
 *
 * A diferencia de la 4ª iteración, acá NINGUNA card tapada se atenúa — ni
 * el índice ni el título. La referencia (lenis.darkroom.engineering) muestra
 * las cards de atrás nítidas, solo físicamente recortadas por la de encima
 * (cascada real de `x`/`y`/`rotate` en `ServiciosDeck.tsx`); atenuar el
 * contenido encima de eso se leía como cards "muertas" en vez de una pila
 * real de tarjetas.
 */
export function ServiceCard({
  service,
  layout,
  index,
}: {
  service: Service
  layout: "grid" | "deck"
  /** Solo `layout="deck"`: posición en el mazo (0-based), pintada como "01", "02"... */
  index?: number
}) {
  if (layout === "deck") {
    return (
      <article className="hud-frame flex h-full flex-col justify-between border border-border bg-background p-6 shadow-2xl shadow-black/50">
        {index !== undefined && (
          <p className="font-display text-5xl font-bold text-accent" aria-hidden="true">
            {String(index + 1).padStart(2, "0")}
          </p>
        )}
        <h3 className="text-xl leading-snug font-semibold tracking-tight">{service.label}</h3>
      </article>
    )
  }

  return (
    <article className="hud-frame flex h-full flex-col bg-background p-7 transition-colors hover:bg-surface/25">
      <h3 className="text-lg font-semibold tracking-tight">{service.label}</h3>
      <p className="mt-3 flex-1 text-sm leading-relaxed text-text-muted">{service.description}</p>
      <Button href={anchor(SECTION_IDS.CONTACTO)} variant="ghost" size="md" className="mt-6 w-full">
        {service.tier === "sesion" ? CTA.PRIMARY : CTA.SECONDARY}
        <span className="sr-only"> — {service.label}</span>
      </Button>
    </article>
  )
}
