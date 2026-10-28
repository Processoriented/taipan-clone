export type Line = number | string
export type Choice = [number, Line, ...string[]]
export type SaveStatus = 'active' | 'done'

export type GameSummary = {
  firmName: string
  year: number
  month: number
  location: number | string
}

export type GameState = {
  MO: number
  YE: number
  SC: number
  BA: number
  LO: number | string
  TI: number
  WC: number
  WS: number
  EC: number
  ED: number
  F1: number
  DM: number
  SP: number
  WW: number
  D: number
  DW: number
  CA: number
  MW: number
  GN: number
  FQ: number
  ST: number[][]
  BP: (string | number)[][]
  LI: number
  LI$: number
  SN: number
  S0: number
  SS: number
  SK: number
  BT: number
  LC: number | string
  CMD: string
  OK: number
  IK: number
  AM: number[][]
  CP: number[]
  BR: number
  item: number
  afford: number
  wh1: number
  wh2: number
  CG: number
  DQ: number
  YEARSf: number
  MONTHSf: number
  mesid: number
  prices: string
  firmName: string
  goto: Line
  delay: number
  allow: Choice | false
  get: Choice | false
  fname: number | false
  inputText: string
  viewHtml: string
  resumeLine: Line
}

export type SaveFile = {
  version: 1
  id: string
  status: SaveStatus
  updatedAt: string
  summary: GameSummary
  state: GameState
}

const SAVE_ID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

const NUMBER_KEYS = [
  'MO',
  'YE',
  'SC',
  'BA',
  'TI',
  'WC',
  'WS',
  'EC',
  'ED',
  'F1',
  'DM',
  'SP',
  'WW',
  'D',
  'DW',
  'CA',
  'MW',
  'GN',
  'FQ',
  'LI',
  'LI$',
  'SN',
  'S0',
  'SS',
  'SK',
  'BT',
  'OK',
  'IK',
  'BR',
  'item',
  'afford',
  'wh1',
  'wh2',
  'CG',
  'DQ',
  'YEARSf',
  'MONTHSf',
  'mesid',
  'delay'
] as const

const BASE_BP: (string | number)[][] = [
  ['<span class="cap">O</span>pium', 11, 16, 15, 14, 12, 10, 13],
  ['<span class="cap">S</span>ilk', 11, 14, 15, 16, 10, 13, 12],
  ['<span class="cap">A</span>rms', 12, 16, 10, 11, 13, 14, 15],
  ['<span class="cap">G</span>eneral <span class="cap">C</span>argo', 10, 11, 12, 13, 14, 15, 16]
]

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function isLine(value: unknown): value is Line {
  return typeof value === 'number' || typeof value === 'string'
}

function isGameState(value: unknown): value is GameState {
  if (!isRecord(value)) return false
  for (const key of NUMBER_KEYS) {
    if (typeof value[key] !== 'number' || !Number.isFinite(value[key])) return false
  }
  if (typeof value.firmName !== 'string') return false
  if (typeof value.prices !== 'string') return false
  if (typeof value.CMD !== 'string') return false
  if (typeof value.inputText !== 'string') return false
  if (typeof value.viewHtml !== 'string') return false
  if (!isLine(value.goto) || !isLine(value.resumeLine)) return false
  if (typeof value.LO !== 'number' && typeof value.LO !== 'string') return false
  if (typeof value.LC !== 'number' && typeof value.LC !== 'string') return false
  if (value.allow !== false && !Array.isArray(value.allow)) return false
  if (value.get !== false && !Array.isArray(value.get)) return false
  if (value.fname !== false && typeof value.fname !== 'number') return false
  if (!Array.isArray(value.ST) || !Array.isArray(value.BP)) return false
  if (!Array.isArray(value.AM) || !Array.isArray(value.CP)) return false
  return true
}

function isSummary(value: unknown): value is GameSummary {
  if (!isRecord(value)) return false
  if (typeof value.firmName !== 'string') return false
  if (typeof value.year !== 'number' || typeof value.month !== 'number') return false
  if (typeof value.location !== 'number' && typeof value.location !== 'string') return false
  return true
}

export function isSaveId(value: unknown): value is string {
  return typeof value === 'string' && SAVE_ID.test(value)
}

export function isSaveFile(value: unknown): value is SaveFile {
  if (!isRecord(value)) return false
  if (value.version !== 1) return false
  if (value.status !== 'active' && value.status !== 'done') return false
  if (!isSaveId(value.id)) return false
  if (typeof value.updatedAt !== 'string') return false
  if (!isSummary(value.summary)) return false
  if (!isGameState(value.state)) return false
  return true
}

export function summaryOf(state: GameState): GameSummary {
  return {
    firmName: state.firmName,
    year: state.YE,
    month: state.MO,
    location: state.LO
  }
}

export function createInitialState(): GameState {
  return {
    MO: 0,
    YE: 1860,
    SC: 60,
    BA: 0,
    LO: 1,
    TI: 1,
    WC: 10000,
    WS: 0,
    EC: 20,
    ED: 0.5,
    F1: 0,
    DM: 0,
    SP: 0,
    WW: 0,
    D: 0,
    DW: 0,
    CA: 0,
    MW: 0,
    GN: 0,
    FQ: 0,
    ST: [
      [0, 0, 0, 0],
      [0, 0, 0, 0]
    ],
    BP: BASE_BP.map((row) => row.slice()),
    LI: 0,
    LI$: 0,
    SN: 0,
    S0: 0,
    SS: 0,
    SK: 0,
    BT: 0,
    LC: 0,
    CMD: '',
    OK: 0,
    IK: 0,
    AM: Array.from({ length: 10 }, () => []),
    CP: [],
    BR: 0,
    item: 0,
    afford: 0,
    wh1: 0,
    wh2: 0,
    CG: 0,
    DQ: 0,
    YEARSf: 0,
    MONTHSf: 0,
    mesid: 0,
    prices: '',
    firmName: '',
    goto: '',
    delay: 0,
    allow: false,
    get: false,
    fname: false,
    inputText: '',
    viewHtml: '',
    resumeLine: ''
  }
}

export function createNewSave(): SaveFile {
  const state = createInitialState()
  return {
    version: 1,
    id: crypto.randomUUID(),
    status: 'active',
    updatedAt: new Date().toISOString(),
    summary: summaryOf(state),
    state
  }
}

export function selectActiveSave(saves: SaveFile[]): SaveFile | null {
  const active = saves.filter((save) => save.status === 'active')
  if (active.length === 0) return null
  active.sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : a.updatedAt > b.updatedAt ? -1 : 0))
  return active[0]
}
