import * as React from "react"
import { cn } from "../../lib/utils"

const Button = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: 'default' | 'outline' | 'ghost' | 'primary' | 'cyan' | 'danger'
    size?: 'default' | 'sm' | 'lg' | 'icon'
  }
>(({ className, variant = "default", size = "default", ...props }, ref) => {
  return (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center rounded-full font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/50 disabled:pointer-events-none disabled:opacity-40 cursor-pointer",
        {
          "bg-[var(--accent-cyan)] text-[#0c0d12] hover:brightness-110 font-semibold": variant === "cyan" || variant === "primary",
          "border border-[var(--border-accent)] text-[var(--text-secondary)] hover:border-[var(--accent-cyan)] hover:text-[var(--accent-cyan)]": variant === "outline",
          "text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)]": variant === "ghost",
          "bg-[var(--bg-elevated)] text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)]": variant === "default",
          "bg-[var(--accent-red)] text-white hover:brightness-110": variant === "danger",
        },
        {
          "h-9 px-4 py-2 text-sm": size === "default",
          "h-7 px-3 text-xs": size === "sm",
          "h-11 px-6 text-base": size === "lg",
          "h-9 w-9": size === "icon",
        },
        className
      )}
      {...props}
    />
  )
})
Button.displayName = "Button"

export { Button }
