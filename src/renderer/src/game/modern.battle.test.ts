import { afterEach, describe, expect, it } from 'vitest'
import type { GameSession } from './engine'
import {
  advanceToPortMenu,
  advanceTravel,
  isBattleOrders,
  startCashGame,
  submit
} from './test/harness'

describe('Modern battle pacing', () => {
  let game: GameSession | undefined

  afterEach(() => {
    game?.stop()
    game = undefined
  })

  function reachBattleOrders(
    mode: 'classic' | 'modern',
    seed = 22
  ): ReturnType<typeof startCashGame> {
    const started = startCashGame(seed, 'BATTLE CO', mode)
    game = started.game
    const { state } = started
    advanceToPortMenu(game, state)
    submit(game, 'Q')
    submit(game, '2')
    advanceTravel(game, state)
    expect(isBattleOrders(state)).toBe(true)
    return started
  }

  it('uses a shorter first-order wait than Classic', () => {
    const classic = reachBattleOrders('classic')
    expect(classic.state.delayTicks).toBe(12)
    classic.game.stop()

    const modern = reachBattleOrders('modern')
    expect(modern.state.delayTicks).toBe(3)
    expect(modern.state.gameMode).toBe('modern')
  })

  it('skips mid-sink FX on keypress', () => {
    const started = startCashGame(1, 'SINK CO', 'modern')
    game = started.game
    const { state } = started

    state.resumeLine = 5800
    state.nextLine = ''
    state.keyChoice = false
    state.allowedInput = false
    state.enemySlots[0][0] = 0
    state.view!.screen = 'battle'
    state.view!.ships[0].present = true
    state.view!.ships[0].sinkY = 12
    state.view!.ships[0].muzzle = true

    game.sendKeyDown(13)

    expect(state.resumeLine).toBe('')
    expect(state.view!.ships[0].present).toBe(false)
    expect(state.view!.ships[0].sinkY).toBe(0)
    expect(state.view!.ships[0].muzzle).toBe(false)
    // Immediate timer drains 5800 (0 modern ticks) into the fight loop.
    expect(state.nextLine).toBe(5320)
  })

  it('forces Run-only orders when Modern and unarmed', () => {
    const started = reachBattleOrders('modern', 22)
    const { state } = started

    expect(state.guns).toBe(0)
    expect(state.battleOrder).toBe('R')
    expect(state.keyChoice).toEqual([1, 5160, 'R'])
    expect(state.keyChoice).not.toContain('F')

    game!.flushDelays()
    expect(state.battleOrder).toBe('R')
    expect(state.view?.screen === 'battle' || state.view?.screen === 'port').toBe(true)
  })

  it('still offers Fight in Classic when unarmed', () => {
    const started = reachBattleOrders('classic', 22)
    const { state } = started

    expect(state.guns).toBe(0)
    expect(state.keyChoice).toEqual([1, 5160, 'F', 'R'])
  })
})
