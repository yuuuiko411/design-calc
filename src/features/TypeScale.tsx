import { useState } from 'react'
import { CaseSensitive, TriangleAlert } from 'lucide-react'
import { formatNumber, TYPE_RATIOS, typeScale, validateNumber } from '@/lib/calculations'
import { CopyButton, Formula, InvalidResult, Note, NumberField, Panel, type Announce } from '@/components/shared'
import { Button } from '@/components/ui/button'

const ratioNames: Record<number, string> = { 1.125: 'Major Second', 1.2: 'Minor Third', 1.25: 'Major Third', 1.333: 'Perfect Fourth', 1.5: 'Perfect Fifth' }
export function TypeScale({ announce }: { announce: Announce }) {
  const [base, setBase] = useState('16')
  const [ratio, setRatio] = useState(1.25)
  const result = typeScale(base, ratio)
  const baseValid = validateNumber(base, 8, 64, '基準文字サイズ')
  return <><div className="calculator-grid type-grid">
    <Panel title="文字の階層を設定" eyebrow="INPUT" trailing={<CaseSensitive size={21} aria-hidden="true" />}>
      <NumberField id="type-base" label="基準文字サイズ" value={base} onChange={setBase} hint="8〜64px・Bodyの文字サイズ" error={baseValid.ok ? undefined : baseValid.error} />
      <div className="field"><span className="field-label">スケール倍率</span><div className="ratio-options" role="group" aria-label="スケール倍率">{TYPE_RATIOS.map(value => <Button variant="outline" key={value} aria-pressed={ratio === value} onClick={() => setRatio(value)} className={ratio === value ? 'active' : ''}>{value}<span>{ratioNames[value]}</span></Button>)}</div></div>
      <Note>プレビューは丸め前の計算サイズで表示します。</Note>
      {result.ok && result.value.some(row => row.size < 12) && <p className="warning"><TriangleAlert size={17} aria-hidden="true" /><span>12px未満の文字があります。長文や重要な情報には、読みやすいサイズをご検討ください。</span></p>}
    </Panel>
    <Panel title="タイポグラフィスケール" eyebrow="RESULT" className="result-panel type-panel" trailing={<span className="count-label">6 LEVELS</span>}>
      {result.ok ? <div className="type-list">{result.value.map(row => <div className="type-row" key={row.name}><div className="type-meta"><span>{row.name}</span><code>{formatNumber(row.size, 2)}px</code></div><div className="type-sample" tabIndex={0} role="region" aria-label={`${row.name}の文字見本、${formatNumber(row.size, 2)}px`}><span style={{ fontSize: row.size }}>{row.name === 'Display' ? 'Make it matter.' : row.name === 'Small' ? '小さな細部まで、美しく。' : 'Design is in the details.'}</span></div><CopyButton compact text={`font-size: ${formatNumber(row.size, 2)}px;`} label={`${row.name}のCSS値をコピー`} announce={announce} /></div>)}</div> : <InvalidResult message={result.error} />}
      <div className="type-footnote"><span className="accent-dot" />コピーするCSS値は小数2桁まで。各行のアイコンからコピーできます。</div>
    </Panel>
  </div><Formula>font size = base size × ratioⁿ</Formula></>
}
