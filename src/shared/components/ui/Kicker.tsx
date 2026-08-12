import { cn } from "@/shared/components/ui/cn"

interface KickerProps {
  /** Número de bloque del dossier, ej. "01". */
  index?: string
  /** Etiqueta en mayúsculas, ej. "EL ESTUDIO". */
  label: string
  className?: string
}

/** Etiqueta de sección estilo "log de sistema": `01 · EL ESTUDIO`. */
export function Kicker({ index, label, className }: KickerProps) {
  return (
    <p className={cn("kicker", className)}>
      {index ? (
        <>
          <span aria-hidden="true">{index} · </span>
          <span className="sr-only">Sección {index}: </span>
        </>
      ) : null}
      {label}
    </p>
  )
}
