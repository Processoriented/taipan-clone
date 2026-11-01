import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  activeSaves,
  createNewSave,
  isSaveFile,
  summaryOf,
  type GameState,
  type SaveFile,
  type SaveStatus
} from '../../../shared/save'
import { isGameView } from '../../../shared/view'
import { GameContext } from './gameContext'

let listToken = 0

function stamp(save: SaveFile, state: GameState, status: SaveStatus): void {
  if (isGameView(state.view)) save.version = 2
  save.status = status
  save.state = state
  save.updatedAt = new Date().toISOString()
  save.summary = summaryOf(state)
}

export function GameProvider({ children }: { children: React.ReactNode }): React.JSX.Element {
  const [session, setSession] = useState<SaveFile | null>(null)
  const [saves, setSaves] = useState<SaveFile[]>([])
  const [ready, setReady] = useState(false)
  const saveRef = useRef<SaveFile | null>(null)
  const seqById = useRef(new Map<string, number>())
  const queueRef = useRef(Promise.resolve())

  const nextSeq = useCallback((id: string): number => {
    const next = (seqById.current.get(id) ?? 0) + 1
    seqById.current.set(id, next)
    return next
  }, [])

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
      enqueue(current, nextSeq(current.id))
    },
    [enqueue, nextSeq]
  )

  const markDone = useCallback(
    (state: GameState): void => {
      const current = saveRef.current
      if (!current || current.state !== state) return
      stamp(current, state, 'done')
      window.api.writeSaveSync(structuredClone(current), nextSeq(current.id))
    },
    [nextSeq]
  )

  const flush = useCallback(
    (state: GameState): void => {
      const current = saveRef.current
      if (!current || current.status === 'done' || current.state !== state) return
      stamp(current, state, current.status)
      window.api.writeSaveSync(structuredClone(current), nextSeq(current.id))
    },
    [nextSeq]
  )

  const refreshSaves = useCallback(async (): Promise<void> => {
    const token = ++listToken
    const listed = await window.api.listSaves()
    if (token !== listToken) return
    setSaves(activeSaves(listed.filter(isSaveFile)))
  }, [])

  const startNewGame = useCallback((): void => {
    const next = createNewSave()
    saveRef.current = next
    enqueue(next, nextSeq(next.id))
    setSession(next)
  }, [enqueue, nextSeq])

  const resumeGame = useCallback((save: SaveFile): void => {
    saveRef.current = save
    setSession(save)
  }, [])

  const exitToMenu = useCallback((): void => {
    const current = saveRef.current
    if (current) flush(current.state)
    saveRef.current = null
    setSession(null)
    void refreshSaves().catch((error: unknown) => {
      console.error(error)
    })
  }, [flush, refreshSaves])

  const deleteSave = useCallback(
    async (id: string): Promise<void> => {
      await window.api.deleteSave(id)
      seqById.current.delete(id)
      try {
        await refreshSaves()
      } catch (error) {
        console.error(error)
        setSaves((current) => current.filter((save) => save.id !== id))
      }
    },
    [refreshSaves]
  )

  const quit = useCallback((): void => {
    window.api.quit()
  }, [])

  useEffect(() => {
    const token = ++listToken
    void (async (): Promise<void> => {
      try {
        const listed = await window.api.listSaves()
        if (token !== listToken) return
        setSaves(activeSaves(listed.filter(isSaveFile)))
      } catch (error) {
        console.error(error)
      }
      if (token !== listToken) return
      setReady(true)
    })()
  }, [])

  const value = useMemo(
    () => ({
      session,
      saves,
      ready,
      persist,
      markDone,
      flush,
      startNewGame,
      resumeGame,
      exitToMenu,
      deleteSave,
      quit
    }),
    [
      session,
      saves,
      ready,
      persist,
      markDone,
      flush,
      startNewGame,
      resumeGame,
      exitToMenu,
      deleteSave,
      quit
    ]
  )

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>
}
