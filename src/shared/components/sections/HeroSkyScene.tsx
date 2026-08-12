import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion"
import type { CSSProperties, RefObject } from "react"
import { LIMITS } from "@/shared/constants/limits"

interface HeroSkySceneProps {
    containerRef: RefObject<HTMLElement | null>
}

interface Star {
    left: number
    top: number
    size: number
    duration: number
    delay: number
    opacityMin: number
}

type StarStyle = CSSProperties & { "--star-opacity-min": number }

/** Hash determinístico (no `Math.random`) — misma disposición de estrellas en cada carga. */
function hash(seed: number): number {
    const x = Math.sin(seed * 12.9898) * 43758.5453
    return x - Math.floor(x)
}

function makeStars(count: number, seedOffset: number, minSize: number, maxSize: number): Star[] {
    return Array.from({ length: count }, (_, i) => {
        const seed = seedOffset + i
        return {
            left: hash(seed) * 100,
            top: hash(seed + 0.5) * 100,
            size: minSize + hash(seed + 0.25) * (maxSize - minSize),
            duration: 2.6 + hash(seed + 0.75) * 3,
            delay: hash(seed + 0.9) * 4,
            opacityMin: 0.15 + hash(seed + 0.6) * 0.2,
        }
    })
}

// Tres capas: lejana (chica, casi fija), media, cercana (más grande y brillante) — dan la
// impresión de distancia sin recurrir a una librería de partículas (ver design-system.md §5).
const FAR_STARS = makeStars(30, 1, 1, 1.5)
const MID_STARS = makeStars(18, 200, 1.5, 2.3)
const NEAR_STARS = makeStars(10, 500, 2.3, 3.4)

function StarLayer({ stars, color }: { stars: Star[]; color: string }) {
    return (
        <>
            {stars.map((star, i) => {
                const style: StarStyle = {
                    left: `${star.left}%`,
                    top: `${star.top}%`,
                    width: star.size,
                    height: star.size,
                    backgroundColor: color,
                    animationDuration: `${star.duration}s`,
                    animationDelay: `${star.delay}s`,
                    "--star-opacity-min": star.opacityMin,
                }
                return <span key={i} className="star-twinkle absolute rounded-full" style={style} />
            })}
        </>
    )
}

/**
 * Cielo nocturno del Hero: grid HUD estático + tres capas de estrellas
 * generadas (tamaños variados, parpadeo, paralaje ligado al progreso de
 * scroll del propio Hero, no de la página completa). Todo plano — CSS/SVG,
 * sin 3D ni librerías de partículas.
 */
export function HeroSkyScene({ containerRef }: HeroSkySceneProps) {
    const prefersReducedMotion = useReducedMotion()
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end end"],
    })

    const farY = useTransform(
        scrollYProgress,
        [0, 1],
        [0, prefersReducedMotion ? 0 : LIMITS.HERO_PARALLAX_FAR_PX],
    )
    const midY = useTransform(
        scrollYProgress,
        [0, 1],
        [0, prefersReducedMotion ? 0 : LIMITS.HERO_PARALLAX_MID_PX],
    )
    const nearY = useTransform(
        scrollYProgress,
        [0, 1],
        [0, prefersReducedMotion ? 0 : LIMITS.HERO_PARALLAX_NEAR_PX],
    )
    // Zoom sutil de todo el cielo — refuerza la sensación de avanzar mientras se scrollea.
    const travelScale = useTransform(
        scrollYProgress,
        [0, 1],
        [1, prefersReducedMotion ? 1 : LIMITS.HERO_SKY_ZOOM_SCALE],
    )

    return (
        <motion.div
            className="pointer-events-none absolute inset-0 overflow-hidden"
            style={{ scale: travelScale }}
            aria-hidden="true"
        >
            <div className="hud-grid absolute inset-0 opacity-40" />
            <motion.div className="absolute inset-0" style={{ y: farY }}>
                <StarLayer stars={FAR_STARS} color="rgb(238 238 238 / 0.55)" />
            </motion.div>
            <motion.div className="absolute inset-0" style={{ y: midY }}>
                <StarLayer stars={MID_STARS} color="rgb(238 238 238 / 0.7)" />
            </motion.div>
            <motion.div className="absolute inset-0" style={{ y: nearY }}>
                <StarLayer stars={NEAR_STARS} color="rgb(238 238 238 / 0.9)" />
            </motion.div>
        </motion.div>
    )
}
