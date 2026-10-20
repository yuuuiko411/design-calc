import { chromium } from 'playwright'
import AxeBuilder from '@axe-core/playwright'
import assert from 'node:assert/strict'
import { mkdir, writeFile } from 'node:fs/promises'

// Start npm run dev first. Uses installed Google Chrome, or BROWSER_CHANNEL.
const baseURL = (process.env.QA_URL || 'http://127.0.0.1:5173').replace(/\/$/, '')
const browser = await chromium.launch({ channel: process.env.BROWSER_CHANNEL || 'chrome', headless: true })
const context = await browser.newContext({ permissions: ['clipboard-read', 'clipboard-write'] })
const page = await context.newPage()
const errors = []
page.on('pageerror', error => errors.push(error.message))
const report = { viewports: [], interactions: [], accessibility: [], errors }
await mkdir('qa/artifacts', { recursive: true })

async function noOverflow(label) {
  const metrics = await page.evaluate(() => ({ width: window.innerWidth, scroll: document.documentElement.scrollWidth }))
  assert.ok(metrics.scroll <= metrics.width, `${label}: page overflows (${metrics.scroll}/${metrics.width})`)
}

try {
  // Verify deployment paths as well as the rendered React UI.
  await page.goto(`${baseURL}/`)
  await page.getByRole('heading', { level: 2 }).waitFor()
  const assets = await page.evaluate(() => [
    ...Array.from(document.querySelectorAll('script[src]'), el => el.src),
    ...Array.from(document.querySelectorAll('link[rel="stylesheet"], link[rel="icon"]'), el => el.href),
  ])
  assert.ok(assets.some(url => url.endsWith('/favicon.svg')))
  assert.ok(assets.some(url => url.includes('.css')))
  assert.ok(assets.some(url => /\.([jt]sx?|mjs)(\?|$)/.test(url)))
  for (const url of assets) {
    assert.ok(url.startsWith(`${baseURL}/`), `asset escapes deployment path: ${url}`)
    const response = await context.request.get(url)
    assert.equal(response.status(), 200, `asset failed: ${url}`)
  }
  assert.ok(await page.evaluate(() => window.isSecureContext), 'clipboard requires secure context')
  report.interactions.push('JS, CSS and favicon loaded within deployment path; secure context')

  for (const [tool, label, expected] of [
    ['spacing', 'スケールを一括コピー', '--space-0_5: 4px;\n--space-1: 8px;\n--space-1_5: 12px;\n--space-2: 16px;\n--space-3: 24px;\n--space-4: 32px;\n--space-6: 48px;\n--space-8: 64px;'],
    ['type', 'BodyのCSS値をコピー', 'font-size: 16px;'],
    ['aspect', 'サイズをコピー', '1200px × 675px'],
  ]) {
    await page.goto(`${baseURL}/#${tool}`)
    await page.getByRole('button', { name: label, exact: true }).click()
    await page.getByText('コピーしました。クリップボードから貼り付けできます。').waitFor()
    const copied = await page.evaluate(() => navigator.clipboard.readText())
    assert.equal(copied.replace(/\r\n/g, '\n'), expected)
  }
  report.interactions.push('spacing, type and aspect clipboard contents')

  for (const width of [1440, 768, 390, 320]) {
    await page.setViewportSize({ width, height: 1000 })
    for (const tool of ['unit', 'spacing', 'type', 'aspect']) {
      await page.goto(`${baseURL}/#${tool}`)
      await page.getByRole('heading', { level: 2 }).waitFor()
      await noOverflow(`${tool}@${width}`)
      const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze()
      report.accessibility.push({ tool, width, violations: results.violations.map(v => ({ id: v.id, impact: v.impact, description: v.description, nodes: v.nodes.map(n => n.target) })) })
      await page.screenshot({ path: `qa/artifacts/${tool}-${width}.png`, fullPage: true })
      report.viewports.push(`${tool}@${width}: no page overflow`)
    }
  }

  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto(`${baseURL}/#unit`)
  await page.getByLabel('変換する値', { exact: true }).fill('1000000')
  await page.getByRole('button', { name: 'rem → px' }).click()
  await page.getByLabel('ルート文字サイズ', { exact: true }).fill('100')
  await noOverflow('maximum unit output@390')
  await page.setViewportSize({ width: 320, height: 800 })
  await noOverflow('maximum unit output@320')
  await page.getByRole('button', { name: '結果をコピー', exact: true }).click()
  assert.equal(await page.evaluate(() => navigator.clipboard.readText()), '100000000px')
  await page.getByText('コピーしました。クリップボードから貼り付けできます。').waitFor()
  report.interactions.push('maximum unit result, clipboard success, mobile overflow')

  await page.getByLabel('変換する値', { exact: true }).fill('')
  assert.ok(await page.getByRole('button', { name: '結果をコピー', exact: true }).isDisabled())
  report.interactions.push('invalid input prevents copying')

  const reloadMarker = await page.evaluate(() => { window.__qaMarker = 'same-document'; return window.__qaMarker })
  await page.getByRole('link', { name: /Spacing Scale/ }).click()
  await page.getByRole('heading', { name: /^Spacing Scale/ }).waitFor()
  assert.equal(await page.evaluate(() => window.__qaMarker), reloadMarker)
  await page.goBack()
  await page.getByRole('heading', { name: /^Unit Converter/ }).waitFor()
  await page.goForward()
  await page.getByRole('heading', { name: /^Spacing Scale/ }).waitFor()
  report.interactions.push('navigation without reload, browser back and forward')

  await page.goto(`${baseURL}/#type`)
  await page.getByLabel('基準文字サイズ', { exact: true }).fill('64')
  await page.getByRole('button', { name: '1.5 Perfect Fifth' }).click()
  const display = page.getByRole('region', { name: 'Displayの文字見本、324px' })
  assert.equal(await display.locator('span').evaluate(el => getComputedStyle(el).fontSize), '324px')
  await display.focus()
  await page.keyboard.press('ArrowRight')
  await page.waitForFunction(() => (document.activeElement?.scrollLeft ?? 0) > 0)
  assert.ok(await display.evaluate(el => el.scrollLeft > 0))
  await noOverflow('maximum type size@320')
  const maximumTypeAxe = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze()
  report.accessibility.push({ tool: 'type-maximum', width: 320, violations: maximumTypeAxe.violations.map(v => ({ id: v.id, nodes: v.nodes.map(n => n.target) })) })
  report.interactions.push('actual maximum type size, keyboard horizontal scrolling')

  await page.goto(`${baseURL}/#aspect`)
  for (const [w, h] of [[1, 1], [4, 3], [3, 2], [16, 9], [9, 16]]) {
    await page.getByRole('button', { name: `${w}:${h}`, exact: true }).click()
    const bounds = await page.locator('.aspect-shape').boundingBox()
    assert.ok(bounds && Math.abs(bounds.width / bounds.height - w / h) < 0.02, `preview maintains ${w}:${h}`)
    assert.equal(await page.getByLabel('幅', { exact: true }).inputValue(), '1200')
  }
  report.interactions.push('all five previews maintain aspect ratio and fixed width')

  await page.goto(`${baseURL}/?keyboard-check=1`)
  await page.getByRole('heading', { name: /^Unit Converter/ }).waitFor()
  await page.keyboard.press('Tab')
  assert.equal(await page.evaluate(() => document.activeElement?.textContent), 'メインコンテンツへ移動')
  await page.emulateMedia({ reducedMotion: 'reduce' })
  const transition = await page.getByRole('button', { name: '結果をコピー', exact: true }).evaluate(el => getComputedStyle(el).transitionDuration)
  assert.equal(transition, '0s')
  report.interactions.push('skip link keyboard focus, reduced motion')

  assert.deepEqual(errors, [])
  assert.ok(report.accessibility.every(item => item.violations.length === 0), 'axe violations: see qa/artifacts/report.json')
  console.log(JSON.stringify({ screenshots: report.viewports.length, accessibilityChecks: report.accessibility.length, interactions: report.interactions, pageErrors: errors.length }, null, 2))
} finally {
  await writeFile('qa/artifacts/report.json', JSON.stringify(report, null, 2))
  await browser.close()
}
