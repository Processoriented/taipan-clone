import { createContext, useContext } from 'react'
import type { GameState, SaveFile } from '../../../shared/save'

export type GameContextValue = {
  session: SaveFile | null
  saves: SaveFile[]
  ready: boolean
  persist: (state: GameState) => void
  markDone: (state: GameState) => void
  flush: (state: GameState) => void
  startNewGame: () => void
  resumeGame: (save: SaveFile) => void
  exitToMenu: () => void
  deleteSave: (id: string) => Promise<void>
  quit: () => void
}

export const GameContext = createContext<GameContextValue | null>(null)

export function useGame(): GameContextValue {
  const value = useContext(GameContext)
  if (!value) throw new Error('useGame must be used within GameProvider')
  return value
}
