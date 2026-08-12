import { motion } from "framer-motion"
import type { ReactNode } from "react"
import { cn } from "@/shared/components/ui/cn"
import { Container } from "@/shared/components/ui/Container"
import { Kicker } from "@/shared/components/ui/Kicker"

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
}: SectionProps) {
  const headingId = title ? `${id}-title` : undefined

  return (
    <section
      id={id}
      aria-labelledby={headingId}
      className={cn(
        "scroll-mt-20 py-section",
        tone === "surface-alt" && "bg-surface-alt",
        className,
      )}
    >
      <Container>
        {(kicker || title || description) && (
          <motion.header
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5, ease: "easeOut" }}
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
}: {
  children: ReactNode
  delay?: number
  className?: string
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, ease: "easeOut", delay }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
