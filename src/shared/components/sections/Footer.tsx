import { Container } from "@/shared/components/ui/Container"
import { anchor, NAV_LINKS } from "@/shared/constants/sections"
import { SITE, SOCIALS } from "@/shared/constants/site"

const ICON_PATHS: Record<string, string> = {
  instagram: "instagram-icon",
  youtube: "youtube-icon",
  spotify: "spotify-icon",
}

// Fuera del render: `new Date()` es impuro y las reglas del React Compiler
// lo rechazan dentro del cuerpo de un componente.
const CURRENT_YEAR = new Date().getFullYear()

export function Footer() {
  // Solo se renderizan las redes con URL confirmada: un enlace roto en el
  // footer cuesta más credibilidad de lo que suma el ícono.
  const visibleSocials = SOCIALS.filter((social) => !social.pending && social.url)

  return (
    <footer className="border-t border-border bg-surface-alt">
      <Container>
        <div className="grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <p className="flex items-center gap-2.5 font-display text-lg font-extrabold tracking-[0.18em] text-accent">
              <span className="radar-ping" aria-hidden="true" />
              {SITE.NAME}
            </p>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-text-muted">
              {SITE.TAGLINE} en {SITE.LOCATION}. Producción, grabación, mezcla, máster y todo lo que
              viene después.
            </p>
          </div>

          <nav aria-label="Navegación del pie de página">
            <h2 className="font-mono text-xs tracking-[0.18em] text-accent uppercase">Secciones</h2>
            <ul className="mt-4 space-y-2.5">
              {NAV_LINKS.map((link) => (
                <li key={link.id}>
                  <a
                    href={anchor(link.id)}
                    className="text-sm text-text-muted transition-colors hover:text-accent"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <h2 className="font-mono text-xs tracking-[0.18em] text-accent uppercase">Redes</h2>
            <ul className="mt-4 space-y-2.5">
              {visibleSocials.map((social) => (
                <li key={social.id}>
                  <a
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group inline-flex items-center gap-2.5 text-sm text-text-muted transition-colors hover:text-accent"
                  >
                    <svg className="h-4 w-4" aria-hidden="true">
                      <use href={`/icons.svg#${ICON_PATHS[social.id] ?? ""}`} />
                    </svg>
                    {social.label}
                    <span className="sr-only"> (se abre en una pestaña nueva)</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex flex-col gap-2 border-t border-border py-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-mono text-xs tracking-wider text-text-muted">
            © {CURRENT_YEAR} {SITE.NAME}. Todos los derechos reservados.
          </p>
          <p className="font-mono text-xs tracking-wider text-text-muted">{SITE.LOCATION}</p>
        </div>
      </Container>
    </footer>
  )
}
