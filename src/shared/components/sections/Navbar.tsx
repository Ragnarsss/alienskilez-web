import { useState } from "react"
import { Button } from "@/shared/components/ui/Button"
import { cn } from "@/shared/components/ui/cn"
import { Container } from "@/shared/components/ui/Container"
import { anchor, NAV_LINKS, SECTION_IDS } from "@/shared/constants/sections"
import { CTA } from "@/shared/constants/content"
import { SITE } from "@/shared/constants/site"
import { useScrolled } from "@/shared/hooks/useScrolled"

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
        <nav aria-label="Navegación principal" className="flex h-16 items-center justify-between">
          <a
            href={anchor(SECTION_IDS.MAIN)}
            className="flex items-center gap-2.5 font-display text-lg font-extrabold tracking-[0.18em] text-accent transition-[filter] hover:brightness-125"
          >
            <span className="radar-ping" aria-hidden="true" />
            {SITE.NAME}
          </a>

          <ul className="hidden items-center gap-8 md:flex">
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

          <div className="hidden md:block">
            <Button href={anchor(SECTION_IDS.CONTACTO)} variant="primary" size="md">
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
              onClick={closeMenu}
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
