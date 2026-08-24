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
 * `layout="deck"`: borde y fondo opacos propios. En el mazo las cards se
 * superponen de verdad — sin un fondo sólido, la card de abajo se
 * transparentaría a través de la de arriba.
 */
export function ServiceCard({ service, layout }: { service: Service; layout: "grid" | "deck" }) {
  return (
    <article
      className={cn(
        "hud-frame flex h-full flex-col bg-background p-7 transition-colors",
        layout === "grid" && "hover:bg-surface/25",
        layout === "deck" && "border border-border shadow-2xl shadow-black/40",
      )}
    >
      <h3 className="text-lg font-semibold tracking-tight">{service.label}</h3>
      <p className="mt-3 flex-1 text-sm leading-relaxed text-text-muted">{service.description}</p>
      <Button href={anchor(SECTION_IDS.CONTACTO)} variant="ghost" size="md" className="mt-6 w-full">
        {service.tier === "sesion" ? CTA.PRIMARY : CTA.SECONDARY}
        <span className="sr-only"> — {service.label}</span>
      </Button>
    </article>
  )
}
