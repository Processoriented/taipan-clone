import { useEffect, useRef, useState } from 'react'
import { startGame } from './engine'
import { useGame } from './gameContext'
import { GameScreen } from './screens/GameScreen'
import { SaveSelectScreen } from './screens/SaveSelectScreen'

function TaipanGame(): React.JSX.Element {
  const {
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
  } = useGame()
  const [, setFrame] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!session) return
    return startGame(session.state, {
      persist,
      markDone,
      flush,
      onFrame: () => setFrame((frame) => frame + 1)
    })
  }, [session, persist, markDone, flush])

  if (!session) {
    if (!ready) return <div className="content_center" />
    return (
      <div className="content_center">
        <SaveSelectScreen
          saves={saves}
          onResume={resumeGame}
          onNewGame={startNewGame}
          onDelete={deleteSave}
          onQuit={quit}
        />
      </div>
    )
  }

  return (
    <div
      className="content_center"
      onClick={(event) => {
        const target = event.target
        if (!(target instanceof Element)) return
        if (target.closest('#play-again')) {
          startNewGame()
          return
        }
        if (target.closest('.play-again') || target.closest('.port-exit')) return
        inputRef.current?.focus()
      }}
    >
      <input ref={inputRef} className="mobile-helper" aria-hidden="true" tabIndex={-1} />
      <GameScreen state={session.state} onPlayAgain={startNewGame} onExit={exitToMenu} />
    </div>
  )
}

export default TaipanGame
