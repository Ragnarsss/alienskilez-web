import { useEffect, useState } from "react"
import { parseVideoCatalog, type VideoItem } from "@/features/video/video"
import { IS_VIDEO_CATALOG_CONFIGURED, VIDEO_CATALOG_URL } from "@/shared/constants/video"

export type VideoCatalogState =
  | { status: "loading" }
  | { status: "success"; videos: readonly VideoItem[] }
  | { status: "error" }

/**
 * Trae el catálogo real de YouTube desde la Function URL de ALS-027. Mismo
 * patrón que `useDiscografia` (ALS-026/ALS-044) — ver ahí el porqué de cada
 * decisión (efecto de red estándar en vez de `useSyncExternalStore`, arranque
 * directo en "error" sin `VITE_YOUTUBE_CATALOG_URL` configurada), no
 * repetido acá.
 */
export function useVideoCatalog(): VideoCatalogState {
  const [state, setState] = useState<VideoCatalogState>(() =>
    IS_VIDEO_CATALOG_CONFIGURED ? { status: "loading" } : { status: "error" },
  )

  useEffect(() => {
    if (!IS_VIDEO_CATALOG_CONFIGURED) return

    const controller = new AbortController()

    fetch(VIDEO_CATALOG_URL, { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) {
          setState({ status: "error" })
          return
        }
        const body: unknown = await response.json()
        const videos = parseVideoCatalog(body)
        setState(videos ? { status: "success", videos } : { status: "error" })
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
