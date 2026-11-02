import { describe, expect, it } from 'vitest'
import { finalScore, formatMoney, scoreRank, seaworthiness, shipStatusLabel } from './format'

describe('formatMoney', () => {
  it('formats small and mid-range values', () => {
    expect(formatMoney(42)).toEqual([{ kind: 'text', text: '42' }])
    expect(formatMoney(1234)).toEqual([{ kind: 'text', text: '1,234' }])
  })

  it('scales large values with unit captions', () => {
    expect(formatMoney(1_500_000)).toEqual([
      { kind: 'text', text: '1.50 ' },
      { kind: 'cap', text: 'Million' }
    ])
  })
})

describe('seaworthiness', () => {
  it('returns percent remaining and zero for empty capacity', () => {
    expect(seaworthiness(0, 60)).toBe(100)
    expect(seaworthiness(30, 60)).toBe(50)
    expect(seaworthiness(10, 0)).toBe(0)
  })
})

describe('shipStatusLabel', () => {
  it('maps seaworthiness buckets', () => {
    expect(shipStatusLabel(0, 60)).toBe('Perfect')
    expect(shipStatusLabel(30, 60)).toBe('Fair')
    expect(shipStatusLabel(60, 60)).toBe('Critical')
  })
})

describe('finalScore and scoreRank', () => {
  it('scores net worth over months', () => {
    expect(finalScore(100_000, 12)).toBe(Math.floor(100_000 / 100 / Math.pow(12, 1.1)))
  })

  it('ranks score thresholds', () => {
    expect(scoreRank(0)).toBe(1)
    expect(scoreRank(500)).toBe(2)
    expect(scoreRank(1000)).toBe(3)
    expect(scoreRank(8000)).toBe(4)
    expect(scoreRank(50000)).toBe(5)
  })
})
