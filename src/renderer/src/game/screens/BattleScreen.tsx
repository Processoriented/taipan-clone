import dm0 from '../../assets/dm0.gif'
import dm1 from '../../assets/dm1.gif'
import dm2 from '../../assets/dm2.gif'
import dm3 from '../../assets/dm3.gif'
import dm4 from '../../assets/dm4.gif'
import dm5 from '../../assets/dm5.gif'
import dm6 from '../../assets/dm6.gif'
import dm7 from '../../assets/dm7.gif'
import dm8 from '../../assets/dm8.gif'
import dm9 from '../../assets/dm9.gif'
import dm10 from '../../assets/dm10.gif'
import type { GameState } from '../../../../shared/save'
import { seaworthiness, shipStatusLabel } from '../format'
import { Cap } from './Cap'
import { RichTextView } from './RichTextView'

const damageGifs = [dm0, dm1, dm2, dm3, dm4, dm5, dm6, dm7, dm8, dm9, dm10]

export function BattleScreen({ state }: { state: GameState }): React.JSX.Element {
  const view = state.view
  const ships = view?.ships ?? []
  const modern = state.gameMode === 'modern'
  const status = shipStatusLabel(state.damage, state.shipCapacity)
  const seaworthy = seaworthiness(state.damage, state.shipCapacity)
  const inSalvo = state.battleOrder === 'F' && state.guns > 0
  const shotsLeft = Math.max(0, state.guns - state.gunsFired)

  return (
    <div className={modern ? 'screen-battle modern' : 'screen-battle'}>
      <div className="f0">
        <div>
          <span>{state.enemyShips}</span> ships attacking, <Cap text="Taipan" />!
        </div>
        <div>
          <RichTextView nodes={view?.battleLine2 ?? []} state={state} slot="battle" />
        </div>
        <div>&nbsp;</div>
        <div>
          <RichTextView nodes={view?.battleLine4 ?? []} state={state} slot="battle" />
        </div>
        <div className="guns">
          <Cap text="We" /> have
          <br />
          <span>{state.guns}</span> guns
        </div>
      </div>
      {ships.map((ship, index) => (
        <div className={`sf sf${index}`} key={index}>
          {ship.present ? (
            <>
              <div className="ship" style={{ top: ship.sinkY }}>
                {ship.damageFrame != null && damageGifs[ship.damageFrame] ? (
                  <img className="dmg" src={damageGifs[ship.damageFrame]} alt="" />
                ) : null}
              </div>
              <div className="ff" style={{ visibility: ship.muzzle ? 'visible' : 'hidden' }} />
            </>
          ) : null}
        </div>
      ))}
      {view?.showExtraShips ? <div className="plus">+</div> : <div className="plus" />}
      <div className="ef" style={{ visibility: view?.enemyFlash ? 'visible' : 'hidden' }} />
      <div className="battle-hud-modern">
        <div className="battle-hud-status">
          <Cap text="Ship" />: <Cap text={status} /> ({seaworthy}%)
        </div>
        <div className="battle-hud-salvo">
          {inSalvo ? (
            <>
              <Cap text="Salvo" />: {shotsLeft}/{state.guns}
            </>
          ) : (
            '\u00a0'
          )}
        </div>
      </div>
    </div>
  )
}
