import { MotionConfig } from "framer-motion"
import { Alcance } from "@/shared/components/sections/Alcance"
import { Contacto } from "@/shared/components/sections/Contacto"
import { Estudio } from "@/shared/components/sections/Estudio"
import { Faq } from "@/shared/components/sections/Faq"
import { Footer } from "@/shared/components/sections/Footer"
import { Hero } from "@/shared/components/sections/Hero"
import { Navbar } from "@/shared/components/sections/Navbar"
import { Portfolio } from "@/shared/components/sections/Portfolio"
import { Proceso } from "@/shared/components/sections/Proceso"
import { Servicios } from "@/shared/components/sections/Servicios"
import { Testimonios } from "@/shared/components/sections/Testimonios"
import { CookieConsent } from "@/shared/components/ui/CookieConsent"
import { Preloader } from "@/shared/components/ui/Preloader"
import { anchor, SECTION_IDS } from "@/shared/constants/sections"
import { useLenis } from "@/shared/hooks/useLenis"

export default function App() {
  useLenis()

  return (
    // "never": el movimiento del sitio corre siempre, sin importar
    // prefers-reduced-motion. Mismo criterio que useLenis.ts (ver ahí el
    // porqué) -- si uno de los dos sistemas de animación respetara la
    // preferencia y el otro no, quedaría una mezcla rara de scroll suave con
    // animaciones instantáneas, o viceversa.
    <MotionConfig reducedMotion="never">
      <Preloader />

      <a
        href={anchor(SECTION_IDS.MAIN)}
        className="sr-only rounded-sm bg-accent px-4 py-2 font-medium text-background focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-100"
      >
        Saltar al contenido principal
      </a>

      <Navbar />

      <main id={SECTION_IDS.MAIN}>
        <Hero />
        <Estudio />
        <Servicios />
        <Portfolio />
        <Alcance />
        <Proceso />
        <Testimonios />
        <Faq />
        <Contacto />
      </main>

      <Footer />

      <CookieConsent />
    </MotionConfig>
  )
}
