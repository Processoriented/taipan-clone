import type { GameState } from '../../../../shared/save'
import { BattleScreen } from './BattleScreen'
import { FirmScreen } from './FirmScreen'
import { LegacyFrame } from './LegacyFrame'
import { PortScreen } from './PortScreen'
import { ScoreScreen } from './ScoreScreen'
import { StakeScreen } from './StakeScreen'

export function GameScreen({
  state,
  onPlayAgain
}: {
  state: GameState
  onPlayAgain: () => void
}): React.JSX.Element {
  if (!state.view) {
    if (state.viewHtml) return <LegacyFrame html={state.viewHtml} inputText={state.inputText} />
    return <FirmScreen state={state} />
  }
  switch (state.view.screen) {
    case 'firm':
      return <FirmScreen state={state} />
    case 'stake':
      return <StakeScreen state={state} />
    case 'battle':
      return <BattleScreen state={state} />
    case 'score':
      return <ScoreScreen state={state} onPlayAgain={onPlayAgain} />
    default:
      return <PortScreen state={state} />
  }
}
