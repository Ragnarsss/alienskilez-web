import { motion } from "framer-motion"
import type { ReactNode } from "react"
import { cn } from "@/shared/components/ui/cn"
import { Container } from "@/shared/components/ui/Container"
import { GeometricAccent, type GeometricVariant } from "@/shared/components/ui/GeometricAccent"
import { Kicker } from "@/shared/components/ui/Kicker"
import { LIMITS } from "@/shared/constants/limits"

interface SectionProps {
  id: string
  /** Número de bloque del dossier, ej. "01". */
  index?: string
  kicker?: string
  title?: ReactNode
  description?: ReactNode
  children: ReactNode
  className?: string
  /** Superficie más oscura para alternar profundidad entre secciones. */
  tone?: "background" | "surface-alt"
  /** Figura "Signal Geometry" de fondo, decorativa — ver ui/GeometricAccent.tsx. */
  geometry?: GeometricVariant
}

export function Section({
  id,
  index,
  kicker,
  title,
  description,
  children,
  className,
  tone = "background",
  geometry,
}: SectionProps) {
  const headingId = title ? `${id}-title` : undefined

  return (
    <section
      id={id}
      aria-labelledby={headingId}
      className={cn(
        // `overflow-clip`, NO `overflow-hidden`: los dos recortan igual el
        // GeometricAccent decorativo, pero `hidden` crea un contenedor de
        // scroll y con eso anula cualquier `position: sticky` de adentro — que
        // es exactamente de lo que vive el mazo de Servicios. `clip` no lo crea.
        "relative scroll-mt-20 overflow-clip py-section",
        tone === "surface-alt" && "bg-surface-alt",
        className,
      )}
    >
      {geometry && (
        <GeometricAccent variant={geometry} position={index && Number(index) % 2 === 0 ? "bottom-left" : "top-right"} />
      )}
      <Container>
        {(kicker || title || description) && (
          <motion.header
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: LIMITS.REVEAL_VIEWPORT_MARGIN_HEADER }}
            transition={{ duration: LIMITS.REVEAL_DURATION_S, ease: "easeOut" }}
            className="mb-12 max-w-3xl"
          >
            {kicker && <Kicker index={index} label={kicker} className="mb-4" />}
            {title && (
              <h2
                id={headingId}
                className="text-3xl leading-[1.1] font-semibold tracking-tight sm:text-4xl md:text-5xl"
              >
                {title}
              </h2>
            )}
            {description && (
              <p className="mt-5 text-base leading-relaxed text-text-muted sm:text-lg">
                {description}
              </p>
            )}
          </motion.header>
        )}
        {children}
      </Container>
    </section>
  )
}

/** Envoltorio de scroll-reveal reutilizable para el contenido de las secciones. */
export function Reveal({
  children,
  delay = 0,
  className,
  scaleOnView = false,
}: {
  children: ReactNode
  delay?: number
  className?: string
  /** Suma una ligera escala 0.97→1 al reveal — pensado para cards de grilla, no para listas de texto. */
  scaleOnView?: boolean
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: scaleOnView ? 0.97 : 1 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: LIMITS.REVEAL_VIEWPORT_MARGIN_CARD }}
      transition={{ duration: LIMITS.REVEAL_DURATION_S, ease: "easeOut", delay }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
