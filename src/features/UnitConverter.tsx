import { useState } from 'react'
import { ArrowDown, ArrowRightLeft } from 'lucide-react'
import { convertUnit, formatNumber, validateNumber, type Direction } from '@/lib/calculations'
import { CopyButton, Formula, InvalidResult, Note, NumberField, Panel, Segmented, type Announce } from '@/components/shared'

export function UnitConverter({ announce }: { announce: Announce }) {
  const [root, setRoot] = useState('16')
  const [input, setInput] = useState('24')
  const [direction, setDirection] = useState<Direction>('px-rem')
  const result = convertUnit(input, root, direction)
  const rootValid = validateNumber(root, 1, 100, 'ルート文字サイズ')
  const inputValid = validateNumber(input, 0, 1_000_000, '変換する値')
  const from = direction === 'px-rem' ? 'px' : 'rem'
  const to = direction === 'px-rem' ? 'rem' : 'px'
  const output = result.ok ? `${formatNumber(result.value)}${to}` : ''
  const pixelSize = result.ok ? (direction === 'px-rem' ? Number(input) : result.value) : 24
  const previewSize = Math.min(80, Math.max(8, pixelSize))
  return <><div className="calculator-grid">
    <Panel title="変換する値を設定" eyebrow="INPUT" trailing={<ArrowRightLeft size={19} aria-hidden="true" />}>
      <div className="field"><span className="field-label">変換の方向</span><Segmented label="変換の方向" value={direction} onChange={setDirection} options={[{ value: 'px-rem', label: 'px → rem' }, { value: 'rem-px', label: 'rem → px' }]} /></div>
      <NumberField id="unit-value" label="変換する値" value={input} onChange={setInput} unit={from} hint="0〜1,000,000・小数入力可" error={inputValid.ok ? undefined : inputValid.error} />
      <div className="field-divider" />
      <NumberField id="unit-root" label="ルート文字サイズ" value={root} onChange={setRoot} hint="1〜100px・ブラウザの標準は16px" error={rootValid.ok ? undefined : rootValid.error} />
      <Note>html要素に設定されたfont-sizeを基準に変換します。</Note>
    </Panel>
    <Panel title="変換結果" eyebrow="RESULT" className="result-panel" trailing={<span className="live-badge"><span />LIVE</span>}>
      {result.ok ? <><div className="unit-result"><p className="result-caption">{formatNumber(Number(input))} {from}<ArrowDown size={15} aria-hidden="true" /></p><output className="hero-number" aria-label="変換結果">{formatNumber(result.value)}<span>{to}</span></output><p className="result-context">1rem = {formatNumber(Number(root))}px</p></div><div className="unit-preview"><div className="preview-heading"><span>SIZE PREVIEW</span><span>{pixelSize === previewSize ? '同じサイズ、異なる単位' : '見本は8〜80pxに縮尺調整'}</span></div><div className="preview-samples"><div><span style={{ fontSize: previewSize }}>Aa</span><code>{direction === 'px-rem' ? `${formatNumber(Number(input))}px` : `${formatNumber(result.value)}px`}</code></div><span className="equals">=</span><div><span style={{ fontSize: previewSize }}>Aa</span><code>{direction === 'px-rem' ? output : `${formatNumber(Number(input))}rem`}</code></div></div></div></> : <InvalidResult message={result.error} />}
      <div className="result-actions"><span>CSSにそのまま貼り付け</span><CopyButton text={output} disabled={!result.ok} announce={announce} /></div>
    </Panel>
  </div><Formula>{direction === 'px-rem' ? 'rem = px ÷ root font size' : 'px = rem × root font size'}</Formula></>
}
