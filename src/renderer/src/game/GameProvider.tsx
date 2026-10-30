import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  createNewSave,
  isSaveFile,
  selectActiveSave,
  summaryOf,
  type GameState,
  type SaveFile,
  type SaveStatus
} from '../../../shared/save'
import { isGameView } from '../../../shared/view'
import { GameContext } from './gameContext'

let bootToken = 0

function stamp(save: SaveFile, state: GameState, status: SaveStatus): void {
  if (isGameView(state.view)) save.version = 2
  save.status = status
  save.state = state
  save.updatedAt = new Date().toISOString()
  save.summary = summaryOf(state)
}

export function GameProvider({ children }: { children: React.ReactNode }): React.JSX.Element {
  const [session, setSession] = useState<SaveFile | null>(null)
  const saveRef = useRef<SaveFile | null>(null)
  const seqRef = useRef(0)
  const queueRef = useRef(Promise.resolve())

  const enqueue = useCallback((save: SaveFile, seq: number): void => {
    const copy = structuredClone(save)
    queueRef.current = queueRef.current
      .then(() => window.api.writeSave(copy, seq))
      .catch((error: unknown) => {
        console.error(error)
      })
  }, [])

  const persist = useCallback(
    (state: GameState): void => {
      const current = saveRef.current
      if (!current || current.status === 'done' || current.state !== state) return
      stamp(current, state, 'active')
      enqueue(current, ++seqRef.current)
    },
    [enqueue]
  )

  const markDone = useCallback((state: GameState): void => {
    const current = saveRef.current
    if (!current || current.state !== state) return
    stamp(current, state, 'done')
    window.api.writeSaveSync(structuredClone(current), ++seqRef.current)
  }, [])

  const flush = useCallback((state: GameState): void => {
    const current = saveRef.current
    if (!current || current.status === 'done' || current.state !== state) return
    stamp(current, state, current.status)
    window.api.writeSaveSync(structuredClone(current), ++seqRef.current)
  }, [])

  const startNewGame = useCallback((): void => {
    const next = createNewSave()
    seqRef.current = 0
    saveRef.current = next
    enqueue(next, ++seqRef.current)
    setSession(next)
  }, [enqueue])

  useEffect(() => {
    const token = ++bootToken
    void (async (): Promise<void> => {
      let active: SaveFile | null = null
      try {
        const listed = await window.api.listSaves()
        active = selectActiveSave(listed.filter(isSaveFile))
      } catch (error) {
        console.error(error)
      }
      if (token !== bootToken) return
      if (active) {
        saveRef.current = active
        setSession(active)
        return
      }
      const next = createNewSave()
      seqRef.current = 0
      saveRef.current = next
      enqueue(next, ++seqRef.current)
      if (token !== bootToken) return
      setSession(next)
    })()
  }, [enqueue])

  const value = useMemo(
    () => ({ session, persist, markDone, flush, startNewGame }),
    [session, persist, markDone, flush, startNewGame]
  )

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>
}
