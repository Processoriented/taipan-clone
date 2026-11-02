import { afterEach, describe, expect, it } from 'vitest'
import type { GameSession } from './engine'
import { messageText, startCashGame } from './test/harness'

describe('headless engine harness', () => {
  let game: GameSession | undefined

  afterEach(() => {
    game?.stop()
    game = undefined
  })

  it('advances past firm and stake to the Li Yuen donation prompt', () => {
    const started = startCashGame(1, 'TEST CO')
    game = started.game
    const { state } = started

    expect(state.firmName).toBe('TEST CO')
    expect(state.cash).toBe(400)
    expect(state.view?.screen).toBe('port')
    const text = messageText(state)
    expect(text).toContain('Li')
    expect(text).toContain('Yuen')
    expect(text.toLowerCase()).toContain('donation')
    expect(state.allowedInput).toEqual([1, 1060, 'Y', 'N'])
  })
})
