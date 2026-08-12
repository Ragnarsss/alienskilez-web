import type { ReactNode } from "react"
import { cn } from "@/shared/components/ui/cn"

interface BadgeProps {
  children: ReactNode
  className?: string
}

export function Badge({ children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-sm border border-border-accent bg-accent/10",
        "px-2.5 py-1 font-mono text-[0.6875rem] tracking-[0.14em] text-accent uppercase",
        className,
      )}
    >
      {children}
    </span>
  )
}
