import { useState } from 'react'
import type { SaveFile } from '../../../../shared/save'
import { currentScore } from '../format'
import { Cap } from './Cap'

function firmLabel(save: SaveFile): string {
  const name = save.summary.firmName.trim()
  return name === '' ? '\u2014' : name
}

function formatPlayed(iso: string): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return iso
  return date.toLocaleString('en-US', {
    month: 'numeric',
    day: 'numeric',
    year: '2-digit',
    hour: 'numeric',
    minute: '2-digit'
  })
}

export function SaveSelectScreen({
  saves,
  onResume,
  onNewGame,
  onDelete,
  onQuit
}: {
  saves: SaveFile[]
  onResume: (save: SaveFile) => void
  onNewGame: () => void
  onDelete: (id: string) => Promise<void>
  onQuit: () => void
}): React.JSX.Element {
  const [pending, setPending] = useState<SaveFile | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [failed, setFailed] = useState(false)

  async function confirmDelete(): Promise<void> {
    if (!pending || deleting) return
    setDeleting(true)
    setFailed(false)
    try {
      await onDelete(pending.id)
      setPending(null)
    } catch (error) {
      console.error(error)
      setFailed(true)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="screen-saves">
      <div className="saves-title">
        <Cap text="Taipan" />!
      </div>
      {pending ? (
        <div className="saves-confirm">
          <div>
            <Cap text="Are" /> you sure?
          </div>
          <div className="saves-confirm-name">{firmLabel(pending)}</div>
          {failed ? <div>The save could not be deleted.</div> : null}
          <div className="saves-actions">
            <button
              type="button"
              className="menu-button"
              disabled={deleting}
              onClick={() => {
                void confirmDelete()
              }}
            >
              <Cap text="Delete" />
            </button>
            <button
              type="button"
              className="menu-button"
              disabled={deleting}
              onClick={() => {
                setPending(null)
                setFailed(false)
              }}
            >
              <Cap text="Cancel" />
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="saves-list">
            {saves.length === 0 ? (
              <div className="saves-empty">No games in progress</div>
            ) : (
              <>
                <div className="save-row saves-columns">
                  <div className="save-labels">
                    <span className="save-firm">
                      <Cap text="Firm" />
                    </span>
                    <span className="save-score">
                      <Cap text="Score" />
                    </span>
                    <span className="save-played">
                      <Cap text="Last" /> played
                    </span>
                  </div>
                  <span className="save-delete-spacer" />
                </div>
                {saves.map((save) => (
                  <div className="save-row" key={save.id}>
                    <button type="button" className="save-resume" onClick={() => onResume(save)}>
                      <span className="save-firm">{firmLabel(save)}</span>
                      <span className="save-score">
                        {currentScore(save.state).toLocaleString('en-US')}
                      </span>
                      <span className="save-played">{formatPlayed(save.updatedAt)}</span>
                    </button>
                    <button
                      type="button"
                      className="save-delete"
                      aria-label={`Delete ${firmLabel(save)}`}
                      onClick={() => {
                        setFailed(false)
                        setPending(save)
                      }}
                    >
                      🗑️
                    </button>
                  </div>
                ))}
              </>
            )}
          </div>
          <div className="saves-actions">
            <button type="button" className="menu-button" onClick={onNewGame}>
              <Cap text="New" /> Game
            </button>
            <button type="button" className="menu-button" onClick={onQuit}>
              <Cap text="Quit" /> Taipan!
            </button>
          </div>
        </>
      )}
    </div>
  )
}
