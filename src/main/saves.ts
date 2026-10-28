import { mkdirSync, readdirSync, readFileSync, renameSync, writeFileSync } from 'fs'
import { join } from 'path'
import { isSaveFile, isSaveId } from '../shared/save'

const lastSeq = new Map<string, number>()

function ensureDir(dir: string): void {
  mkdirSync(dir, { recursive: true })
}

export function listSaves(dir: string): unknown[] {
  ensureDir(dir)
  const names = readdirSync(dir).filter((name) => name.endsWith('.json'))
  const saves: unknown[] = []
  for (const name of names) {
    try {
      saves.push(JSON.parse(readFileSync(join(dir, name), 'utf8')) as unknown)
    } catch {
      // Unreadable files are ignored so a bad save cannot block a new game.
    }
  }
  return saves
}

export function writeSave(dir: string, payload: unknown, seq: unknown): void {
  if (typeof seq !== 'number' || !Number.isFinite(seq)) throw new Error('Invalid save sequence')
  if (!isSaveFile(payload)) throw new Error('Invalid save file')
  if (!isSaveId(payload.id)) throw new Error('Invalid save id')
  const previous = lastSeq.get(payload.id) ?? -1
  if (seq < previous) return

  ensureDir(dir)
  const dest = join(dir, `${payload.id}.json`)
  const temp = join(dir, `${payload.id}.json.tmp`)
  writeFileSync(temp, JSON.stringify(payload))
  renameSync(temp, dest)
  lastSeq.set(payload.id, seq)
}
