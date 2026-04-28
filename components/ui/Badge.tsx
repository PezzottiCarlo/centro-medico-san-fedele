import { cn } from '@/lib/utils'
import { HTMLAttributes } from 'react'

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'success' | 'warning'
}

export function Badge({ className, variant = 'primary', ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-3 py-1 rounded-full text-xs font-medium',
        {
          'bg-primary/10 text-primary': variant === 'primary',
          'bg-secondary/10 text-secondary-dark': variant === 'secondary',
          'bg-accent/50 text-text-main': variant === 'accent',
          'bg-green-100 text-green-700': variant === 'success',
          'bg-yellow-100 text-yellow-700': variant === 'warning',
        },
        className
      )}
      {...props}
    />
  )
}
