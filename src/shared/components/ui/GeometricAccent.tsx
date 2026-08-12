import { cn } from "@/shared/components/ui/cn"

export type GeometricVariant = "shards" | "chevrons" | "hex"
export type GeometricPosition = "top-right" | "bottom-left"

interface GeometricAccentProps {
    variant: GeometricVariant
    position?: GeometricPosition
}

const POSITION_CLASSES: Record<GeometricPosition, string> = {
    "top-right": "-top-10 -right-10 sm:-top-14 sm:-right-14",
    "bottom-left": "-bottom-10 -left-10 sm:-bottom-14 sm:-left-14",
}

/**
 * Sistema "Signal Geometry": figuras planas de fondo por sección, con el
 * mismo lenguaje angular de `hud-frame`/`hud-grid`. Inspiradas solo en el
 * estilo de referencias externas (geometría marcada), no en su paleta ni
 * layout — construidas únicamente con tokens de color ya existentes.
 */
export function GeometricAccent({ variant, position = "top-right" }: GeometricAccentProps) {
    return (
        <div
            className={cn(
                "pointer-events-none absolute h-44 w-44 sm:h-56 sm:w-56",
                POSITION_CLASSES[position],
            )}
            aria-hidden="true"
        >
            {variant === "shards" && <ShardFragments />}
            {variant === "chevrons" && <SignalChevrons />}
            {variant === "hex" && <HexLattice />}
        </div>
    )
}

/** Fragmentos angulares dispersos — profundidad sin ruido. */
function ShardFragments() {
    return (
        <svg viewBox="0 0 200 200" className="h-full w-full">
            <polygon
                points="10,30 60,10 50,70 5,80"
                fill="none"
                stroke="var(--color-border)"
                strokeWidth="1"
            />
            <polygon
                points="90,20 150,40 130,90 80,75"
                fill="none"
                stroke="var(--color-border-accent)"
                strokeWidth="1"
                opacity="0.6"
            />
            <polygon
                points="40,110 100,130 70,180 20,160"
                fill="none"
                stroke="var(--color-border)"
                strokeWidth="1"
            />
            <polygon
                points="120,120 175,140 160,190 110,175"
                fill="none"
                stroke="var(--color-border-accent)"
                strokeWidth="1"
                opacity="0.5"
            />
        </svg>
    )
}

/** Flechas angulares que insinúan dirección, como una señal repitiéndose. */
function SignalChevrons() {
    return (
        <svg viewBox="0 0 200 200" className="h-full w-full">
            <polyline
                points="20,40 60,80 20,120"
                fill="none"
                stroke="var(--color-border-accent)"
                strokeWidth="2"
                opacity="0.7"
            />
            <polyline
                points="60,20 110,80 60,140"
                fill="none"
                stroke="var(--color-border-accent)"
                strokeWidth="2"
                opacity="0.45"
            />
            <polyline
                points="100,0 160,80 100,160"
                fill="none"
                stroke="var(--color-border-accent)"
                strokeWidth="2"
                opacity="0.25"
            />
        </svg>
    )
}

function hexPoints(cx: number, cy: number, r: number): string {
    return Array.from({ length: 6 }, (_, i) => {
        const angle = (Math.PI / 3) * i - Math.PI / 2
        return `${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`
    }).join(" ")
}

/** Cluster de hexágonos huecos — acento técnico tipo panel de nave. */
function HexLattice() {
    return (
        <svg viewBox="0 0 200 200" className="h-full w-full">
            <polygon
                points={hexPoints(70, 70, 40)}
                fill="none"
                stroke="var(--color-border-accent)"
                strokeWidth="1"
                opacity="0.6"
            />
            <polygon
                points={hexPoints(130, 110, 26)}
                fill="none"
                stroke="var(--color-border-accent)"
                strokeWidth="1"
                opacity="0.4"
            />
            <polygon
                points={hexPoints(40, 140, 18)}
                fill="none"
                stroke="var(--color-border)"
                strokeWidth="1"
            />
        </svg>
    )
}
