import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

// shadcn/ui Button pattern, with only the variants used by this application.
const buttonVariants = cva('inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-colors disabled:pointer-events-none disabled:opacity-40 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0', {
  variants: {
    variant: { default: 'bg-primary text-primary-foreground hover:bg-neutral-800', outline: 'border border-border bg-white hover:bg-neutral-50', ghost: 'hover:bg-neutral-100' },
    size: { default: 'h-11 rounded-md px-4 text-base', sm: 'h-9 rounded px-3 text-base', icon: 'size-11 rounded-md' },
  },
  defaultVariants: { variant: 'default', size: 'default' },
})

export function Button({ className, variant, size, asChild = false, ...props }: React.ComponentProps<'button'> & VariantProps<typeof buttonVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : 'button'
  return <Comp data-slot="button" className={cn(buttonVariants({ variant, size, className }))} {...props} />
}
