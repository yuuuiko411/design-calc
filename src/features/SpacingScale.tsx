import { useState } from 'react'
import { ArrowRight, Ruler } from 'lucide-react'
import { formatNumber, nearestGrid, spacingScale, validateNumber } from '@/lib/calculations'
import { CopyButton, Formula, InvalidResult, Note, NumberField, Panel, type Announce } from '@/components/shared'

export function SpacingScale({ announce }: { announce: Announce }) {
  const [base, setBase] = useState('8')
  const [snap, setSnap] = useState('19')
  const result = spacingScale(base)
  const nearest = nearestGrid(snap, base)
  const baseValid = validateNumber(base, 1, 64, '基準グリッド')
  const snapValid = validateNumber(snap, 0, 1_000_000, '近似する余白')
  const css = result.ok ? result.value.map(row => `--space-${String(row.multiplier).replace('.', '_')}: ${formatNumber(row.size, 2)}px;`).join('\n') : ''
  return <><div className="calculator-grid">
    <Panel title="余白のルールを設定" eyebrow="INPUT" trailing={<Ruler size={19} aria-hidden="true" />}>
      <NumberField id="spacing-base" label="基準グリッド" value={base} onChange={setBase} hint="1〜64px・小数入力可" error={baseValid.ok ? undefined : baseValid.error} />
      <Note>ひとつの基準から、一貫した余白のリズムを作ります。</Note><div className="field-divider" />
      <div className="subheading"><span className="eyebrow">GRID SNAP</span><h4>いちばん近い余白を探す</h4></div>
      <NumberField id="spacing-snap" label="近似する余白" value={snap} onChange={setSnap} hint="0〜1,000,000px・小数入力可" error={snapValid.ok ? undefined : snapValid.error} />
      {nearest.ok ? <div className="snap-result"><span>{formatNumber(Number(snap), 2)}px</span><ArrowRight size={17} aria-hidden="true" /><strong>{formatNumber(nearest.value.size, 2)}<small>px</small></strong><p>基準 × {nearest.value.multiple} <span>差分 {nearest.value.difference > 0 ? '+' : ''}{formatNumber(nearest.value.difference, 2)}px</span></p></div> : <p className="error-text">{nearest.error}</p>}
      <p className="field-hint">同距離なら大きい倍数を採用。0pxも含みます。</p>
    </Panel>
    <Panel title="余白スケール" eyebrow="RESULT" className="result-panel" trailing={<span className="count-label">8 STEPS</span>}>
      {result.ok ? <div className="spacing-list"><div className="table-heading"><span>倍率</span><span>プレビュー</span><span>サイズ</span></div>{result.value.map(row => <div className="spacing-row" key={row.multiplier}><code>× {row.multiplier}</code><div className="spacing-track"><div style={{ width: `${row.multiplier / 8 * 100}%` }} /></div><strong>{formatNumber(row.size, 2)}<small>px</small></strong></div>)}</div> : <InvalidResult message={result.error} />}
      <div className="result-actions"><span>CSSカスタムプロパティ</span><CopyButton text={css} disabled={!result.ok} label="スケールを一括コピー" announce={announce} /></div>
    </Panel>
  </div><Formula>spacing = base grid × multiplier</Formula></>
}
