import { createEmptyView, isGameView, type GameView } from './view'

export type Line = number | string
export type Choice = [number, Line, ...string[]]
export type SaveStatus = 'active' | 'done'
export type { GameView }

export type GameSummary = {
  firmName: string
  year: number
  month: number
  location: number | string
}

export type GameState = {
  month: number
  year: number
  shipCapacity: number
  bank: number
  location: number | string
  monthsElapsed: number
  warehouseFree: number
  warehouseUsed: number
  enemyStrength: number
  enemyDamage: number
  attackerKind: number
  damage: number
  offerPrice: number
  debt: number
  cash: number
  holdRoom: number
  guns: number
  pirateRarity: number
  cargo: number[][]
  goods: (string | number)[][]
  liFavor: number
  liDonation: number
  enemyShips: number
  enemyShipsAtStart: number
  shipsOnScreen: number
  shipsSunk: number
  booty: number
  battleOrder: number | string
  escapeOdds: number
  escapeStep: number
  enemySlots: number[][]
  portPrices: number[]
  repairCost: number
  selectedGood: number
  affordableUnits: number
  transferFrom: number
  transferGood: number
  gunsFired: number
  incomingFire: number
  yearsPlayed: number
  monthsPlayed: number
  portPrompt: number
  firmName: string
  nextLine: Line
  delayTicks: number
  allowedInput: Choice | false
  keyChoice: Choice | false
  firmNameLimit: number | false
  inputText: string
  view?: GameView
  viewHtml?: string
  resumeLine: Line
}

export type SaveFile = {
  version: 1 | 2
  id: string
  status: SaveStatus
  updatedAt: string
  summary: GameSummary
  state: GameState
}

const SAVE_ID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

const NUMBER_KEYS = [
  'month',
  'year',
  'shipCapacity',
  'bank',
  'monthsElapsed',
  'warehouseFree',
  'warehouseUsed',
  'enemyStrength',
  'enemyDamage',
  'attackerKind',
  'damage',
  'offerPrice',
  'debt',
  'cash',
  'holdRoom',
  'guns',
  'pirateRarity',
  'liFavor',
  'liDonation',
  'enemyShips',
  'enemyShipsAtStart',
  'shipsOnScreen',
  'shipsSunk',
  'booty',
  'escapeOdds',
  'escapeStep',
  'repairCost',
  'selectedGood',
  'affordableUnits',
  'transferFrom',
  'transferGood',
  'gunsFired',
  'incomingFire',
  'yearsPlayed',
  'monthsPlayed',
  'portPrompt',
  'delayTicks'
] as const

const STATE_RENAMES: ReadonlyArray<readonly [string, string]> = [
  ['LI$', 'liDonation'],
  ['YEARSf', 'yearsPlayed'],
  ['MONTHSf', 'monthsPlayed'],
  ['mesid', 'portPrompt'],
  ['prices', 'priceTableHtml'],
  ['afford', 'affordableUnits'],
  ['item', 'selectedGood'],
  ['fname', 'firmNameLimit'],
  ['allow', 'allowedInput'],
  ['delay', 'delayTicks'],
  ['goto', 'nextLine'],
  ['get', 'keyChoice'],
  ['wh1', 'transferFrom'],
  ['wh2', 'transferGood'],
  ['SC', 'shipCapacity'],
  ['WC', 'warehouseFree'],
  ['WS', 'warehouseUsed'],
  ['EC', 'enemyStrength'],
  ['ED', 'enemyDamage'],
  ['F1', 'attackerKind'],
  ['DM', 'damage'],
  ['SP', 'offerPrice'],
  ['DW', 'debt'],
  ['CA', 'cash'],
  ['MW', 'holdRoom'],
  ['GN', 'guns'],
  ['FQ', 'pirateRarity'],
  ['ST', 'cargo'],
  ['BP', 'goods'],
  ['SN', 'enemyShips'],
  ['S0', 'enemyShipsAtStart'],
  ['SS', 'shipsOnScreen'],
  ['SK', 'shipsSunk'],
  ['BT', 'booty'],
  ['LC', 'battleOrder'],
  ['CMD', 'battleOrderHtml'],
  ['OK', 'escapeOdds'],
  ['IK', 'escapeStep'],
  ['AM', 'enemySlots'],
  ['CP', 'portPrices'],
  ['BR', 'repairCost'],
  ['CG', 'gunsFired'],
  ['DQ', 'incomingFire'],
  ['MO', 'month'],
  ['YE', 'year'],
  ['BA', 'bank'],
  ['LO', 'location'],
  ['TI', 'monthsElapsed'],
  ['LI', 'liFavor']
]

const PLAIN_GOODS = ['Opium', 'Silk', 'Arms', 'General Cargo']

