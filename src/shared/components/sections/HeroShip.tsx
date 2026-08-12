import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion"
import type { RefObject } from "react"

interface HeroShipProps {
    containerRef: RefObject<HTMLElement | null>
}

/**
 * Silueta plana de nave que cruza el Hero de punta a punta mientras se
 * scrollea la sección. En reposo (prefers-reduced-motion) queda quieta a
 * mitad de camino, sin recorrido.
 */
export function HeroShip({ containerRef }: HeroShipProps) {
    const prefersReducedMotion = useReducedMotion()
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end start"],
    })

    const x = useTransform(
        scrollYProgress,
        [0, 1],
        prefersReducedMotion ? ["40vw", "40vw"] : ["-15vw", "115vw"],
    )
    const y = useTransform(scrollYProgress, [0, 1], prefersReducedMotion ? [0, 0] : [0, -36])
    const rotate = useTransform(scrollYProgress, [0, 1], prefersReducedMotion ? [0, 0] : [-3, 3])

    return (
        <motion.svg
            viewBox="0 0 64 32"
            // fixed, no absolute: si fuera absolute, el scroll normal se la lleva
            // hacia arriba junto con el Hero antes de que termine el recorrido.
            className="pointer-events-none fixed top-[20%] left-0 h-7 w-16 sm:h-8 sm:w-20"
            style={{ x, y, rotate, filter: "drop-shadow(0 0 6px var(--color-accent-glow))" }}
            aria-hidden="true"
        >
            <path
                d="M2 16 L22 4 L52 8 L62 16 L52 24 L22 28 Z"
                fill="var(--color-surface-alt)"
                stroke="var(--color-border-accent)"
                strokeWidth="1"
            />
            <circle cx="46" cy="16" r="2" fill="var(--color-accent)" />
            <circle cx="36" cy="11" r="1.2" fill="var(--color-accent)" opacity="0.75" />
            <circle cx="36" cy="21" r="1.2" fill="var(--color-accent)" opacity="0.75" />
        </motion.svg>
    )
}
