import { afterEach, describe, expect, it } from 'vitest'
import type { GameSession } from './engine'
import {
  advanceToPortMenu,
  advanceTravel,
  battleText,
  isBattleOrders,
  isPortMenu,
  messageText,
  startCashGame,
  submit
} from './test/harness'

describe('Classic smoke', () => {
  let game: GameSession | undefined

  afterEach(() => {
    game?.stop()
    game = undefined
  })

  describe('new game → stake → port menu', () => {
    it('reaches the Hong Kong trading menu after declining arrival prompts', () => {
      const started = startCashGame(1)
      game = started.game
      const { state } = started

      advanceToPortMenu(game, state)

      expect(state.firmName).toBe('SMOKE CO')
      expect(state.cash).toBe(400)
      expect(state.debt).toBe(5000)
      expect(state.guns).toBe(0)
      expect(state.view?.screen).toBe('port')
      expect(state.portPrompt).toBe(1)
      expect(isPortMenu(state)).toBe(true)
      expect(state.allowedInput).toEqual([1, 'PORT3', 'B', 'S', 'V', 'T', 'Q'])
      expect(messageText(state)).toMatch(/Buy/i)
    })
  })

  describe('one buy/sell', () => {
    it('buys and sells one unit of General Cargo at Hong Kong', () => {
      const started = startCashGame(1)
      game = started.game
      const { state } = started
      advanceToPortMenu(game, state)

      const price = state.portPrices[3]
      expect(price).toBeGreaterThan(0)
      const cashBefore = state.cash
      const holdBefore = state.holdRoom

      submit(game, 'B')
      submit(game, 'G')
      submit(game, '1')

      expect(state.cargo[1][3]).toBe(1)
      expect(state.cash).toBe(cashBefore - price)
      expect(state.holdRoom).toBe(holdBefore - 1)
      expect(isPortMenu(state)).toBe(true)

      submit(game, 'S')
      submit(game, 'G')
      submit(game, '1')

      expect(state.cargo[1][3]).toBe(0)
      expect(state.cash).toBe(cashBefore)
      expect(state.holdRoom).toBe(holdBefore)
      expect(isPortMenu(state)).toBe(true)
    })
  })

  describe('one sail / travel', () => {
    it('sails from Hong Kong to Shanghai without a battle', () => {
      const started = startCashGame(1)
      game = started.game
      const { state } = started
      advanceToPortMenu(game, state)

      submit(game, 'Q')
      submit(game, '2')
      advanceTravel(game, state)

      expect(isBattleOrders(state)).toBe(false)
      expect(Number(state.location)).toBe(2)
      expect(state.view?.atSea).toBe(false)
      expect(state.view?.screen).toBe('port')
      expect(isPortMenu(state)).toBe(true)
      expect(state.portPrompt).toBe(2)
      expect(messageText(state)).toMatch(/Quit trading/i)
    })
  })

  describe('one battle Fight/Run exchange', () => {
    it('fights once with no guns, then runs clear to port', () => {
      const started = startCashGame(22)
      game = started.game
      const { state } = started
      advanceToPortMenu(game, state)

      submit(game, 'Q')
      submit(game, '2')
      advanceTravel(game, state)

      expect(isBattleOrders(state)).toBe(true)
      expect(state.attackerKind).toBe(1)
      expect(state.enemyShips).toBe(1)
      expect(state.guns).toBe(0)

      game.sendKeyDown('F'.charCodeAt(0))
      game.flushDelays()
      expect(state.battleOrder).toBe('F')
      expect(isBattleOrders(state)).toBe(true)
      expect(state.damage).toBeGreaterThan(0)
      expect(battleText(state)).toMatch(/Fight/i)

      game.sendKeyDown('R'.charCodeAt(0))
      for (let i = 0; i < 80; i++) {
        if (state.view?.screen !== 'battle') break
        if (isBattleOrders(state)) game.sendKeyDown('R'.charCodeAt(0))
        game.flushDelays()
        if (state.view?.screen === 'battle' && state.nextLine === '' && !state.keyChoice) {
          game.sendKeyDown(13)
        }
      }

      expect(state.battleOrder).toBe('R')
      expect(state.view?.screen).toBe('port')
      expect(isPortMenu(state)).toBe(true)
      expect(Number(state.location)).toBe(2)
    })
  })
})
