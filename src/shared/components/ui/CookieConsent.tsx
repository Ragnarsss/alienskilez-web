import { Button } from "@/shared/components/ui/Button"
import { useCookieConsent } from "@/shared/hooks/useCookieConsent"

/**
 * Aviso de cookies mínimo y no bloqueante (ALS-023, ADR-15). Franja fija,
 * angosta, en una esquina — a propósito NUNCA un modal ni un overlay de
 * pantalla completa: el visitante tiene que poder seguir viendo y usando el
 * CTA sin que este aviso se interponga. Se oculta apenas hay una decisión
 * (aceptar o rechazar), y no vuelve a aparecer en visitas futuras.
 */
export function CookieConsent() {
  const { status, accept, reject } = useCookieConsent()

  if (status !== "pending") return null

  return (
    <div
      role="region"
      aria-label="Aviso de cookies"
      className="hud-frame fixed bottom-4 left-4 z-40 max-w-sm rounded-sm border border-border bg-surface-alt/95 p-5 shadow-2xl shadow-black/50 backdrop-blur-md"
    >
      <p className="text-sm leading-relaxed text-text-muted">
        Usamos cookies propias de Google Analytics para medir qué partes del sitio funcionan. No
        se usan para publicidad ni se comparten con terceros.
      </p>
      <div className="mt-4 flex gap-3">
        <Button variant="primary" size="md" onClick={accept}>
          Aceptar
        </Button>
        <Button variant="ghost" size="md" onClick={reject}>
          Rechazar
        </Button>
      </div>
    </div>
  )
}
