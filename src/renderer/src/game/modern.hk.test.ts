import { afterEach, describe, expect, it } from 'vitest'
import type { GameSession } from './engine'
import {
  advanceToPortMenu,
  isPortMenu,
  messageText,
  press,
  runLineStep,
  startCashGame,
  submit
} from './test/harness'

function choose(game: GameSession, ch: string): void {
  press(game, ch)
  game.sendKeyDown(13)
}

describe('Modern Hong Kong services', () => {
  let game: GameSession | undefined

  afterEach(() => {
    game?.stop()
    game = undefined
  })

  it('keeps the opening stay free of tribute and sails straight to the destination list', () => {
    const started = startCashGame(1, 'SMOKE CO', 'modern')
    game = started.game
    const { state } = started
    advanceToPortMenu(game, state)

    expect(state.sailedFromHongKong).toBe(false)
    expect(state.allowedInput).toEqual([1, 'PORT3', 'B', 'S', 'T', 'V', 'M', 'W', 'L', 'Q'])
    expect(messageText(state)).toMatch(/McHenry/)
    expect(messageText(state)).toMatch(/Wu/)
    expect(messageText(state)).toMatch(/Li/)
    expect(messageText(state)).not.toMatch(/tribute/)

    submit(game, 'Q')
    expect(messageText(state)).toMatch(/do you wish to go/i)
    expect(messageText(state)).not.toMatch(/Will/)
  })

  it('announces a later Hong Kong demand without asking for payment', () => {
    const started = startCashGame(1, 'SMOKE CO', 'modern')
    game = started.game
    const { state } = started
    advanceToPortMenu(game, state)
    state.sailedFromHongKong = true
    state.liFavor = 0
    state.cash = 800
    state.location = 1

    runLineStep(game, state, 1030)

    expect(messageText(state)).toMatch(/tribute/)
    expect(messageText(state)).toMatch(/before you leave/)
    expect(messageText(state)).not.toMatch(/Will/)
    expect(state.liDonation).toBeGreaterThan(0)
    expect(state.tributeAnswer).toBe('')
  })

  it('still asks Classic for payment before the port menu', () => {
    const started = startCashGame(1)
    game = started.game
    const { state } = started

    expect(messageText(state)).toMatch(/Will/)
    expect(messageText(state)).toMatch(/pay/)
    expect(state.allowedInput).toEqual([1, 1060, 'Y', 'N'])
  })

  it('lets Return leave Li unanswered, and a later visit can still pay', () => {
    const started = startCashGame(1, 'SMOKE CO', 'modern')
    game = started.game
    const { state } = started
    advanceToPortMenu(game, state)
    state.liDonation = 100
    state.liFavor = 0
    state.tributeAnswer = ''
    state.cash = 500

    submit(game, 'L')
    expect(state.allowedInput).toEqual([1, 1060, 'Y', 'N', 'R'])
    submit(game, 'R')
    expect(isPortMenu(state)).toBe(true)
    expect(state.tributeAnswer).toBe('')
    expect(state.liFavor).toBe(0)
    expect(state.cash).toBe(500)

    submit(game, 'L')
    submit(game, 'N')
    expect(isPortMenu(state)).toBe(true)
    expect(state.tributeAnswer).toBe('refused')
    expect(state.liFavor).toBe(0)
    expect(state.cash).toBe(500)

    submit(game, 'L')
    submit(game, 'Y')
    expect(isPortMenu(state)).toBe(true)
    expect(state.tributeAnswer).toBe('paid')
    expect(state.liFavor).toBe(1)
    expect(state.cash).toBe(400)

    submit(game, 'Q')
    expect(messageText(state)).toMatch(/do you wish to go/i)
    expect(messageText(state)).not.toMatch(/Will/)
  })

  it('offers Wu when the tribute payment is short, then returns to the menu', () => {
    const started = startCashGame(1, 'SMOKE CO', 'modern')
    game = started.game
    const { state } = started
    advanceToPortMenu(game, state)
    state.liDonation = 5000
    state.liFavor = 0
    state.tributeAnswer = ''
    state.cash = 100

    submit(game, 'L')
    submit(game, 'Y')
    expect(messageText(state)).toMatch(/Wu/)
    expect(messageText(state)).toMatch(/difference/)

    choose(game, 'N')
    expect(messageText(state)).toMatch(/wary of pirates/i)
    expect(state.cash).toBe(0)
    expect(state.tributeAnswer).toBe('refused')
    expect(state.liFavor).toBe(0)
    game.flushDelays()
    expect(isPortMenu(state)).toBe(true)
  })

  it('sends an unanswered Quit through Li, and Return keeps the demand', () => {
    const started = startCashGame(1, 'SMOKE CO', 'modern')
    game = started.game
    const { state } = started
    advanceToPortMenu(game, state)
    state.liDonation = 250
    state.liFavor = 0
    state.tributeAnswer = ''
    state.cash = 1000

    submit(game, 'Q')
    expect(messageText(state)).toMatch(/Will/)
    expect(state.allowedInput).toContain('R')

    submit(game, 'R')
    expect(isPortMenu(state)).toBe(true)
    expect(state.tributeAnswer).toBe('')

    submit(game, 'Q')
    submit(game, 'N')
    expect(messageText(state)).toMatch(/do you wish to go/i)
    expect(state.tributeAnswer).toBe('refused')
  })

  it('returns McHenry and Wu to the port menu', () => {
    const started = startCashGame(1, 'SMOKE CO', 'modern')
    game = started.game
    const { state } = started
    advanceToPortMenu(game, state)
    state.damage = 20
    state.cash = 50000

    submit(game, 'M')
    expect(messageText(state)).toMatch(/Mc/)
    expect(messageText(state)).toMatch(/Henry/)
    submit(game, 'N')
    expect(isPortMenu(state)).toBe(true)
    expect(state.allowedInput?.[1]).toBe('PORT3')

    submit(game, 'W')
    expect(messageText(state)).toMatch(/moneylender/)
    submit(game, 'N')
    expect(isPortMenu(state)).toBe(true)
    expect(messageText(state)).not.toMatch(/trade in your/i)
  })

  it('repairs in the same visit after withdrawing cash', () => {
    const started = startCashGame(1, 'SMOKE CO', 'modern')
    game = started.game
    const { state } = started
    advanceToPortMenu(game, state)
    state.damage = 20
    state.cash = 0
    state.bank = 100000

    submit(game, 'M')
    choose(game, 'Y')
    expect(messageText(state)).toMatch(/no cash on hand/i)
    expect(messageText(state)).toMatch(/bank/i)
    game.flushDelays()
    expect(isPortMenu(state)).toBe(true)

    submit(game, 'V')
    submit(game, '0')
    submit(game, 'A')
    expect(state.cash).toBe(100000)
    expect(isPortMenu(state)).toBe(true)

    submit(game, 'M')
    submit(game, 'Y')
    submit(game, 'A')
    expect(state.damage).toBeLessThan(20)
    expect(isPortMenu(state)).toBe(true)
  })

  it('tells Wu he will not lend when there is no cash', () => {
    const started = startCashGame(1, 'SMOKE CO', 'modern')
    game = started.game
    const { state } = started
    advanceToPortMenu(game, state)
    state.cash = 0
    state.debt = 0

    submit(game, 'W')
    choose(game, 'Y')
    expect(messageText(state)).toMatch(/won't loan you without cash/i)
    expect(messageText(state)).toMatch(/bank/i)
    game.flushDelays()
    expect(isPortMenu(state)).toBe(true)
  })

  it('says the ship needs no repairs when it is undamaged', () => {
    const started = startCashGame(1, 'SMOKE CO', 'modern')
    game = started.game
    const { state } = started
    advanceToPortMenu(game, state)
    state.damage = 0

    choose(game, 'M')
    expect(messageText(state)).toMatch(/no repairs/i)
    game.flushDelays()
    expect(isPortMenu(state)).toBe(true)
  })
})