const BASE_GOODS: (string | number)[][] = [
  ['Opium', 11, 16, 15, 14, 12, 10, 13],
  ['Silk', 11, 14, 15, 16, 10, 13, 12],
  ['Arms', 12, 16, 10, 11, 13, 14, 15],
  ['General Cargo', 10, 11, 12, 13, 14, 15, 16]
]

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function isLine(value: unknown): value is Line {
  return typeof value === 'number' || typeof value === 'string'
}

function migrateState(value: Record<string, unknown>): void {
  for (const [oldKey, newKey] of STATE_RENAMES) {
    if (oldKey in value && !(newKey in value)) value[newKey] = value[oldKey]
    if (oldKey in value) delete value[oldKey]
  }
  delete value.WW
  delete value.D
  delete value.priceTableHtml
  delete value.battleOrderHtml
  if (Array.isArray(value.goods)) {
    for (let i = 0; i < PLAIN_GOODS.length; i++) {
      const row = value.goods[i]
      if (!Array.isArray(row)) continue
      if (typeof row[0] !== 'string' || row[0].includes('<')) row[0] = PLAIN_GOODS[i]
    }
  }
}

function isGameState(value: unknown): value is GameState {
  if (!isRecord(value)) return false
  for (const key of NUMBER_KEYS) {
    if (typeof value[key] !== 'number' || !Number.isFinite(value[key])) return false
  }
  if (typeof value.firmName !== 'string') return false
  if (typeof value.inputText !== 'string') return false
  if (value.view !== undefined && !isGameView(value.view)) return false
  if (!isGameView(value.view) && typeof value.viewHtml !== 'string') return false
  if (!isLine(value.nextLine) || !isLine(value.resumeLine)) return false
  if (typeof value.location !== 'number' && typeof value.location !== 'string') return false
  if (typeof value.battleOrder !== 'number' && typeof value.battleOrder !== 'string') return false
  if (value.allowedInput !== false && !Array.isArray(value.allowedInput)) return false
  if (value.keyChoice !== false && !Array.isArray(value.keyChoice)) return false
  if (value.firmNameLimit !== false && typeof value.firmNameLimit !== 'number') return false
  if (!Array.isArray(value.cargo) || !Array.isArray(value.goods)) return false
  if (!Array.isArray(value.enemySlots) || !Array.isArray(value.portPrices)) return false
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
  if (value.version !== 1 && value.version !== 2) return false
  if (value.version === 2 && isRecord(value.state) && !isGameView(value.state.view)) return false
  if (value.status !== 'active' && value.status !== 'done') return false
  if (!isSaveId(value.id)) return false
  if (typeof value.updatedAt !== 'string') return false
  if (!isSummary(value.summary)) return false
  if (isRecord(value.state)) migrateState(value.state)
  if (!isGameState(value.state)) return false
  return true
}

export function summaryOf(state: GameState): GameSummary {
  return {
    firmName: state.firmName,
    year: state.year,
    month: state.month,
    location: state.location
  }
}

export function createInitialState(): GameState {
  return {
    month: 0,
    year: 1860,
    shipCapacity: 60,
    bank: 0,
    location: 1,
    monthsElapsed: 1,
    warehouseFree: 10000,
    warehouseUsed: 0,
    enemyStrength: 20,
    enemyDamage: 0.5,
    attackerKind: 0,
    damage: 0,
    offerPrice: 0,
    debt: 0,
    cash: 0,
    holdRoom: 0,
    guns: 0,
    pirateRarity: 0,
    cargo: [
      [0, 0, 0, 0],
      [0, 0, 0, 0]
    ],
    goods: BASE_GOODS.map((row) => row.slice()),
    liFavor: 0,
    liDonation: 0,
    enemyShips: 0,
    enemyShipsAtStart: 0,
    shipsOnScreen: 0,
    shipsSunk: 0,
    booty: 0,
    battleOrder: 0,
    escapeOdds: 0,
    escapeStep: 0,
    enemySlots: Array.from({ length: 10 }, () => []),
    portPrices: [],
    repairCost: 0,
    selectedGood: 0,
    affordableUnits: 0,
    transferFrom: 0,
    transferGood: 0,
    gunsFired: 0,
    incomingFire: 0,
    yearsPlayed: 0,
    monthsPlayed: 0,
    portPrompt: 0,
    firmName: '',
    nextLine: '',
    delayTicks: 0,
    allowedInput: false,
    keyChoice: false,
    firmNameLimit: false,
    inputText: '',
    view: createEmptyView(),
    resumeLine: ''
  }
}

export function createNewSave(): SaveFile {
  const state = createInitialState()
  return {
    version: 2,
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
