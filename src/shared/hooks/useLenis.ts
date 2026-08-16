import { useEffect } from "react"
import Lenis from "lenis"
import { LIMITS } from "@/shared/constants/limits"

/**
 * Inicializa Lenis una sola vez para suavizar el scroll global del one-pager.
 *
 * Corre siempre, sin gate de `prefers-reduced-motion` — igual criterio que
 * `<MotionConfig reducedMotion="never">` en App.tsx: Lenis y Framer Motion son
 * dos sistemas de movimiento independientes (cada uno con su propio chequeo
 * de matchMedia, ninguno se entera del otro), así que si uno ignora la
 * preferencia el otro tiene que hacerlo también o queda una mezcla rara de
 * scroll suave con animaciones instantáneas, o viceversa.
 */
export function useLenis(): void {
    useEffect(() => {
        const lenis = new Lenis({
            // `lerp`, no `duration`+`easing`: un tween a tiempo fijo hace que un
            // scroll cortito tarde lo mismo que uno largo, y se siente raro. El
            // lerp se recalcula cada frame y se adapta solo a la distancia.
            lerp: LIMITS.LENIS_LERP,
            anchors: true,
            // Explícito: sin esto, Lenis solo suaviza la rueda del mouse y el
            // scroll táctil queda 100% nativo (sin inercia propia) — con el
            // pin del Hero, esa discontinuidad entre mouse y touch se nota.
            smoothWheel: true,
            syncTouch: true,
            // Lenis tiene SU PROPIO chequeo interno de prefers-reduced-motion,
            // aparte de cualquier otro que haya en la app (`true` por default):
            // si el sistema pide menos movimiento, fuerza `lerp: 1` — cero
            // suavizado, el scroll queda 1:1 con el input — sin que el resto
            // del código se entere. Sacar el gate manual de este hook no alcanzaba
            // por eso: había que apagar también este, explícito, para que el
            // smooth scroll corra siempre, igual criterio que
            // `<MotionConfig reducedMotion="never">` en App.tsx.
            respectReducedMotion: false,
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