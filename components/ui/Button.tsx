import { cn } from '@/lib/utils'
import { ButtonHTMLAttributes, forwardRef } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed',
          {
            'bg-primary text-white hover:bg-primary-dark focus:ring-primary rounded-sm':
              variant === 'primary',
            'bg-white text-primary border-2 border-primary hover:bg-primary hover:text-white focus:ring-primary rounded-sm':
              variant === 'secondary',
            'text-text-main hover:bg-muted focus:ring-gray-300 rounded-sm':
              variant === 'ghost',
            'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 rounded-sm':
              variant === 'danger',
          },
          {
            'text-sm px-4 py-2': size === 'sm',
            'px-6 py-3': size === 'md',
            'text-lg px-8 py-4': size === 'lg',
          },
          className
        )}
        {...props}
      />
    )
  }
)
Button.displayName = 'Button'
