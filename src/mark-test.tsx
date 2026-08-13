/**
 * Página de aislamiento del isotipo 3D — NO forma parte del sitio.
 *
 * Monta <SVG3D> sin Hero, sin scroll-pin, sin motion y sin opacidad
 * animada, para separar "la librería no renderiza" de "algo de mi Hero lo
 * está tapando". Se abre en /mark-test.html con el dev server corriendo.
 */
import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { SVG3D } from "3dsvg"
import alienGlyph from "@/assets/alien-glyph.svg?raw"

const root = document.getElementById("root")
if (!root) throw new Error("sin #root")

createRoot(root).render(
  <StrictMode>
    <div style={{ width: "100vw", height: "100vh" }}>
      <SVG3D svg={alienGlyph} color="#08cb00" smoothness={0.6} animate="spin" draggable />
    </div>
  </StrictMode>,
)
