import { type ButtonHTMLAttributes, forwardRef } from "react"
import { twMerge } from "tailwind-merge"

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'gradient'
  size?: 'sm' | 'md' | 'lg'
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    const baseStyles = "inline-flex items-center justify-center rounded-lg font-label-bold transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
    
    const variants = {
      primary: "bg-primary-container text-primary hover:bg-primary-fixed-dim",
      secondary: "bg-secondary text-white hover:bg-on-secondary-fixed",
      outline: "border-2 border-outline-variant hover:border-secondary hover:bg-secondary hover:text-white",
      ghost: "hover:bg-surface-variant text-on-surface",
      gradient: "btn-gradient text-on-secondary soft-glow hover:scale-105"
    }

    const sizes = {
      sm: "px-4 py-2 text-xs uppercase tracking-widest",
      md: "px-6 py-3 text-sm",
      lg: "px-10 py-4 text-base"
    }

    return (
      <button
        ref={ref}
        className={twMerge(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"
