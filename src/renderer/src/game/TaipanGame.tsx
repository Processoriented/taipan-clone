import { useEffect, useRef } from 'react'
import { startGame } from './engine'
import { useGame } from './gameContext'

function TaipanGame(): React.JSX.Element {
  const rootRef = useRef<HTMLDivElement>(null)
  const { session, persist, markDone, flush, startNewGame } = useGame()

  useEffect(() => {
    const root = rootRef.current
    if (!root || !session) return

    const stop = startGame(root, session.state, { persist, markDone, flush })

    const onClick = (event: MouseEvent): void => {
      const target = event.target
      if (target instanceof Element && target.closest('#play-again')) {
        stop()
        startNewGame()
      }
    }

    root.addEventListener('click', onClick)

    return () => {
      stop()
      root.removeEventListener('click', onClick)
      root.innerHTML = ''
    }
  }, [session, persist, markDone, flush, startNewGame])

  return <div ref={rootRef} className="content_center" />
}

export default TaipanGame
