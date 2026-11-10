import { afterEach, describe, expect, it } from 'vitest'
import type { GameState } from '../../../shared/save'
import type { GameSession } from './engine'
import {
  advanceToPortMenu,
  isPortMenu,
  messageText,
  press,
  runLine,
  runLineStep,
  startCashGame,
  submit,
  typeText
} from './test/harness'

function submitAmount(game: GameSession, digits: string): void {
  typeText(game, digits)
  game.sendKeyDown(13)
  game.flushDelays()
}

describe('Modern Hong Kong services', () => {
  let game: GameSession | undefined

  afterEach(() => {
    game?.stop()
    game = undefined
  })

  function atHongKong(seed = 1): GameState {
    const started = startCashGame(seed, 'MODERN CO', 'modern')
    game = started.game
    advanceToPortMenu(game, started.state)
    return started.state
  }

  it('skips arrival McHenry and Wu and lists both on the port menu', () => {
    const started = startCashGame(1, 'MODERN CO', 'modern')
    game = started.game
    const { state } = started
    state.damage = 30
    const seen: string[] = []
    for (let i = 0; i < 50; i++) {
      game.flushDelays()
      if (isPortMenu(state)) break
      seen.push(messageText(state))
      const allow = state.allowedInput
      if (Array.isArray(allow) && allow.includes('Y') && allow.includes('N')) {
        submit(game, 'N')
        continue
      }
      if (state.nextLine !== '' || state.delayTicks > 0) {
        game.flushDelays()
        continue
      }
      game.sendKeyDown(13)
      game.flushDelays()
    }
    expect(isPortMenu(state)).toBe(true)
    expect(seen.join('\n')).not.toMatch(/Shipyards/)
    expect(seen.join('\n')).not.toMatch(/moneylender/)
    expect(state.damage).toBe(30)
    expect(state.allowedInput).toEqual([1, 'PORT3', 'B', 'S', 'V', 'T', 'M', 'W', 'Q'])
    const menu = messageText(state)
    expect(menu).toMatch(/Mc/)
    expect(menu).toMatch(/Henry/)
    expect(menu).toMatch(/Wu/)
  })

  it('repairs in the same visit after a bank withdrawal', () => {
    const state = atHongKong()
    state.damage = 20
    state.cash = 0
    state.bank = 5000

    submit(game!, 'V')
    submit(game!, 'A')
    expect(messageText(state)).toMatch(/withdraw/i)
    submit(game!, 'A')

    expect(isPortMenu(state)).toBe(true)
    expect(state.cash).toBe(5000)
    expect(state.bank).toBe(0)

    submit(game!, 'M')
    expect(messageText(state)).toMatch(/wanting repairs/)
    submit(game!, 'Y')
    expect(state.repairCost).toBeGreaterThan(0)
    expect(state.repairCost).toBeLessThanOrEqual(state.cash)
    const repairCost = state.repairCost
    submit(game!, 'A')

    expect(state.damage).toBe(0)
    expect(state.cash).toBe(5000 - repairCost)
    expect(isPortMenu(state)).toBe(true)
    expect(state.allowedInput).toContain('W')
  })

  it('returns to the port menu when repairs are declined', () => {
    const state = atHongKong()
    state.damage = 15
    const prices = [...state.portPrices]
    submit(game!, 'M')
    submit(game!, 'N')
    expect(isPortMenu(state)).toBe(true)
    expect(state.damage).toBe(15)
    expect(state.portPrices).toEqual(prices)
    expect(messageText(state)).not.toMatch(/moneylender/)
  })

  it('tells a broke player to enter 0 and returns to port', () => {
    const state = atHongKong()
    state.damage = 20
    state.cash = 0
    state.bank = 0
    submit(game!, 'M')
    submit(game!, 'Y')
    expect(messageText(state)).toMatch(/cannot/)
    expect(messageText(state)).toMatch(/Enter 0/)
    submitAmount(game!, '5')
    expect(isPortMenu(state)).toBe(false)
    expect(messageText(state)).toMatch(/Enter 0/)
    expect(state.damage).toBe(20)
    expect(state.cash).toBe(0)
    submitAmount(game!, '0')
    expect(isPortMenu(state)).toBe(true)
    expect(state.damage).toBe(20)
  })

  it('says the ship needs no repairs when the hull is sound', () => {
    const state = atHongKong()
    expect(state.damage).toBe(0)
    press(game!, 'M')
    game!.sendKeyDown(13)
    expect(messageText(state)).toMatch(/needs no/)
    game!.flushDelays()
    expect(isPortMenu(state)).toBe(true)
  })

  it('lends once from Wu and blocks a second loan this visit', () => {
    const state = atHongKong()
    state.cash = 100
    state.debt = 5000
    const prices = [...state.portPrices]

    submit(game!, 'W')
    submit(game!, 'Y')
    expect(messageText(state)).toMatch(/repay/)
    submitAmount(game!, '0')
    expect(messageText(state)).toMatch(/200/)
    submitAmount(game!, '200')

    expect(state.cash).toBe(300)
    expect(state.debt).toBe(5200)
    expect(state.wuLoanTaken).toBe(1)
    expect(isPortMenu(state)).toBe(true)
    expect(state.portPrices).toEqual(prices)

    submit(game!, 'W')
    submit(game!, 'Y')
    submitAmount(game!, '0')
    expect(messageText(state)).toMatch(/already/)
    typeText(game!, '100')
    game!.sendKeyDown(13)
    expect(messageText(state)).toMatch(/already/)
    expect(state.cash).toBe(300)
    game!.flushDelays()
    submitAmount(game!, '0')
    expect(isPortMenu(state)).toBe(true)
    expect(state.cash).toBe(300)
    expect(state.debt).toBe(5200)
  })

  it('refuses a loan larger than twice the cash on hand', () => {
    const state = atHongKong()
    state.cash = 100
    state.debt = 0
    submit(game!, 'W')
    submit(game!, 'Y')
    expect(messageText(state)).toMatch(/200/)
    typeText(game!, '500')
    game!.sendKeyDown(13)
    expect(messageText(state)).toMatch(/won't loan/)
    expect(state.cash).toBe(100)
    expect(state.wuLoanTaken).toBe(0)
    game!.flushDelays()
    submitAmount(game!, '0')
    expect(isPortMenu(state)).toBe(true)
    expect(state.cash).toBe(100)
  })

  it('explains that Wu will not lend with no cash and an empty bank', () => {
    const state = atHongKong()
    state.cash = 0
    state.bank = 0
    state.debt = 5000
    submit(game!, 'W')
    submit(game!, 'Y')
    expect(messageText(state)).toMatch(/will not lend/)
    expect(messageText(state)).toMatch(/Enter 0/)
    submitAmount(game!, '1')
    expect(state.cash).toBe(0)
    expect(state.debt).toBe(5000)
    expect(messageText(state)).toMatch(/Enter 0/)
    submitAmount(game!, '0')
    expect(isPortMenu(state)).toBe(true)
  })

  it('points a cashless player with bank funds at the bank', () => {
    const state = atHongKong()
    state.cash = 0
    state.bank = 400
    state.debt = 5000
    submit(game!, 'W')
    submit(game!, 'Y')
    expect(messageText(state)).toMatch(/Visit/)
    expect(messageText(state)).toMatch(/bank/)
    submitAmount(game!, '0')
    expect(isPortMenu(state)).toBe(true)
    expect(state.wuLoanTaken).toBe(0)
    expect(state.bank).toBe(400)
  })

  it('hides McHenry and Wu outside Hong Kong', () => {
    const state = atHongKong()
    state.location = 2
    runLine(game!, state, 'PORT2')
    expect(state.allowedInput).toEqual([1, 'PORT3', 'B', 'S', 'Q'])
    expect(messageText(state)).not.toMatch(/Henry/)
  })

  it('keeps McHenry, Wu, and Retire on a wealthy Hong Kong menu', () => {
    const state = atHongKong()
    state.cash = 1_000_000
    runLine(game!, state, 'PORT2')
    expect(state.allowedInput).toEqual([1, 'PORT3', 'B', 'S', 'V', 'T', 'M', 'W', 'R', 'Q'])
    expect(messageText(state)).toMatch(/Retire/)
    expect(messageText(state)).toMatch(/Wu/)
  })

  it('clears the visit loan on the next arrival', () => {
    const state = atHongKong()
    state.wuLoanTaken = 1
    state.cash = 0
    runLineStep(game!, state, 1030)
    expect(state.wuLoanTaken).toBe(0)
  })
})
