import { useEffect, useState } from "react"
import {
  parseDiscographyCatalog,
  type DiscographyRelease,
} from "@/features/discografia/discografia"
import {
  IS_SPOTIFY_CATALOG_CONFIGURED,
  SPOTIFY_CATALOG_URL,
} from "@/shared/constants/discografia"

export type DiscografiaState =
  | { status: "loading" }
  | { status: "success"; releases: readonly DiscographyRelease[] }
  | { status: "error" }

/**
 * Trae el catálogo real de Spotify desde la Function URL de ALS-026.
 *
 * Efecto de red estándar (`useState`+`useEffect`), no `useSyncExternalStore`:
 * esa regla es para estado externo *síncrono* (scroll, `matchMedia`, ver
 * `useScrolled.ts`) — un fetch es async por naturaleza, no tiene un
 * snapshot síncrono que leer en el primer render.
 *
 * Sin `VITE_SPOTIFY_CATALOG_URL` configurada arranca directo en "error" (vía
 * el inicializador de `useState`, no un `setState` síncrono dentro del
 * efecto — el compilador lo rechaza, ver `react-hooks/set-state-in-effect`)
 * para no bifurcar el criterio de "degradar, no romper" entre "no
 * configurado" y "falló en runtime": el componente solo necesita saber
 * loading/success/error, nunca por qué.
 */
export function useDiscografia(): DiscografiaState {
  const [state, setState] = useState<DiscografiaState>(() =>
    IS_SPOTIFY_CATALOG_CONFIGURED ? { status: "loading" } : { status: "error" },
  )

  useEffect(() => {
    if (!IS_SPOTIFY_CATALOG_CONFIGURED) return

    const controller = new AbortController()

    fetch(SPOTIFY_CATALOG_URL, { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) {
          setState({ status: "error" })
          return
        }
        const body: unknown = await response.json()
        const releases = parseDiscographyCatalog(body)
        setState(releases ? { status: "success", releases } : { status: "error" })
      })
      .catch((error: unknown) => {
        // El abort al desmontar dispara este mismo catch — no es una falla
        // real, así que no toca el estado (el componente ya no está).
        if (error instanceof DOMException && error.name === "AbortError") return
        setState({ status: "error" })
      })

    return () => controller.abort()
  }, [])

  return state
}
