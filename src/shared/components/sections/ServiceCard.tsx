import { motion, type MotionValue } from "framer-motion"
import { Button } from "@/shared/components/ui/Button"
import { cn } from "@/shared/components/ui/cn"
import { CTA } from "@/shared/constants/content"
import { anchor, SECTION_IDS } from "@/shared/constants/sections"
import type { Service } from "@/shared/constants/services"

/**
 * Markup de una card de servicio, compartido entre la grilla (mobile) y el
 * mazo apilable (desktop, `ServiciosDeck.tsx`) — el contenido es el mismo,
 * solo cambia cómo se posiciona alrededor.
 *
 * `layout="grid"`: sin borde propio — el borde lo dibuja el contenedor de la
 * grilla con el truco `gap-px`/`bg-border` (ver `Servicios.tsx`), así que un
 * borde acá duplicaría la línea.
 * `layout="deck"`: borde y fondo opacos propios, y dos piezas extra que solo
 * tienen sentido apiladas:
 *  - `index`: el número de la card. Se pinta con el mismo tratamiento que
 *    `Kicker` (`.kicker`, mono/acento) y **nunca** se atenúa, ni siquiera
 *    cuando la card queda tapada — mismo criterio que el "01/02/03" de
 *    lenis.darkroom.engineering (la referencia de ALS-043): es lo que hace
 *    legible el mazo como pila de cards reales, no una mancha borrosa.
 *  - `contentOpacity`: opacidad SOLO del título/descripción/botón — el
 *    marco (`hud-frame` + borde) se queda nítido siempre. Atenuar la card
 *    completa (como hacía la primera versión) la hacía ilegible como parte
 *    del mazo; atenuar solo el contenido la deja "tapada pero reconocible".
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
  /** Solo `layout="deck"`: opacidad animada del contenido, no del marco. */
  contentOpacity?: MotionValue<number>
}) {
  return (
    <article
      className={cn(
        "hud-frame flex h-full flex-col bg-background p-7 transition-colors",
        layout === "grid" && "hover:bg-surface/25",
        layout === "deck" && "border border-border shadow-2xl shadow-black/40",
      )}
    >
      {layout === "deck" && index !== undefined && (
        <p className="kicker mb-4" aria-hidden="true">
          {String(index + 1).padStart(2, "0")}
        </p>
      )}
      <motion.div style={contentOpacity ? { opacity: contentOpacity } : undefined} className="flex flex-1 flex-col">
        <h3 className="text-lg font-semibold tracking-tight">{service.label}</h3>
        <p className="mt-3 flex-1 text-sm leading-relaxed text-text-muted">{service.description}</p>
        <Button href={anchor(SECTION_IDS.CONTACTO)} variant="ghost" size="md" className="mt-6 w-full">
          {service.tier === "sesion" ? CTA.PRIMARY : CTA.SECONDARY}
          <span className="sr-only"> — {service.label}</span>
        </Button>
      </motion.div>
    </article>
  )
}
