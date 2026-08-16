import { useEffect, useState } from "react"
import alienGlyph from "@/assets/alien-glyph.svg?raw"
import { PRELOADER } from "@/shared/constants/limits"
import { SITE } from "@/shared/constants/site"
import { usePrefersReducedMotion } from "@/shared/hooks/usePrefersReducedMotion"

/** Eventos que saltean la secuencia: cualquier intención de usar el sitio la corta. */
const SKIP_EVENTS = ["pointerdown", "keydown", "wheel", "touchstart"] as const

/**
 * Entrada de marca: el isotipo se dibuja como contorno, se rellena con glow y
 * cierra con el wordmark en bloom (ALS-041).
 *
 * El contorno (`stroke-dashoffset`) y el relleno con glow (`fill-opacity` +
 * `drop-shadow` pulsante) corren **superpuestos**, no en fila: arrancan con
 * apenas 150ms de diferencia y duran casi lo mismo (ver `--preloader-draw` /
 * `--preloader-fill` en styles/index.css). Antes el relleno esperaba a que el
 * contorno terminara del todo, y esa secuencialidad — una etapa, después la
 * otra — era lo que se leía como un corte, no el costo real de animar.
 *
 * Se ve en cada carga de la página — es una decisión de puesta en escena, no
 * un descuido: por eso los otros dos frenos importan más acá que en un
 * preloader que solo aparece una vez:
 *  - cualquier interacción lo saltea — incluido `Tab`, que es lo que evita que
 *    alguien navegando con teclado quede tabulando contra una capa opaca;
 *  - con `prefers-reduced-motion` no se monta nunca.
 *
 * La animación vive entera en CSS. Acá solo está el ciclo de vida.
 */
export function Preloader() {
  const prefersReducedMotion = usePrefersReducedMotion()
  const [state, setState] = useState<"running" | "exiting" | "done">("running")

  useEffect(() => {
    if (state !== "running") return

    const finish = () => {
      setState("exiting")
    }

    const sequenceTimer = window.setTimeout(finish, PRELOADER.TOTAL_MS)
    for (const type of SKIP_EVENTS) {
      window.addEventListener(type, finish, { once: true, passive: true })
    }

    // Sin esto el visitante scrollea a ciegas detrás del overlay y entra al
    // sitio a mitad del Hero.
    const previousOverflow = document.documentElement.style.overflow
    document.documentElement.style.overflow = "hidden"

    return () => {
      window.clearTimeout(sequenceTimer)
      for (const type of SKIP_EVENTS) {
        window.removeEventListener(type, finish)
      }
      document.documentElement.style.overflow = previousOverflow
    }
  }, [state])

  useEffect(() => {
    if (state !== "exiting") return

    const exitTimer = window.setTimeout(() => {
      setState("done")
    }, PRELOADER.EXIT_MS)

    return () => {
      window.clearTimeout(exitTimer)
    }
  }, [state])

  if (prefersReducedMotion || state === "done") return null

  return (
    <div className="preloader" data-state={state} aria-hidden="true">
      <div className="preloader-glyph" dangerouslySetInnerHTML={{ __html: alienGlyph }} />
      <p className="preloader-wordmark">{SITE.NAME}</p>
    </div>
  )
}
