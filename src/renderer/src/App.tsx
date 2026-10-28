import { GameProvider } from './game/GameProvider'
import TaipanGame from './game/TaipanGame'

function App(): React.JSX.Element {
  return (
    <GameProvider>
      <TaipanGame />
    </GameProvider>
  )
}

export default App
