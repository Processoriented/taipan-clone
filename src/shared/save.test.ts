import { describe, expect, it } from 'vitest'
import { createEmptyView } from './view'
import {
  activeSaves,
  createInitialState,
  isSaveFile,
  isSaveId,
  summaryOf,
  type SaveFile
} from './save'

function validSave(overrides: Partial<SaveFile> = {}): SaveFile {
  const state = createInitialState()
  return {
    version: 2,
    id: '01234567-89ab-cdef-0123-456789abcdef',
    status: 'active',
    updatedAt: '2026-01-02T00:00:00.000Z',
    summary: summaryOf(state),
    state,
    ...overrides
  }
}

describe('isSaveId', () => {
  it('accepts uuid strings', () => {
    expect(isSaveId('01234567-89ab-cdef-0123-456789abcdef')).toBe(true)
  })

  it('rejects non-uuid values', () => {
    expect(isSaveId('not-a-uuid')).toBe(false)
    expect(isSaveId(12)).toBe(false)
  })
})

describe('isSaveFile', () => {
  it('accepts a valid v2 save', () => {
    expect(isSaveFile(validSave())).toBe(true)
  })

  it('rejects invalid status or id', () => {
    expect(isSaveFile(validSave({ status: 'paused' as SaveFile['status'] }))).toBe(false)
    expect(isSaveFile(validSave({ id: 'bad' }))).toBe(false)
  })

  it('migrates legacy state keys', () => {
    const state = createInitialState() as Record<string, unknown>
    state.CA = 1234
    delete state.cash
    delete state.view
    state.viewHtml = ''
    const save: Record<string, unknown> = {
      version: 1,
      id: '01234567-89ab-cdef-0123-456789abcdef',
      status: 'active',
      updatedAt: '2026-01-02T00:00:00.000Z',
      summary: { firmName: '', year: 1860, month: 0, location: 1 },
      state
    }
    expect(isSaveFile(save)).toBe(true)
    expect((state as { cash?: number }).cash).toBe(1234)
    expect('CA' in state).toBe(false)
  })

  it('migrates missing gameMode to classic', () => {
    const state = createInitialState() as Record<string, unknown>
    delete state.gameMode
    const save: Record<string, unknown> = {
      version: 2,
      id: '01234567-89ab-cdef-0123-456789abcdef',
      status: 'active',
      updatedAt: '2026-01-02T00:00:00.000Z',
      summary: summaryOf(createInitialState()),
      state
    }
    expect(isSaveFile(save)).toBe(true)
    expect(state.gameMode).toBe('classic')
  })

  it('migrates invalid gameMode values to classic', () => {
    const state = createInitialState() as Record<string, unknown>
    state.gameMode = 'retro'
    const save: Record<string, unknown> = {
      version: 2,
      id: '01234567-89ab-cdef-0123-456789abcdef',
      status: 'active',
      updatedAt: '2026-01-02T00:00:00.000Z',
      summary: summaryOf(createInitialState()),
      state
    }
    expect(isSaveFile(save)).toBe(true)
    expect(state.gameMode).toBe('classic')
  })

  it('migrates missing wuLoanTaken to 0', () => {
    const state = createInitialState() as Record<string, unknown>
    delete state.wuLoanTaken
    const save: Record<string, unknown> = {
      version: 2,
      id: '01234567-89ab-cdef-0123-456789abcdef',
      status: 'active',
      updatedAt: '2026-01-02T00:00:00.000Z',
      summary: summaryOf(createInitialState()),
      state
    }
    expect(isSaveFile(save)).toBe(true)
    expect(state.wuLoanTaken).toBe(0)
  })
})

describe('summaryOf', () => {
  it('picks firm, date, and location', () => {
    const state = createInitialState()
    state.firmName = 'House'
    state.year = 1861
    state.month = 3
    state.location = 2
    expect(summaryOf(state)).toEqual({
      firmName: 'House',
      year: 1861,
      month: 3,
      location: 2
    })
  })
})

describe('createInitialState', () => {
  it('starts in 1860 Hong Kong with classic defaults', () => {
    const state = createInitialState()
    expect(state.gameMode).toBe('classic')
    expect(state.year).toBe(1860)
    expect(state.shipCapacity).toBe(60)
    expect(state.location).toBe(1)
    expect(state.view).toEqual(createEmptyView())
    expect(state.cargo).toHaveLength(2)
    expect(state.goods).toHaveLength(4)
  })
})

describe('activeSaves', () => {
  it('filters active saves and sorts newest first', () => {
    const older = validSave({
      id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
      updatedAt: '2026-01-01T00:00:00.000Z'
    })
    const newer = validSave({
      id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
      updatedAt: '2026-02-01T00:00:00.000Z'
    })
    const done = validSave({
      id: 'cccccccc-cccc-cccc-cccc-cccccccccccc',
      status: 'done',
      updatedAt: '2026-03-01T00:00:00.000Z'
    })
    expect(activeSaves([older, done, newer]).map((save) => save.id)).toEqual([newer.id, older.id])
  })
})
