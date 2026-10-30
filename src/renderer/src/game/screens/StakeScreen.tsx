import type { GameState } from '../../../../shared/save'
import { Cap } from './Cap'
import { PromptInput } from './PromptInput'

export function StakeScreen({ state }: { state: GameState }): React.JSX.Element {
  const view = state.view
  return (
    <div className="screen-stake">
      <div className="S3a">
        <Cap text="Do" /> you want to start &nbsp;. &nbsp;. &nbsp;.
        <br />
        <br />
        &nbsp; &nbsp; 1) <Cap text="With" /> cash (and a debt)
        <br />
        <br />
        &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;&gt;&gt; or &lt;&lt;
        <br />
        <br />
        &nbsp; &nbsp; 2) <Cap text="With" /> five guns and no cash
        <br />
        <br />
        &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;(
        <Cap text="But" /> no debt!)
        <br />
        <br />
        &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;?{' '}
        {view?.inputSlot === 'stake' ? (
          <PromptInput value={state.inputText} cursor={view.cursor} />
        ) : null}
      </div>
    </div>
  )
}
