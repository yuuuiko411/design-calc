import { useState, type ReactNode } from 'react'
import { AlertCircle, Check, Copy, Info } from 'lucide-react'
import { Button } from './ui/button'
import { Input } from './ui/input'

export function NumberField({ id, label, value, onChange, unit = 'px', hint, error, integer = false }: {
  id: string; label: string; value: string; onChange: (value: string) => void; unit?: string; hint: string; error?: string; integer?: boolean
}) {
  return <div className="field">
    <label htmlFor={id}>{label}</label>
    <div className="input-wrap"><Input id={id} type="text" inputMode={integer ? 'numeric' : 'decimal'} autoComplete="off" spellCheck={false} value={value} onChange={event => onChange(event.target.value)} aria-invalid={!!error} aria-describedby={`${id}-hint${error ? ` ${id}-error` : ''}`} /><span aria-hidden="true">{unit}</span></div>
    <p className="field-hint" id={`${id}-hint`}>{hint}</p>
    {error && <p id={`${id}-error`} className="error-text"><AlertCircle size={14} aria-hidden="true" />{error}</p>}
  </div>
}

export function Segmented<T extends string>({ label, value, options, onChange }: { label: string; value: T; options: readonly { value: T; label: string }[]; onChange: (value: T) => void }) {
  return <div className="segment-group" role="group" aria-label={label}>{options.map(option => <Button key={option.value} variant="ghost" className={`segment ${value === option.value ? 'selected' : ''}`} aria-pressed={value === option.value} onClick={() => onChange(option.value)}>{option.label}</Button>)}</div>
}

export function CopyButton({ text, disabled = false, label = '結果をコピー', compact = false, announce }: { text: string; disabled?: boolean; label?: string; compact?: boolean; announce: (message: string, error?: boolean) => void }) {
  const [copying, setCopying] = useState(false)
  const [copiedText, setCopiedText] = useState<string | null>(null)
  const copied = copiedText === text && !disabled
  async function copy() {
    if (disabled || copying) return
    setCopying(true)
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable')
      await navigator.clipboard.writeText(text)
      setCopiedText(text)
      announce('コピーしました。クリップボードから貼り付けできます。')
    } catch {
      setCopiedText(null)
      announce('コピーできませんでした。結果のテキストを選択してコピーしてください。', true)
    } finally { setCopying(false) }
  }
  return <Button variant={compact ? 'ghost' : 'default'} size={compact ? 'icon' : 'default'} className={compact ? 'copy-icon' : 'copy-button'} disabled={disabled || copying} onClick={() => { void copy() }} aria-label={compact ? label : undefined}>{copied ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}{!compact && (copying ? 'コピー中…' : copied ? 'コピー済み' : label)}</Button>
}

export function Panel({ title, eyebrow, children, className = '', trailing }: { title: string; eyebrow: string; children: ReactNode; className?: string; trailing?: ReactNode }) {
  return <div className={`panel ${className}`}><div className="panel-heading"><div><span className="eyebrow">{eyebrow}</span><h3>{title}</h3></div>{trailing}</div>{children}</div>
}
export function Formula({ children }: { children: ReactNode }) { return <div className="formula"><span>FORMULA</span><code>{children}</code></div> }
export function Note({ children }: { children: ReactNode }) { return <p className="note"><Info size={15} aria-hidden="true" /><span>{children}</span></p> }
export function InvalidResult({ message }: { message: string }) { return <div className="invalid-result"><AlertCircle size={26} aria-hidden="true" /><strong>入力を確認してください</strong><p>{message}</p></div> }
export type Announce = (message: string, error?: boolean) => void
