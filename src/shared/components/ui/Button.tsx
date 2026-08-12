import type { ComponentPropsWithoutRef, ReactNode } from "react"
import { cn } from "@/shared/components/ui/cn"

export type ButtonVariant = "primary" | "secondary" | "ghost"
export type ButtonSize = "md" | "lg"

const BASE =
  "inline-flex items-center justify-center gap-2 rounded-sm font-medium tracking-tight " +
  "transition-[background-color,box-shadow,border-color,color] duration-200 " +
  "focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-accent " +
  "disabled:pointer-events-none disabled:opacity-50"

const VARIANTS: Record<ButtonVariant, string> = {
  // Texto NEGRO sobre el verde neón: 9.55:1 (AAA). Con #EEEEEE encima cae a
  // 1.89:1 y reprueba — ver la tabla de contrastes en index.css.
  primary:
    "bg-accent text-background cta-breathe hover:shadow-[0_0_24px_var(--color-accent-glow)] " +
    "hover:brightness-110",
  secondary:
    "border border-border-accent text-accent hover:bg-accent/10 " +
    "hover:shadow-[0_0_20px_var(--color-accent-glow)]",
  ghost: "border border-border text-text hover:border-border-accent hover:text-accent",
}

const SIZES: Record<ButtonSize, string> = {
  md: "px-5 py-2.5 text-sm",
  lg: "px-7 py-3.5 text-base",
}

interface CommonProps {
  variant?: ButtonVariant
  size?: ButtonSize
  className?: string
  children: ReactNode
}

type ButtonAsButton = CommonProps &
  Omit<ComponentPropsWithoutRef<"button">, keyof CommonProps> & { href?: never }

type ButtonAsLink = CommonProps &
  Omit<ComponentPropsWithoutRef<"a">, keyof CommonProps> & { href: string }

export function Button(props: ButtonAsButton | ButtonAsLink) {
  const { variant = "primary", size = "md", className, children, ...rest } = props
  const classes = cn(BASE, VARIANTS[variant], SIZES[size], className)

  if ("href" in rest && rest.href !== undefined) {
    return (
      <a {...(rest as ComponentPropsWithoutRef<"a">)} className={classes}>
        {children}
      </a>
    )
  }

  const buttonProps = rest as ComponentPropsWithoutRef<"button">
  return (
    <button {...buttonProps} type={buttonProps.type ?? "button"} className={classes}>
      {children}
    </button>
  )
}
