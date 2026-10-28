import { useEffect, useRef } from 'react'
import { startGame } from './engine'
import { gameMarkup } from './markup'

function TaipanGame(): React.JSX.Element {
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const root = rootRef.current
    if (!root) return

    let stop = (): void => {}

    const boot = (): void => {
      root.innerHTML = gameMarkup
      stop = startGame(root)
    }

    const onClick = (event: MouseEvent): void => {
      const target = event.target
      if (target instanceof Element && target.closest('#play-again')) {
        stop()
        boot()
      }
    }

    root.addEventListener('click', onClick)
    boot()

    return () => {
      stop()
      root.removeEventListener('click', onClick)
      root.innerHTML = ''
    }
  }, [])

  return <div ref={rootRef} className="content_center" />
}

export default TaipanGame
