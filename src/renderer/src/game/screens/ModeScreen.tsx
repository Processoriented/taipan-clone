import type { GameState } from '../../../../shared/save'
import { Cap } from './Cap'
import { PromptInput } from './PromptInput'

export function ModeScreen({ state }: { state: GameState }): React.JSX.Element {
  const view = state.view
  return (
    <div className="screen-mode">
      <div className="S3a">
        <Cap text="Choose" /> your rules &nbsp;. &nbsp;. &nbsp;.
        <br />
        <br />
        &nbsp; &nbsp; 1) <Cap text="Classic" />
        <br />
        <br />
        &nbsp; &nbsp; &nbsp; &nbsp; Original Taipan pacing and odds
        <br />
        <br />
        &nbsp; &nbsp; 2) <Cap text="Modern" />
        <br />
        <br />
        &nbsp; &nbsp; &nbsp; &nbsp; Opt-in balance and QoL changes
        <br />
        <br />
        &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;?{' '}
        {view?.inputSlot === 'mode' ? (
          <PromptInput value={state.inputText} cursor={view.cursor} />
        ) : null}
      </div>
    </div>
  )
}
