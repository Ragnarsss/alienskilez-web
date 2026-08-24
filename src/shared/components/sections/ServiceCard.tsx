import { motion, type MotionValue } from "framer-motion"
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
 * `layout="deck"`: solo índice + título. **Deliberadamente sin descripción
 * ni botón** — con 10 cards en abanico dentro del ancho de `Container`
 * (`max-w-6xl`), no entra suficiente espacio horizontal para separar 10
 * párrafos sin que se tapen entre sí (la referencia de ALS-043,
 * lenis.darkroom.engineering, reparte 7 items en un layout a pantalla
 * completa; acá son 10 dentro de una sección más, con la mitad del ancho
 * ocupada por el isotipo). El detalle completo de cada servicio ya vive en
 * la grilla; el mazo es la pieza de impacto visual, no la ficha técnica. El
 * CTA del mazo es uno solo, general, en `ServiciosDeck.tsx` — no uno por
 * card.
 *  - `index`: pintado como `Kicker` (`.kicker`, mono/acento), **nunca** se
 *    atenúa aunque la card quede tapada — es lo que mantiene el mazo
 *    legible como pila de cards reales en vez de una mancha borrosa.
 *  - `contentOpacity`: opacidad SOLO del título — el marco (`hud-frame` +
 *    borde) se queda nítido siempre.
 */
export function ServiceCard({
  service,
  layout,
  index,
  contentOpacity,
}: {
  service: Service
  layout: "grid" | "deck"
  /** Solo `layout="deck"`: posición en el mazo (0-based), pintada como "01", "02"... */
  index?: number
  /** Solo `layout="deck"`: opacidad animada del título, no del marco. */
  contentOpacity?: MotionValue<number>
}) {
  if (layout === "deck") {
    return (
      <article className="hud-frame flex h-full flex-col justify-center border border-border bg-background p-5 shadow-2xl shadow-black/40">
        {index !== undefined && (
          <p className="kicker mb-2" aria-hidden="true">
            {String(index + 1).padStart(2, "0")}
          </p>
        )}
        <motion.h3
          style={contentOpacity ? { opacity: contentOpacity } : undefined}
          className="text-base leading-snug font-semibold tracking-tight"
        >
          {service.label}
        </motion.h3>
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
