import type { GameState } from '../../../../shared/save'
import { Cap } from './Cap'
import { PromptInput } from './PromptInput'

export function FirmScreen({ state }: { state: GameState }): React.JSX.Element {
  const view = state.view
  return (
    <div className="screen-firm">
      <div className="S2a">
        &nbsp; &nbsp; <Cap text="Taipan" />,<br />
        <br />
        <Cap text="What" /> will you name your
        <br />
        <br />
        &nbsp; &nbsp; <Cap text="Firm" />:{' '}
        <span className="firm-input">
          {view?.inputSlot === 'firm' ? (
            <PromptInput value={state.inputText} cursor={view.cursor} />
          ) : null}
        </span>
        <br />
        &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; <span className="S2c">----------------------</span>
      </div>
    </div>
  )
}
