import { afterEach, describe, expect, it } from 'vitest'
import { createInitialState } from '../../../shared/save'
import { startGame, type GameSession } from './engine'
import { messageText, noopHooks, press, runLine, runLineStep, startHeadless } from './test/harness'

describe('Modern storm orders', () => {
  let game: GameSession | undefined

  afterEach(() => {
    game?.stop()
    game = undefined
  })

  function reachOrders(options?: {
    damage?: number
    cargo?: number[]
    holdRoom?: number
    location?: number
  }): ReturnType<typeof startHeadless>['state'] {
    const started = startHeadless(1)
    game = started.game
    const { state } = started
    state.gameMode = 'modern'
    state.shipCapacity = 60
    state.damage = options?.damage ?? 0
    state.location = options?.location ?? 2
    if (options?.cargo) state.cargo[1] = options.cargo
    if (options?.holdRoom !== undefined) state.holdRoom = options.holdRoom
    runLine(game, state, 'STORMQ')
    return state
  }

  it('lets an undamaged ship ride out and reports the hull hit', () => {
    const state = reachOrders()
    press(game!, 'R')
    expect(state.view?.screen).not.toBe('score')
    expect(state.nextLine).not.toBe(20000)
    expect(state.damage).toBe(12)
    expect(messageText(state)).toMatch(/hull took 12/)
    expect(messageText(state)).toMatch(/80%/)
  })

  it('sinks a ride when the hull cannot take the blow', () => {
    const state = reachOrders({ damage: 39 })
    press(game!, 'R')
    expect(messageText(state)).toMatch(/35% seaworthy/)
    expect(messageText(state)).toMatch(/too weak/i)
    expect(messageText(state)).toMatch(/going down/i)
    expect(state.nextLine).toBe(20000)
    game!.flushDelays()
    expect(state.view?.screen).toBe('score')
  })

  it('runs a wrecked ship off course without sinking', () => {
    const state = reachOrders({ damage: 39 })
    press(game!, 'W')
    expect(state.view?.screen).not.toBe('score')
    expect(state.nextLine).not.toBe(20000)
    expect(state.damage).toBe(42)
    expect(state.damage).toBeLessThan(state.shipCapacity)
    expect(Number(state.location)).not.toBe(2)
    expect(messageText(state)).toMatch(/before the wind/i)
    expect(messageText(state)).toMatch(/off course/i)
  })

  it('cuts hold cargo, restores hold room, and stays afloat', () => {
    const state = reachOrders({ cargo: [10, 0, 0, 0], holdRoom: 50 })
    expect(state.keyChoice).toEqual([1, 'STORM2', 'R', 'W', 'C'])
    press(game!, 'C')
    expect(state.cargo[1][0]).toBe(8)
    expect(state.holdRoom).toBe(52)
    expect(state.view?.screen).not.toBe('score')
    expect(state.nextLine).not.toBe(20000)
    expect(messageText(state)).toMatch(/cut loose 2 Opium/i)
  })

  it('dumps one unit from the largest stack when 25% rounds to zero', () => {
    const state = reachOrders({ cargo: [1, 3, 0, 0], holdRoom: 56 })
    press(game!, 'C')
    expect(state.cargo[1]).toEqual([1, 2, 0, 0])
    expect(state.holdRoom).toBe(57)
    expect(messageText(state)).toMatch(/cut loose 1 Silk/i)
    expect(state.view?.screen).not.toBe('score')
  })

  it('omits cut cargo when the hold is empty', () => {
    const state = reachOrders()
    expect(state.keyChoice).toEqual([1, 'STORM2', 'R', 'W'])
    expect(messageText(state)).not.toMatch(/Cut/)
    expect(messageText(state)).toMatch(/100%/)
    expect(messageText(state)).toMatch(/Ride/)
    expect(messageText(state)).toMatch(/Run/)
  })

  it('keeps the Classic storm chain on a storm roll', () => {
    const state = createInitialState()
    state.gameMode = 'classic'
    game = startGame(state, noopHooks, { headless: true, random: () => 0 })
    runLineStep(game, state, 3300)
    expect(messageText(state)).toMatch(/Storm/)
    expect(state.nextLine).toBe(3320)
  })

  it('opens Modern storm orders on a storm roll', () => {
    const state = createInitialState()
    state.gameMode = 'modern'
    game = startGame(state, noopHooks, { headless: true, random: () => 0 })
    runLineStep(game, state, 3300)
    expect(state.nextLine).toBe('STORMQ')
    state.delayTicks = 0
    game.step()
    expect(state.keyChoice).toEqual([1, 'STORM2', 'R', 'W'])
    expect(messageText(state)).toMatch(/orders are to/i)
  })
})
