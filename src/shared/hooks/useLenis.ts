import { useEffect } from "react"
import Lenis from "lenis"
import { LIMITS } from "@/shared/constants/limits"

/**
 * Inicializa Lenis una sola vez para suavizar el scroll global del one-pager.
 * Si el usuario pide menos movimiento, no se activa.
 */
export function useLenis(): void {
    useEffect(() => {
        const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
        if (prefersReducedMotion) return

        const lenis = new Lenis({
            duration: LIMITS.LENIS_DURATION,
            // Ease-out exponencial: arranque rápido, frenada suave — sensación "cinematográfica".
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            anchors: true,
        })

        let animationFrameId = 0
        const raf = (time: number) => {
            lenis.raf(time)
            animationFrameId = requestAnimationFrame(raf)
        }

        animationFrameId = requestAnimationFrame(raf)

        return () => {
            cancelAnimationFrame(animationFrameId)
            lenis.destroy()
        }
    }, [])
}