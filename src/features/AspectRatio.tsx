import { useState } from 'react'
import { LockKeyhole, Scan } from 'lucide-react'
import { ASPECT_RATIOS, aspectSize, validateNumber, type FixedSide, type Ratio } from '@/lib/calculations'
import { CopyButton, Formula, InvalidResult, Note, NumberField, Panel, Segmented, type Announce } from '@/components/shared'
import { Button } from '@/components/ui/button'

export function AspectRatio({ announce }: { announce: Announce }) {
  const [ratio, setRatio] = useState<Ratio>([16, 9])
  const [fixed, setFixed] = useState<FixedSide>('width')
  const [input, setInput] = useState('1200')
  const result = aspectSize(input, ratio, fixed)
  const inputValid = validateNumber(input, 1, 100_000, fixed === 'width' ? '幅' : '高さ', true)
  function switchSide(side: FixedSide) {
    if (side === fixed) return
    if (result.ok) setInput(String(result.value[side]))
    setFixed(side)
  }
  return <><div className="calculator-grid">
    <Panel title="比率とサイズを設定" eyebrow="INPUT" trailing={<Scan size={19} aria-hidden="true" />}>
      <div className="field"><span className="field-label">アスペクト比</span><div className="aspect-options" role="group" aria-label="アスペクト比">{ASPECT_RATIOS.map(preset => <Button key={preset.join(':')} variant="outline" className={ratio[0] === preset[0] && ratio[1] === preset[1] ? 'active' : ''} aria-pressed={ratio[0] === preset[0] && ratio[1] === preset[1]} onClick={() => setRatio(preset)}><span className="ratio-symbol" style={{ width: Math.min(22, 22 * preset[0] / preset[1]), aspectRatio: `${preset[0]} / ${preset[1]}` }} aria-hidden="true" />{preset.join(':')}</Button>)}</div></div>
      <div className="field"><span className="field-label">固定する辺</span><Segmented label="固定する辺" value={fixed} onChange={switchSide} options={[{ value: 'width', label: '幅を基準にする' }, { value: 'height', label: '高さを基準にする' }]} /></div>
      <NumberField id="aspect-value" label={fixed === 'width' ? '幅' : '高さ'} value={input} onChange={setInput} integer hint="1〜100,000px・整数で入力" error={inputValid.ok ? undefined : inputValid.error} />
      <Note>比率を変えても、固定した辺の長さを維持します。もう一方の辺は整数pxに四捨五入します。</Note>
    </Panel>
    <Panel title="サイズと比率" eyebrow="RESULT" className="result-panel" trailing={<span className="live-badge"><span />LIVE</span>}>
      {result.ok ? <><div className="dimension-summary"><div><span>WIDTH {fixed === 'width' && <LockKeyhole size={11} aria-label="固定" />}</span><output>{result.value.width}<small>px</small></output></div><span className="dimension-times">×</span><div><span>HEIGHT {fixed === 'height' && <LockKeyhole size={11} aria-label="固定" />}</span><output>{result.value.height}<small>px</small></output></div></div><div className="aspect-preview"><div className="aspect-shape" style={{ width: `min(90%, ${Math.min(320, 176 * ratio[0] / ratio[1])}px)`, aspectRatio: `${ratio[0]} / ${ratio[1]}` }}><span className="corner top-left" /><span className="corner top-right" /><span className="corner bottom-left" /><span className="corner bottom-right" /><strong>{ratio.join(':')}</strong><span>ASPECT RATIO</span></div><span className="preview-scale-note">比率に合わせた縮小プレビュー</span></div></> : <InvalidResult message={result.error} />}
      <div className="result-actions"><span>幅 × 高さをセットで</span><CopyButton text={result.ok ? `${result.value.width}px × ${result.value.height}px` : ''} disabled={!result.ok} label="サイズをコピー" announce={announce} /></div>
    </Panel>
  </div><Formula>{fixed === 'width' ? 'height = width × ratio height ÷ ratio width' : 'width = height × ratio width ÷ ratio height'}</Formula></>
}
