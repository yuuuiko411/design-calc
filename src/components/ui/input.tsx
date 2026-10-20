import type { ComponentProps } from 'react'
import { cn } from '@/lib/utils'

export function Input({ className, type, ...props }: ComponentProps<'input'>) {
  return <input data-slot="input" type={type} className={cn('flex h-12 w-full min-w-0 rounded-md border border-input bg-white px-3 py-2 text-base transition-colors aria-invalid:border-destructive disabled:opacity-50', className)} {...props} />
}
