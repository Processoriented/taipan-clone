import type { GameState } from '../../../../shared/save'
import type { InputSlot, RichNode } from '../../../../shared/view'
import { comprador, taipan } from '../richText'
import { Cap } from './Cap'
import { PromptInput } from './PromptInput'

function PriceTable({ state }: { state: GameState }): React.JSX.Element {
  const prices = state.portPrices
  return (
    <>
      <RichTextView nodes={comprador()} />
      <RichTextView nodes={taipan()} />
      {', present prices per unit here are:'}
      <br />
      <table>
        <tbody>
          <tr>
            <td className="c10">&nbsp;</td>
            <td className="c40">
              <Cap text={String(state.goods[0][0])} />: {prices[0]}
            </td>
            <td className="c40">
              <Cap text={String(state.goods[1][0])} />: {prices[1]}
            </td>
            <td className="c10">&nbsp;</td>
          </tr>
          <tr>
            <td className="c10">&nbsp;</td>
            <td className="c40">
              <Cap text={String(state.goods[2][0])} />: {prices[2]}
            </td>
            <td className="c40">
              <Cap text="General" />: {prices[3]}
            </td>
            <td className="c10">&nbsp;</td>
          </tr>
        </tbody>
      </table>
      <br />
    </>
  )
}

function Millionaire(): React.JSX.Element {
  return (
    <div className="millionaire">
      <span className="cap">Y</span>
      {" o\u00a0u \u00a0' \u00a0r \u00a0e \u00a0 \u00a0a"}
      <br />
      <br />
      <span className="cap">
        {
          'M \u00a0 I \u00a0 L \u00a0 L \u00a0 I \u00a0 O \u00a0 N \u00a0 A \u00a0 I \u00a0 R \u00a0 E \u00a0 !'
        }
      </span>
    </div>
  )
}

export function RichTextView({
  nodes,
  state,
  slot
}: {
  nodes: RichNode[]
  state?: GameState
  slot?: InputSlot
}): React.JSX.Element {
  return (
    <>
      {nodes.map((node, index) => {
        const key = index
        switch (node.kind) {
          case 'text':
            return <span key={key}>{node.text}</span>
          case 'cap':
            return <Cap key={key} text={node.text} />
          case 'br':
            return <br key={key} />
          case 'inverse':
            return (
              <span key={key} className="inverse">
                <RichTextView nodes={node.children} state={state} slot={slot} />
              </span>
            )
          case 'input':
            if (!state?.view || state.view.inputSlot !== slot) return null
            return <PromptInput key={key} value={state.inputText} cursor={state.view.cursor} />
          case 'priceTable':
            return state ? <PriceTable key={key} state={state} /> : null
          case 'afford':
            return (
              <span key={key} className="afford">
                You can
                <br />
                afford
                <br />
                {node.amount}
              </span>
            )
          case 'millionaire':
            return <Millionaire key={key} />
          default:
            return null
        }
      })}
    </>
  )
}
