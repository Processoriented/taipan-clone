import { createInitialState, type GameState, type Line } from '../../../../shared/save'
import { startGame, type GameHooks, type GameSession } from '../engine'
import { seeded } from './rng'

export const noopHooks: GameHooks = {
  persist: () => undefined,
  markDone: () => undefined,
  flush: () => undefined,
  onFrame: () => undefined
}

export function richTextToString(
  nodes: Array<{ kind: string; text?: string; children?: unknown[] }> | undefined
): string {
  if (!nodes) return ''
  return nodes
    .map((node) => {
      if (node.kind === 'text' || node.kind === 'cap') return node.text ?? ''
      if (node.kind === 'inverse' && Array.isArray(node.children)) {
        return richTextToString(node.children as Array<{ kind: string; text?: string }>)
      }
      return ''
    })
    .join('')
}

export function messageText(state: GameState): string {
  return richTextToString(state.view?.message)
}

export function battleText(state: GameState): string {
  return richTextToString(state.view?.battleLine2) + ' ' + richTextToString(state.view?.battleLine4)
}

export function typeText(game: GameSession, text: string): void {
  for (const char of text) game.sendKeyDown(char.charCodeAt(0))
}

export function press(game: GameSession, ch: string): void {
  game.sendKeyDown(ch.charCodeAt(0))
}

export function submit(game: GameSession, ch: string): void {
  press(game, ch)
  game.sendKeyDown(13)
  game.flushDelays()
}

export function startHeadless(seed: number): { state: GameState; game: GameSession } {
  const state = createInitialState()
  const game = startGame(state, noopHooks, { headless: true, random: seeded(seed) })
  return { state, game }
}

export type StartMode = 'classic' | 'modern'

function chooseMode(game: GameSession, mode: StartMode): void {
  submit(game, mode === 'classic' ? '1' : '2')
}

export function startCashGame(
  seed: number,
  firmName = 'SMOKE CO',
  mode: StartMode = 'classic'
): { state: GameState; game: GameSession } {
  const { state, game } = startHeadless(seed)
  typeText(game, firmName)
  game.sendKeyDown(13)
  chooseMode(game, mode)
  submit(game, '1')
  return { state, game }
}

export function startGunsGame(
  seed: number,
  firmName = 'SMOKE CO',
  mode: StartMode = 'classic'
): { state: GameState; game: GameSession } {
  const { state, game } = startHeadless(seed)
  typeText(game, firmName)
  game.sendKeyDown(13)
  chooseMode(game, mode)
  submit(game, '2')
  return { state, game }
}

/** Jump the engine to a line and flush delay ticks synchronously. */
export function runLine(game: GameSession, state: GameState, line: Line): void {
  state.nextLine = line
  state.delayTicks = 0
  game.flushDelays()
}

/** Jump to a line and run a single timer tick (capture intermediate prompts). */
export function runLineStep(game: GameSession, state: GameState, line: Line): void {
  state.nextLine = line
  state.delayTicks = 0
  game.step()
}

function isYesNoPrompt(state: GameState): boolean {
  const allow = state.allowedInput
  return Array.isArray(allow) && allow.includes('Y') && allow.includes('N')
}

/** Drive through HK arrival Y/N prompts until the Classic port trading menu. */
export function advanceToPortMenu(game: GameSession, state: GameState): void {
  for (let i = 0; i < 50; i++) {
    game.flushDelays()
    if (isPortMenu(state)) return
    if (isYesNoPrompt(state)) {
      submit(game, 'N')
      continue
    }
    if (state.nextLine !== '') {
      game.flushDelays()
      continue
    }
    // Timed narrative with no typed input (PRICE, robbery, lieutenant, etc.)
    if (state.allowedInput === false && state.keyChoice === false) {
      game.sendKeyDown(13)
      game.flushDelays()
      continue
    }
  }
  throw new Error(
    `advanceToPortMenu stalled: screen=${state.view?.screen} allow=${JSON.stringify(state.allowedInput)} next=${String(state.nextLine)} text=${messageText(state).slice(0, 80)}`
  )
}

export function isBattleOrders(state: GameState): boolean {
  const choice = state.keyChoice
  // Modern unarmed battles offer Run only; Classic always offers Fight and Run.
  return Array.isArray(choice) && choice.includes('R') && state.view?.screen === 'battle'
}

export function isPortMenu(state: GameState): boolean {
  const allow = state.allowedInput
  return Array.isArray(allow) && allow[1] === 'PORT3' && allow.includes('B') && allow.includes('Q')
}

/** Advance timed/at-sea narration until battle orders or the next port menu. */
export function advanceTravel(game: GameSession, state: GameState): void {
  for (let i = 0; i < 80; i++) {
    if (isBattleOrders(state) || isPortMenu(state)) return
    if (state.view?.screen === 'score') {
      throw new Error('advanceTravel reached score screen unexpectedly')
    }
    if (state.nextLine !== '' || state.delayTicks > 0) {
      game.flushDelays()
      continue
    }
    if (state.keyChoice) return
    game.sendKeyDown(13)
    game.flushDelays()
  }
  throw new Error(
    `advanceTravel stalled: screen=${state.view?.screen} loc=${String(state.location)} next=${String(state.nextLine)}`
  )
}
