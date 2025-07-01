'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'yellow' | 'black'
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', ...props }, ref) => {
    let variantClass = ''
    if (variant === 'yellow') {
      variantClass = 'bg-yellow-400 text-black hover:bg-yellow-300'
    } else if (variant === 'black') {
      variantClass = 'bg-black text-white hover:bg-zinc-900'
    } else {
      variantClass = 'bg-zinc-700 text-white hover:bg-zinc-600'
    }
    return (
      <button
        ref={ref}
        className={cn(
          'w-full cursor-pointer rounded-xl py-3 text-lg font-bold shadow transition-colors focus:ring-2 focus:ring-yellow-400/30 focus:outline-none',
          variantClass,
          className,
          props.disabled && 'cursor-not-allowed opacity-50',
        )}
        {...props}
      />
    )
  },
)
Button.displayName = 'Button'

const baseClass =
  'w-full py-3 rounded-xl font-bold text-lg shadow transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-400/30'

function buttonVariants({
  variant = 'default',
}: { variant?: 'default' | 'yellow' | 'black' } = {}) {
  if (variant === 'yellow') {
    return cn(baseClass, 'bg-yellow-400 text-black hover:bg-yellow-300')
  } else if (variant === 'black') {
    return cn(baseClass, 'bg-black text-white hover:bg-zinc-900')
  } else {
    return cn(baseClass, 'bg-zinc-700 text-white hover:bg-zinc-600')
  }
}

export { Button, buttonVariants }
