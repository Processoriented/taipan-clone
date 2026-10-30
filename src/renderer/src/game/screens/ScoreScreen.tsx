import type { GameState } from '../../../../shared/save'
import { finalScore, formatMoney, scoreRank } from '../format'
import { Cap } from './Cap'
import { RichTextView } from './RichTextView'

const RANKS = [
  { rank: 1, title: 'Galley Hand', range: 'less than 500' },
  { rank: 2, title: 'Compradore', range: '500 to \u00a0 \u00a0999' },
  { rank: 3, title: 'Taipan', range: '1,000 to \u00a07,999' },
  { rank: 4, title: 'Master Taipan', range: '8,000 to 49,999' },
  { rank: 5, title: 'Ma Tsu', range: '50,000 and over\u00a0' }
] as const

function RankTitle({ title }: { title: string }): React.JSX.Element {
  const words = title.split(' ')
  return (
    <>
      {words.map((word, index) => (
        <span key={word}>
          {index > 0 ? ' ' : null}
          <Cap text={word} />
        </span>
      ))}
    </>
  )
}

export function ScoreScreen({
  state,
  onPlayAgain
}: {
  state: GameState
  onPlayAgain: () => void
}): React.JSX.Element {
  const worth = state.cash + state.bank - state.debt
  const score = finalScore(worth, state.monthsElapsed)
  const rank = scoreRank(score)
  const years = state.yearsPlayed + ' year' + (state.yearsPlayed === 1 ? '' : 's')
  const months = state.monthsPlayed + ' month' + (state.monthsPlayed === 1 ? '' : 's')
  return (
    <div className="screen-score">
      <Cap text="Your" /> final status:
      <br />
      <br />
      <Cap text="Net" /> <Cap text="Cash" />: <RichTextView nodes={formatMoney(worth)} />
      <br />
      <br />
      <Cap text="Ship" /> size: {state.shipCapacity} units with {state.guns} guns
      <br />
      <br />
      <Cap text="You" /> traded for {years} and {months}
      <br />
      <br />
      <span className="inverse">
        <Cap text="Your" /> score is {score}.
      </span>
      <br />
      <br />
      <br />
      <br />
      <Cap text="Your" /> <Cap text="Rating" />:
      <br />
      <div className="scorecard">
        <table>
          <tbody>
            {[...RANKS].reverse().map((entry) => (
              <tr key={entry.rank}>
                <td className="c50">
                  <span className={rank === entry.rank ? 'inverse' : undefined}>
                    <RankTitle title={entry.title} />
                  </span>
                </td>
                <td className="c50r">{entry.range}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <br />
      <br />
      <button type="button" className="play-again" onClick={onPlayAgain}>
        <Cap text="Play" /> again
      </button>
    </div>
  )
}
