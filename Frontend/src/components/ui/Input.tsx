import { cn } from '@/lib/utils'

const fieldBase =
  'w-full rounded-xl border border-helix-border bg-helix-elevated/55 text-sm text-helix-text placeholder:text-helix-muted/90 outline-none transition-[border-color,box-shadow] focus-visible:border-helix-signal/55 focus-visible:ring-2 focus-visible:ring-helix-signal/25 disabled:cursor-not-allowed disabled:opacity-50'

export function Input({
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(fieldBase, 'h-10 min-h-10 px-3', className)}
      {...props}
    />
  )
}

export function Textarea({
  className,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(fieldBase, 'min-h-[96px] px-3 py-2.5 leading-relaxed', className)}
      {...props}
    />
  )
}

export function Label({
  className,
  ...props
}: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={cn(
        'mb-1.5 block text-sm font-medium text-helix-text/80',
        className,
      )}
      {...props}
    />
  )
}
