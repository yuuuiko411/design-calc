import { useCallback, useEffect, useRef, useState } from 'react'
import { ArrowRightLeft, ArrowUpRight, CaseSensitive, Check, Layers2, Scan, X } from 'lucide-react'
import { UnitConverter } from './features/UnitConverter'
import { SpacingScale } from './features/SpacingScale'
import { TypeScale } from './features/TypeScale'
import { AspectRatio } from './features/AspectRatio'
import { Button } from './components/ui/button'

const tools = [
  { id: 'unit', number: '01', name: 'Unit Converter', japanese: 'pxとremを、自由に行き来。', description: 'ピクセルと相対単位を、ルート文字サイズに合わせて変換します。', icon: ArrowRightLeft, component: UnitConverter },
  { id: 'spacing', number: '02', name: 'Spacing Scale', japanese: '余白に、心地よいリズムを。', description: '基準グリッドから、一貫性のある余白スケールを作ります。', icon: Layers2, component: SpacingScale },
  { id: 'type', number: '03', name: 'Type Scale', japanese: '文字に、美しい階層を。', description: '倍率から文字サイズを算出。実際のサイズでバランスを確かめます。', icon: CaseSensitive, component: TypeScale },
  { id: 'aspect', number: '04', name: 'Aspect Ratio', japanese: '比率を保って、ぴったりのサイズに。', description: '画像や動画の比率を維持して、幅と高さを計算します。', icon: Scan, component: AspectRatio },
] as const
type ToolId = typeof tools[number]['id']
function currentTool(): ToolId { return tools.find(tool => `#${tool.id}` === window.location.hash)?.id ?? 'unit' }

export default function App() {
  const [active, setActive] = useState<ToolId>(currentTool)
  const [notification, setNotification] = useState<{ message: string; error: boolean; id: number } | null>(null)
  const timeout = useRef<ReturnType<typeof setTimeout> | null>(null)
  const sequence = useRef(0)
  const announce = useCallback((message: string, error = false) => {
    if (timeout.current) clearTimeout(timeout.current)
    setNotification({ message, error, id: ++sequence.current })
    timeout.current = setTimeout(() => setNotification(null), 6500)
  }, [])
  useEffect(() => {
    const update = () => setActive(currentTool())
    window.addEventListener('hashchange', update)
    return () => { window.removeEventListener('hashchange', update); if (timeout.current) clearTimeout(timeout.current) }
  }, [])
  useEffect(() => { document.title = `${tools.find(tool => tool.id === active)?.name ?? 'Unit Converter'} — Design Calc.` }, [active])
  return <div className="app-shell">
    <a className="skip-link" href="#main-content" onClick={event => { event.preventDefault(); document.getElementById('main-content')?.focus() }}>メインコンテンツへ移動</a>
    <header className="site-header"><a href="#unit" className="brand" aria-label="Design Calc. ホーム"><span className="brand-mark" aria-hidden="true">d<span>c</span><i /></span><span>Design Calc<span className="brand-period">.</span></span></a><div className="header-meta"><span>TOOLS FOR THOUGHTFUL DESIGN</span><span className="version">v1.0</span></div></header>
    <main id="main-content" className="main-content" tabIndex={-1}>
      <section className="intro" aria-labelledby="intro-title"><div><p className="eyebrow intro-eyebrow"><span className="accent-line" />LESS MATH, MORE DESIGN.</p><h1 id="intro-title">いいデザインは、<br className="mobile-break" />いい数字から。</h1><p className="intro-description">Web制作のための、小さな計算道具。</p></div><div className="intro-aside"><span className="decorative-grid" aria-hidden="true"><i /><i /><i /><i /></span><p>Make room for creativity.<br />We'll take care of the numbers.</p></div></section>
      <nav className="tool-nav" aria-label="計算ツール">{tools.map(tool => { const Icon = tool.icon; return <a key={tool.id} href={`#${tool.id}`} aria-current={active === tool.id ? 'page' : undefined} className={active === tool.id ? 'active' : ''}><span className="nav-number">{tool.number}</span><Icon size={18} aria-hidden="true" /><span>{tool.name}</span><ArrowUpRight size={15} className="nav-arrow" aria-hidden="true" /></a> })}</nav>
      {tools.map(tool => { const Component = tool.component; return <section key={tool.id} hidden={active !== tool.id} aria-labelledby={`heading-${tool.id}`} className="tool-section"><div className="tool-title"><div><p className="section-index">TOOL {tool.number} <span>/ 04</span></p><h2 id={`heading-${tool.id}`}>{tool.name}<span className="title-dot">.</span></h2><p>{tool.description}</p></div><span className="tool-tagline">{tool.japanese}</span></div><Component announce={announce} /></section> })}
      <aside className="workspace-note"><span className="accent-dot" /><p>考える時間は、デザインに。<span>小さな計算を、もっと軽やかに。</span></p><span className="workspace-note-label">MADE FOR YOUR WORKFLOW</span></aside>
    </main>
    <footer className="site-footer"><span>© {new Date().getFullYear()} Design Calc.</span><span>A little precision goes a long way.<span className="footer-plus" aria-hidden="true">+</span></span></footer>
    <div className="notification-region" role="status" aria-live="polite" aria-atomic="true">{notification && <div key={notification.id} className={`notification ${notification.error ? 'notification-error' : ''}`}>{notification.error ? <X size={18} aria-hidden="true" /> : <Check size={18} aria-hidden="true" />}<p>{notification.message}</p><Button variant="ghost" size="icon" aria-label="通知を閉じる" onClick={() => setNotification(null)}><X size={15} aria-hidden="true" /></Button></div>}</div>
  </div>
}
