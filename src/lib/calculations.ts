export type Result<T> = { ok: true; value: T } | { ok: false; error: string }
export type NumericInput = string | number
export type Direction = 'px-rem' | 'rem-px'
export type FixedSide = 'width' | 'height'
export type Ratio = readonly [number, number]
export const SPACING_MULTIPLIERS = [0.5, 1, 1.5, 2, 3, 4, 6, 8] as const
export const TYPE_RATIOS = [1.125, 1.2, 1.25, 1.333, 1.5] as const
export const ASPECT_RATIOS = [[1, 1], [4, 3], [3, 2], [16, 9], [9, 16]] as const
export const TYPE_LEVELS = [
  { name: 'Display', exponent: 4 }, { name: 'H1', exponent: 3 },
  { name: 'H2', exponent: 2 }, { name: 'H3', exponent: 1 },
  { name: 'Body', exponent: 0 }, { name: 'Small', exponent: -1 },
] as const

export function validateNumber(input: NumericInput, min: number, max: number, label: string, integer = false): Result<number> {
  if (typeof input === 'string' && input.trim() === '') return { ok: false, error: `${label}を入力してください。` }
  // Decimal input only: reject JS-specific forms such as hex and Infinity.
  if (typeof input === 'string' && !/^[+-]?(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?$/i.test(input.trim())) return { ok: false, error: `${label}は有効な数値で入力してください。` }
  const value = Number(input)
  if (!Number.isFinite(value)) return { ok: false, error: `${label}は有限の数値で入力してください。` }
  if (value < min || value > max) return { ok: false, error: `${label}は${min.toLocaleString('en-US')}〜${max.toLocaleString('en-US')}で入力してください。` }
  if (integer && !Number.isInteger(value)) return { ok: false, error: `${label}は整数で入力してください。` }
  return { ok: true, value }
}

/** Display-only rounding. Calculations always retain the unrounded source value. */
export function formatNumber(value: number, decimals = 4): string {
  if (!Number.isFinite(value)) return '—'
  const factor = 10 ** decimals
  const rounded = Math.round((value + Number.EPSILON * Math.max(1, Math.abs(value))) * factor) / factor
  return String(Object.is(rounded, -0) ? 0 : rounded)
}

export function convertUnit(input: NumericInput, root: NumericInput, direction: Direction): Result<number> {
  const rootValue = validateNumber(root, 1, 100, 'ルート文字サイズ')
  if (!rootValue.ok) return rootValue
  const number = validateNumber(input, 0, 1_000_000, '変換する値')
  if (!number.ok) return number
  return { ok: true, value: direction === 'px-rem' ? number.value / rootValue.value : number.value * rootValue.value }
}

export type SpacingStep = { multiplier: number; size: number }
export function spacingScale(base: NumericInput): Result<SpacingStep[]> {
  const value = validateNumber(base, 1, 64, '基準グリッド')
  if (!value.ok) return value
  return { ok: true, value: SPACING_MULTIPLIERS.map(multiplier => ({ multiplier, size: value.value * multiplier })) }
}

export function nearestGrid(input: NumericInput, base: NumericInput): Result<{ size: number; multiple: number; difference: number }> {
  const grid = validateNumber(base, 1, 64, '基準グリッド')
  if (!grid.ok) return grid
  const number = validateNumber(input, 0, 1_000_000, '近似する余白')
  if (!number.ok) return number
  // Math.round selects the larger multiple for ties, with an epsilon for decimal grids.
  const quotient = number.value / grid.value
  const multiple = Math.round(quotient + Number.EPSILON * Math.max(1, Math.abs(quotient)))
  const size = grid.value * multiple
  return { ok: true, value: { size, multiple, difference: size - number.value } }
}

export type TypeStep = { name: string; exponent: number; size: number }
export function typeScale(base: NumericInput, ratio: number): Result<TypeStep[]> {
  const value = validateNumber(base, 8, 64, '基準文字サイズ')
  if (!value.ok) return value
  if (!TYPE_RATIOS.some(preset => preset === ratio)) return { ok: false, error: '倍率はプリセットから選択してください。' }
  return { ok: true, value: TYPE_LEVELS.map(level => ({ ...level, size: value.value * ratio ** level.exponent })) }
}

export type Dimensions = { width: number; height: number; rawWidth: number; rawHeight: number }
export function aspectSize(input: NumericInput, ratio: Ratio, fixed: FixedSide): Result<Dimensions> {
  if (!ratio.every(value => Number.isFinite(value) && value > 0)) return { ok: false, error: '比率は正の有限数で指定してください。' }
  const edge = validateNumber(input, 1, 100_000, fixed === 'width' ? '幅' : '高さ', true)
  if (!edge.ok) return edge
  const rawWidth = fixed === 'width' ? edge.value : edge.value * ratio[0] / ratio[1]
  const rawHeight = fixed === 'height' ? edge.value : edge.value * ratio[1] / ratio[0]
  if (![rawWidth, rawHeight].every(value => Number.isFinite(value) && value >= 1 && value <= 100_000)) return { ok: false, error: '計算後の幅・高さが1〜100,000pxに収まるよう、指定値を調整してください。' }
  return { ok: true, value: { width: Math.round(rawWidth), height: Math.round(rawHeight), rawWidth, rawHeight } }
}
