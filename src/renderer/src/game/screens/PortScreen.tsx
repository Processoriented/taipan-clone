import type { GameState } from '../../../../shared/save'
import { formatMoney, MONTHS, seaworthiness, shipStatusLabel } from '../format'
import { cityNodes } from '../richText'
import { Cap } from './Cap'
import { RichTextView } from './RichTextView'

function Money({ value }: { value: number }): React.JSX.Element {
  return <RichTextView nodes={formatMoney(value)} />
}

function HoldRoom({ room }: { room: number }): React.JSX.Element {
  if (room >= 0) return <>{room}</>
  return (
    <span className="inverse">
      <Cap text="Overload" />
    </span>
  )
}

export function PortScreen({ state }: { state: GameState }): React.JSX.Element {
  const worth = seaworthiness(state.damage, state.shipCapacity)
  const status = shipStatusLabel(state.damage, state.shipCapacity)
  // Cash goes negative only while a Li Yuen donation is still unresolved. Keep showing the cash on hand.
  const cashShown = state.cash < 0 ? state.cash + state.liDonation : state.cash
  const month = MONTHS[state.month] ?? 'Jan'
  const where = state.view?.atSea ? cityNodes(0) : cityNodes(Number(state.location))
  return (
    <div className="screen-port">
      <div className="p1">
        <Cap text="Firm" />: <span className="cap">{state.firmName}</span>, <Cap text="Hong" />{' '}
        <Cap text="Kong" />
      </div>
      <table>
        <tbody>
          <tr>
            <td>
              <div className="p2">
                <Cap text="Hong" /> <Cap text="Kong" /> <Cap text="Warehouse" />
                <br />
                <table>
                  <tbody>
                    <tr>
                      <td className="c10">&nbsp;</td>
                      <td className="c30">
                        <Cap text="Opium" />
                      </td>
                      <td className="c30">
                        <Money value={state.cargo[0][0]} />
                      </td>
                      <td className="c30">
                        <Cap text="In" /> use:
                      </td>
                    </tr>
                    <tr>
                      <td className="c10">&nbsp;</td>
                      <td className="c30">
                        <Cap text="Silk" />
                      </td>
                      <td className="c30">
                        <Money value={state.cargo[0][1]} />
                      </td>
                      <td className="c30">
                        &nbsp;
                        <Money value={state.warehouseUsed} />
                      </td>
                    </tr>
                    <tr>
                      <td className="c10">&nbsp;</td>
                      <td className="c30">
                        <Cap text="Arms" />
                      </td>
                      <td className="c30">
                        <Money value={state.cargo[0][2]} />
                      </td>
                      <td className="c30">
                        <Cap text="Vacant" />:
                      </td>
                    </tr>
                    <tr>
                      <td className="c10">&nbsp;</td>
                      <td className="c30">
                        <Cap text="General" />
                      </td>
                      <td className="c30">
                        <Money value={state.cargo[0][3]} />
                      </td>
                      <td className="c30">
                        &nbsp;
                        <Money value={state.warehouseFree} />
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </td>
            <td rowSpan={2} className="vtop">
              <div className="p3">
                <Cap text="Date" />
                <br />
                15{' '}
                <span className="inverse">
                  <Cap text={month} />
                </span>{' '}
                {state.year}
                <br />
                <br />
                <Cap text="Location" />
                <br />
                <span className="inverse">
                  <RichTextView nodes={where} />
                </span>
                <br />
                <br />
                <Cap text="Debt" />
                <br />
                <span className="inverse">
                  <Money value={state.debt} />
                </span>
                <br />
                <br />
                <Cap text="Ship" /> status
                <br />
                <Cap text={status} />
                {worth < 100 ? ': ' : ':'}
                {worth}
              </div>
            </td>
          </tr>
          <tr>
            <td>
              <div className="p2">
                <table>
                  <tbody>
                    <tr>
                      <td colSpan={2}>
                        <Cap text="Hold" /> <HoldRoom room={state.holdRoom} />
                      </td>
                      <td className="c30r">
                        <Cap text="Guns" />
                        &nbsp;
                      </td>
                      <td className="c30">{state.guns}</td>
                    </tr>
                    <tr>
                      <td className="c10">&nbsp;</td>
                      <td className="c30">
                        <Cap text="Opium" />
                      </td>
                      <td className="c30">
                        <Money value={state.cargo[1][0]} />
                      </td>
                      <td className="c30">&nbsp;</td>
                    </tr>
                    <tr>
                      <td className="c10">&nbsp;</td>
                      <td className="c30">
                        <Cap text="Silk" />
                      </td>
                      <td className="c30">
                        <Money value={state.cargo[1][1]} />
                      </td>
                      <td className="c30">&nbsp;</td>
                    </tr>
                    <tr>
                      <td className="c10">&nbsp;</td>
                      <td className="c30">
                        <Cap text="Arms" />
                      </td>
                      <td className="c30">
                        <Money value={state.cargo[1][2]} />
                      </td>
                      <td className="c30">&nbsp;</td>
                    </tr>
                    <tr>
                      <td className="c10">&nbsp;</td>
                      <td className="c30">
                        <Cap text="General" />
                      </td>
                      <td className="c30">
                        <Money value={state.cargo[1][3]} />
                      </td>
                      <td className="c30">&nbsp;</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
      <div className="p4">
        <table>
          <tbody>
            <tr>
              <td className="c50">
                <Cap text="Cash" />: <Money value={cashShown} />
              </td>
              <td className="c50">
                <Cap text="Bank" />: <Money value={state.bank} />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div className="solidline" />
      <div className="p4">
        <RichTextView nodes={state.view?.message ?? []} state={state} slot="message" />
      </div>
    </div>
  )
}
