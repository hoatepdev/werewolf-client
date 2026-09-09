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
          'w-full cursor-pointer rounded-md border border-transparent px-2 py-3 text-base font-semibold transition-[background-color,border-color,color,transform] duration-150 hover:border-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-yellow-400 active:translate-y-px',
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
  'w-full cursor-pointer rounded-md border border-transparent px-4 py-3 text-base font-semibold transition-[background-color,border-color,color,transform] duration-150 hover:border-white/10 active:translate-y-px focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-yellow-400 disabled:cursor-not-allowed disabled:opacity-50'

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
