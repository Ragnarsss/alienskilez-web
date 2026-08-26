import { useState } from "react"
import { Button } from "@/shared/components/ui/Button"
import { cn } from "@/shared/components/ui/cn"
import { Container } from "@/shared/components/ui/Container"
import { anchor, NAV_LINKS, SECTION_IDS } from "@/shared/constants/sections"
import { CTA } from "@/shared/constants/content"
import { SITE } from "@/shared/constants/site"
import { useScrolled } from "@/shared/hooks/useScrolled"
import { trackCtaClick } from "@/shared/lib/analytics"

/**
 * `Contacto` no se repite como link de texto en la fila de desktop — el CTA
 * de la derecha ya apunta ahí (mismo anchor), y listarlo dos veces era
 * redundante. Sigue en el menú móvil completo, abajo, porque ese sí es la
 * única navegación disponible en esa vista.
 */
const DESKTOP_NAV_LINKS = NAV_LINKS.filter((link) => link.id !== SECTION_IDS.CONTACTO)
const DESKTOP_NAV_SPLIT = Math.ceil(DESKTOP_NAV_LINKS.length / 2)
const DESKTOP_NAV_LEFT = DESKTOP_NAV_LINKS.slice(0, DESKTOP_NAV_SPLIT)
const DESKTOP_NAV_RIGHT = DESKTOP_NAV_LINKS.slice(DESKTOP_NAV_SPLIT)

const DESKTOP_LINK_CLASS =
  "font-mono text-xs tracking-[0.18em] text-text-muted uppercase transition-colors hover:text-accent"

export function Navbar() {
  const scrolled = useScrolled()
  const [menuOpen, setMenuOpen] = useState(false)

  const closeMenu = () => {
    setMenuOpen(false)
  }

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-colors duration-300",
        scrolled || menuOpen
          ? "border-b border-border bg-background/90 backdrop-blur-md"
          : "border-b border-transparent",
      )}
    >
      <Container>
        {/*
          Logo CENTRADO, links flanqueándolo a los costados — referencia
          visual explícita del usuario (showcase de lenis.darkroom.engineering).
          Un solo `<nav>` (un solo landmark, un solo juego de links en el DOM,
          no dos árboles paralelos): en mobile es el flex de siempre
          (logo a la izquierda, hamburguesa a la derecha, todo lo demás
          `hidden`); en `md:` pasa a grid de 3 columnas.

          El ORDEN EN EL DOM es izquierda → logo → derecha (no logo primero
          con `md:order-*` reordenando visualmente) — a propósito, tras
          encontrarlo en la auditoría de accesibilidad: `order` de CSS
          cambia el orden VISUAL pero no el de tabulación con teclado, que
          sigue el DOM. Con logo primero en el DOM y `order-2` para
          centrarlo, `Tab` saltaba centro → izquierda → derecha (no lineal).
          Con el DOM ya en orden izquierda-a-derecha, ni siquiera hace falta
          `order` — el grid de 3 columnas simplemente coloca cada elemento
          en su celda en el mismo orden en que aparecen.

          El botón hamburguesa desaparece del todo en `md:` (`display:
          none`), así que no cuenta como cuarta columna del grid.
        */}
        <nav
          aria-label="Navegación principal"
          className="flex h-16 items-center justify-between md:grid md:grid-cols-[1fr_auto_1fr] md:gap-6"
        >
          <ul className="hidden md:flex md:items-center md:gap-8 md:justify-self-start">
            {DESKTOP_NAV_LEFT.map((link) => (
              <li key={link.id}>
                <a href={anchor(link.id)} className={DESKTOP_LINK_CLASS}>
                  {link.label}
                </a>
              </li>
            ))}
          </ul>

          <a
            href={anchor(SECTION_IDS.MAIN)}
            className="flex items-center gap-2.5 font-display text-lg font-extrabold tracking-[0.18em] text-accent transition-[filter] hover:brightness-125 md:justify-self-center"
          >
            <span className="radar-ping" aria-hidden="true" />
            {SITE.NAME}
          </a>

          <div className="hidden md:flex md:items-center md:gap-8 md:justify-self-end">
            <ul className="flex items-center gap-8">
              {DESKTOP_NAV_RIGHT.map((link) => (
                <li key={link.id}>
                  <a href={anchor(link.id)} className={DESKTOP_LINK_CLASS}>
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
            <Button
              href={anchor(SECTION_IDS.CONTACTO)}
              variant="primary"
              size="md"
              onClick={() => {
                trackCtaClick("sesion")
              }}
            >
              {CTA.PRIMARY}
            </Button>
          </div>

          <button
            type="button"
            aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={menuOpen}
            aria-controls="menu-movil"
            onClick={() => {
              setMenuOpen((open) => !open)
            }}
            className="flex h-10 w-10 items-center justify-center rounded-sm border border-border text-text transition-colors hover:border-border-accent hover:text-accent md:hidden"
          >
            <svg
              viewBox="0 0 24 24"
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              aria-hidden="true"
            >
              {menuOpen ? (
                <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
              ) : (
                <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
              )}
            </svg>
          </button>
        </nav>

        {menuOpen && (
          <div id="menu-movil" className="border-t border-border py-5 md:hidden">
            <ul className="flex flex-col gap-1">
              {NAV_LINKS.map((link) => (
                <li key={link.id}>
                  <a
                    href={anchor(link.id)}
                    onClick={closeMenu}
                    className="block py-2.5 text-base text-text-muted transition-colors hover:text-accent"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
            <Button
              href={anchor(SECTION_IDS.CONTACTO)}
              onClick={() => {
                trackCtaClick("sesion")
                closeMenu()
              }}
              variant="primary"
              size="lg"
              className="mt-4 w-full"
            >
              {CTA.PRIMARY}
            </Button>
          </div>
        )}
      </Container>
    </header>
  )
}
