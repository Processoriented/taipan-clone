import { afterEach, describe, expect, it } from 'vitest'
import { createInitialState } from '../../../shared/save'
import { startGame, type GameHooks, type GameSession } from './engine'
import { seeded } from './test/rng'

const noopHooks: GameHooks = {
  persist: () => undefined,
  markDone: () => undefined,
  flush: () => undefined,
  onFrame: () => undefined
}

function typeText(game: GameSession, text: string): void {
  for (const char of text) game.sendKeyDown(char.charCodeAt(0))
}

function messageText(state: ReturnType<typeof createInitialState>): string {
  return (state.view?.message ?? [])
    .map((node) => {
      if (node.kind === 'text' || node.kind === 'cap') return node.text
      return ''
    })
    .join('')
}

describe('headless engine harness', () => {
  let game: GameSession | undefined

  afterEach(() => {
    game?.stop()
    game = undefined
  })

  it('advances past firm and stake to the Li Yuen donation prompt', () => {
    const state = createInitialState()
    game = startGame(state, noopHooks, { headless: true, random: seeded(1) })

    typeText(game, 'TEST CO')
    game.sendKeyDown(13)
    expect(state.view?.screen).toBe('stake')

    game.sendKeyDown('1'.charCodeAt(0))
    game.sendKeyDown(13)
    game.flushDelays()

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
