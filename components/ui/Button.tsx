import { forwardRef } from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 font-medium transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2',
  {
    variants: {
      variant: {
        primary:   'bg-teal-500 hover:bg-teal-600 text-white shadow-sm hover:shadow-md rounded-xl',
        secondary: 'bg-white hover:bg-stone-50 text-stone-700 border border-stone-200 rounded-xl',
        ghost:     'hover:bg-stone-100 text-stone-600 rounded-lg',
        danger:    'bg-rose-500 hover:bg-rose-600 text-white shadow-sm rounded-xl',
        sage:      'bg-sage-500 hover:bg-sage-600 text-white shadow-sm rounded-xl',
        outline:   'border-2 border-teal-500 text-teal-600 hover:bg-teal-50 rounded-xl',
      },
      size: {
        sm:  'text-sm px-3 py-1.5',
        md:  'text-sm px-5 py-2.5',
        lg:  'text-base px-6 py-3',
        xl:  'text-base px-8 py-4',
        icon:'p-2',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  loading?: boolean
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, loading = false, children, disabled, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        )}
        {children}
      </Comp>
    )
  }
)

Button.displayName = 'Button'
export { Button, buttonVariants }
