import type { RichNode } from '../../../shared/view'
import { cap, nodes } from './richText'

const LOG10 = Math.log(10)
const COMMA = /(\d+)(\d{3})/

export const SHIP_STATUS = ['Critical', 'Poor', 'Fair', 'Good', 'Prime', 'Perfect'] as const
export const MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec'
]

export function formatMoney(value: number): RichNode[] {
  if (value < 1000) return [{ kind: 'text', text: String(value) }]
  if (value < 1e6) return [{ kind: 'text', text: value.toString().replace(COMMA, '$1,$2') }]
  const magnitude = Math.floor(Math.log(value) / LOG10)
  const unitPower = Math.floor(magnitude / 3) * 3
  const scale = Math.pow(10, magnitude - 2)
  const scaled = (Math.floor(value / scale + 0.5) * scale) / Math.pow(10, unitPower)
  let amount: string
  if (scaled < 10) amount = scaled.toFixed(2)
  else if (scaled < 100) amount = scaled.toFixed(1)
  else amount = String(scaled)
  let unit = ''
  if (unitPower === 6) unit = 'Million'
  else if (unitPower === 9) unit = 'Billion'
  else if (unitPower === 12) unit = 'Trillion'
  if (!unit) return [{ kind: 'text', text: amount }]
  return [{ kind: 'text', text: amount + ' ' }, cap(unit)]
}

export function seaworthiness(damage: number, capacity: number): number {
  if (capacity === 0) return 0
  return 100 - Math.floor((damage / capacity) * 100)
}

export function shipStatusLabel(damage: number, capacity: number): string {
  const index = Math.floor(seaworthiness(damage, capacity) / 20)
  return SHIP_STATUS[index] ?? SHIP_STATUS[SHIP_STATUS.length - 1]
}

export function seaworthinessLine(damage: number, capacity: number): RichNode[] {
  const value = seaworthiness(damage, capacity)
  const label = shipStatusLabel(damage, capacity)
  return nodes(cap('Current'), ' seaworthiness: \u00a0', cap(label), ' (', String(value), '%)')
}

export function finalScore(netWorth: number, monthsElapsed: number): number {
  return Math.floor(netWorth / 100 / Math.pow(monthsElapsed, 1.1))
}

export function scoreRank(score: number): 1 | 2 | 3 | 4 | 5 {
  if (score < 500) return 1
  if (score < 1000) return 2
  if (score < 8000) return 3
  if (score < 50000) return 4
  return 5
}
