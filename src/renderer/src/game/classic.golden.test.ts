import { afterEach, describe, expect, it } from 'vitest'
import type { GameSession } from './engine'
import {
  advanceToPortMenu,
  isPortMenu,
  messageText,
  runLine,
  runLineStep,
  startCashGame,
  startHeadless,
  submit
} from './test/harness'

describe('Classic golden paths', () => {
  let game: GameSession | undefined

  afterEach(() => {
    game?.stop()
    game = undefined
  })

  describe('HK arrival order: McHenry → Wu → bank', () => {
    it('prompts McHenry before Wu when damaged, then offers the bank at port', () => {
      const started = startCashGame(1)
      game = started.game
      const { state } = started
      advanceToPortMenu(game, state)

      state.damage = 20
      runLine(game, state, 1120)
      expect(messageText(state)).toMatch(/Mc/)
      expect(messageText(state)).toMatch(/Henry/)
      expect(state.allowedInput).toEqual([1, 1130, 'Y', 'N'])

      submit(game, 'N')
      expect(messageText(state)).toMatch(/Elder/)
      expect(messageText(state)).toMatch(/Wu/)
      expect(state.allowedInput).toEqual([1, 1310, 'Y', 'N'])

      submit(game, 'N')
      expect(isPortMenu(state)).toBe(true)
      expect(state.allowedInput).toContain('V')

      submit(game, 'V')
      expect(messageText(state)).toMatch(/deposit/i)
      expect(state.allowedInput).toEqual([
        9,
        'V2',
        'A',
        '0',
        '1',
        '2',
        '3',
        '4',
        '5',
        '6',
        '7',
        '8',
        '9'
      ])
    })

    it('still sends a paid repair on to Elder Brother Wu', () => {
      const started = startCashGame(1)
      game = started.game
      const { state } = started
      advanceToPortMenu(game, state)

      state.damage = 20
      state.cash = 100000
      runLine(game, state, 1120)
      submit(game, 'Y')
      submit(game, 'A')

      expect(state.damage).toBe(0)
      expect(state.cash).toBeLessThan(100000)
      expect(messageText(state)).toMatch(/Wu/)
      expect(state.allowedInput).toEqual([1, 1310, 'Y', 'N'])
    })
  })

  describe('storm path / undamaged-ship sink quirk', () => {
    it('always sinks an undamaged ship at STORM (fR(0) is always 0)', () => {
      // Classic quirk: sink check is fR((damage / shipCapacity) * 3) == 0.
      // With damage === 0 this is fR(0) === 0 for every RNG draw, so survival is impossible.
      const started = startHeadless(1)
      game = started.game
      const { state } = started
      state.damage = 0
      state.shipCapacity = 60
      runLine(game, state, 'STORM')
      expect(messageText(state)).toMatch(/going down/i)
      expect(state.view?.screen).toBe('score')
    })

    it('can survive STORM when damaged enough for a nonzero fR range (seed 1)', () => {
      const started = startHeadless(1)
      game = started.game
      const { state } = started
      state.damage = 40
      state.shipCapacity = 60
      state.location = 2
      runLineStep(game, state, 'STORM')
      expect(state.view?.screen).not.toBe('score')
      expect(messageText(state)).toMatch(/made it/i)
    })
  })

  describe('PRICE event', () => {
    it('mutates a good price and reports the swing (seed 5)', () => {
      const started = startHeadless(5)
      game = started.game
      const { state } = started
      state.location = 1
      state.portPrices = [10000, 1000, 100, 10]
      runLineStep(game, state, 'PRICE')
      expect(messageText(state)).toMatch(/price of/i)
      expect(messageText(state)).toMatch(/risen|dropped/i)
      expect(state.portPrices[2]).toBe(600)
      expect(messageText(state)).toMatch(/Arms/)
    })
  })

  describe('ship and gun offer rolls', () => {
    it('offers a ship trade-in when cash covers the roll (seed 1)', () => {
      const started = startHeadless(1)
      game = started.game
      const { state } = started
      state.cash = 50000
      state.location = 1
      state.damage = 0
      // 1500 only queues NEWSHIP1; flush into the prompt.
      runLine(game, state, 1500)
      expect(messageText(state)).toMatch(/trade in your/i)
      expect(state.offerPrice).toBeGreaterThan(0)
      expect(state.allowedInput).toEqual([1, 'NEWSHIP2', 'Y', 'N'])
      submit(game, 'N')
      expect(isPortMenu(state)).toBe(true)
      expect(state.allowedInput).toContain('V')
    })

    it('offers a gun when the ship roll misses and the gun roll hits (seed 4)', () => {
      const started = startHeadless(4)
      game = started.game
      const { state } = started
      state.cash = 50000
      state.location = 1
      state.damage = 0
      runLine(game, state, 1500)
      expect(messageText(state)).toMatch(/gun/i)
      expect(state.offerPrice).toBeGreaterThan(0)
      expect(state.allowedInput).toEqual([1, 'NEWGUN2', 'Y', 'N'])
      submit(game, 'N')
      expect(isPortMenu(state)).toBe(true)
    })
  })

  describe('robbery', () => {
    it('takes floor(cash / 1.4) when ROBBED fires', () => {
      const started = startHeadless(1)
      game = started.game
      const { state } = started
      state.cash = 28000
      const expectedLoss = Math.floor(28000 / 1.4)
      runLineStep(game, state, 'ROBBED')
      expect(messageText(state)).toMatch(/robbed/i)
      expect(state.cash).toBe(28000 - expectedLoss)
    })
  })

  describe('Li Yuen touchpoints', () => {
    it('sets liFavor when the donation is paid in cash', () => {
      const started = startCashGame(1)
      game = started.game
      const { state } = started
      const donation = state.liDonation
      const cashBefore = state.cash
      expect(donation).toBeGreaterThan(0)
      expect(cashBefore).toBeGreaterThanOrEqual(donation)

      submit(game, 'Y')
      expect(state.liFavor).toBe(1)
      expect(state.cash).toBe(cashBefore - donation)
      expect(messageText(state)).toMatch(/Wu/)
    })

    it('summons the player to Hong Kong via a lieutenant abroad (seed 1)', () => {
      const started = startHeadless(1)
      game = started.game
      const { state } = started
      state.location = 2
      state.liFavor = 0
      state.goods = [
        ['Opium', 11, 16, 15, 14, 12, 10, 13],
        ['Silk', 11, 14, 15, 16, 10, 13, 12],
        ['Arms', 12, 16, 10, 11, 13, 14, 15],
        ['General Cargo', 10, 11, 12, 13, 14, 15, 16]
      ]
      runLineStep(game, state, 2100)
      expect(messageText(state)).toMatch(/lieutenant/i)
      expect(messageText(state)).toMatch(/Hong/)
      expect(messageText(state)).toMatch(/Kong/)
    })
  })
})
