import { describe, expect, it } from 'vitest'
import { aspectSize, convertUnit, formatNumber, nearestGrid, spacingScale, typeScale, validateNumber } from './calculations'

describe('unit converter', () => {
  it.each([[24, 16, 'px-rem', 1.5], [1.25, 16, 'rem-px', 20], [24, 20, 'px-rem', 1.2]] as const)('%s with root %s (%s)', (input, root, direction, value) => expect(convertUnit(input, root, direction)).toEqual({ ok: true, value }))
  it.each([0, 1_000_000])('accepts input boundary %s', value => expect(convertUnit(value, 16, 'px-rem').ok).toBe(true))
  it.each([1, 100])('accepts root boundary %s', value => expect(convertUnit(24, value, 'px-rem').ok).toBe(true))
  it.each([0, 101, '', NaN, Infinity])('rejects root %s', value => expect(convertUnit(24, value, 'px-rem').ok).toBe(false))
  it.each(['', ' ', -1, 1_000_001, NaN, Infinity, -Infinity, 'hello', '0xff'])('rejects input %s', value => expect(convertUnit(value, 16, 'px-rem').ok).toBe(false))
})
describe('spacing', () => {
  it('8 × 3 = 24', () => { const result = spacingScale(8); expect(result.ok && result.value.find(row => row.multiplier === 3)?.size).toBe(24) })
  it('19 snaps to 16', () => expect(nearestGrid(19, 8)).toEqual({ ok: true, value: { size: 16, multiple: 2, difference: -3 } }))
  it.each([[20, 24], [4, 8], [0, 0], [3, 0]])('%s snaps to %s', (input, size) => { const result = nearestGrid(input, 8); expect(result.ok && result.value.size).toBe(size) })
  it('handles decimal grid ties', () => { const result = nearestGrid(2.1, 1.4); expect(result.ok && result.value.multiple).toBe(2) })
  it.each([1, 64])('accepts base %s', input => expect(spacingScale(input).ok).toBe(true))
  it.each(['', 0, -1, 65, NaN, Infinity])('rejects base %s', input => expect(spacingScale(input).ok).toBe(false))
  it.each(['', -1, NaN, Infinity, 1_000_001])('rejects nearest %s', input => expect(nearestGrid(input, 8).ok).toBe(false))
})
describe('type scale', () => {
  it('16 × 1.25² = 25; 16 × 1.25^-1 = 12.8', () => { const result = typeScale(16, 1.25); expect(result.ok && result.value.find(row => row.exponent === 2)?.size).toBe(25); expect(result.ok && result.value.find(row => row.exponent === -1)?.size).toBe(12.8) })
  it.each([8, 64])('accepts base %s', value => expect(typeScale(value, 1.25).ok).toBe(true))
  it.each(['', 7.99, 64.01, -1, NaN, Infinity])('rejects base %s', value => expect(typeScale(value, 1.25).ok).toBe(false))
  it.each([0, 1, 1.3, NaN, Infinity])('rejects ratio %s', value => expect(typeScale(16, value).ok).toBe(false))
})
describe('aspect ratio', () => {
  it('16:9 width 1200 → height 675', () => expect(aspectSize(1200, [16, 9], 'width')).toEqual({ ok: true, value: { width: 1200, height: 675, rawWidth: 1200, rawHeight: 675 } }))
  it('4:3 height 600 → width 800', () => { const result = aspectSize(600, [4, 3], 'height'); expect(result.ok && result.value.width).toBe(800) })
  it('rounds output to integer pixels', () => { const result = aspectSize(100, [16, 9], 'width'); expect(result.ok && result.value.height).toBe(56) })
  it.each([1, 100_000])('accepts boundary %s', value => expect(aspectSize(value, [1, 1], 'width').ok).toBe(true))
  it.each(['', -1, 0, 1.5, 100_001, NaN, Infinity])('rejects input %s', value => expect(aspectSize(value, [16, 9], 'width').ok).toBe(false))
  it.each([1, 100_000])('rejects output overflow/underflow %s', value => expect(aspectSize(value, [9, 16], value === 1 ? 'height' : 'width').ok).toBe(false))
  it.each([[0, 1], [-1, 2], [Infinity, 1], [1, NaN]] as const)('rejects ratio %s:%s', (a, b) => expect(aspectSize(1200, [a, b], 'width').ok).toBe(false))
})
describe('number validation and formatting', () => {
  it('preserves raw precision until formatting', () => { const result = convertUnit(1, 3, 'px-rem'); expect(result.ok && result.value).toBe(1 / 3); expect(result.ok && formatNumber(result.value)).toBe('0.3333') })
  it.each([[1.5, 4, '1.5'], [12.8, 2, '12.8'], [1.005, 2, '1.01'], [0, 4, '0'], [-0, 2, '0'], [2 / 3, 4, '0.6667'], [NaN, 2, '—'], [Infinity, 2, '—']])('formats %s', (input, decimals, expected) => expect(formatNumber(Number(input), Number(decimals))).toBe(expected))
  it('validates decimal input', () => expect(validateNumber(' 1.25 ', 0, 10, '値')).toEqual({ ok: true, value: 1.25 }))
})
