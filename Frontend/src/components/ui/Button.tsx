import { ThinkingPulse } from '@/components/shared/ThinkingPulse'
import { cn } from '@/lib/utils'
import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { springs } from '@/lib/motion'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'copper'
type Size = 'sm' | 'md' | 'lg'

interface ButtonProps extends Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'onDrag' | 'onDragStart' | 'onDragEnd' | 'onAnimationStart'
> {
  variant?: Variant
  size?: Size
  children: ReactNode
  loading?: boolean
}

const variants: Record<Variant, string> = {
  primary:
    'bg-helix-signal text-[var(--color-helix-on-accent)] hover:bg-helix-signal/90 shadow-[0_0_20px_-8px_rgb(62_224_197_/_0.35)]',
  secondary:
    'bg-helix-elevated text-helix-text border border-helix-border hover:border-helix-signal/40 hover:bg-helix-elevated/90',
  ghost: 'bg-transparent text-helix-muted hover:text-helix-text hover:bg-helix-elevated/70',
  danger:
    'bg-helix-danger/15 text-helix-danger border border-helix-danger/35 hover:bg-helix-danger/25',
  copper:
    'bg-helix-copper text-[var(--color-helix-on-accent)] hover:bg-helix-copper/90 shadow-[0_0_20px_-8px_rgb(232_168_124_/_0.3)]',
}

const sizes: Record<Size, string> = {
  sm: 'h-8 min-h-8 px-3 text-sm rounded-lg gap-1.5',
  md: 'h-10 min-h-10 px-4 text-sm rounded-xl gap-2',
  lg: 'h-11 min-h-11 px-5 text-[15px] rounded-xl gap-2',
}

export function Button({
  variant = 'primary',
  size = 'md',
  className,
  children,
  loading,
  disabled,
  type = 'button',
  ...props
}: ButtonProps) {
  const reduce = useReducedMotion()

  return (
    <motion.button
      type={type}
      whileHover={
        reduce || disabled || loading ? undefined : { y: -1, transition: springs.tap }
      }
      whileTap={reduce || disabled || loading ? undefined : { scale: 0.98 }}
      className={cn(
        'inline-flex items-center justify-center font-display font-semibold transition-colors',
        'focus-ring disabled:pointer-events-none disabled:opacity-50',
        variants[variant],
        sizes[size],
        className,
      )}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading && <ThinkingPulse className="mr-0.5 scale-75" />}
      {children}
    </motion.button>
  )
}
