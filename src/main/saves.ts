import { mkdirSync, readdirSync, readFileSync, renameSync, unlinkSync, writeFileSync } from 'fs'
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

function missingFile(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (error as { code?: unknown }).code === 'ENOENT'
  )
}

function removeFile(path: string): void {
  try {
    unlinkSync(path)
  } catch (error) {
    if (!missingFile(error)) throw error
  }
}

export function deleteSave(dir: string, id: unknown): void {
  if (!isSaveId(id)) throw new Error('Invalid save id')
  removeFile(join(dir, `${id}.json`))
  removeFile(join(dir, `${id}.json.tmp`))
  lastSeq.delete(id)
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
