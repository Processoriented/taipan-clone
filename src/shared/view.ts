export type ScreenId = 'firm' | 'stake' | 'port' | 'battle' | 'score'
export type InputSlot = 'firm' | 'stake' | 'message' | 'battle' | 'none'

export type RichNode =
  | { kind: 'text'; text: string }
  | { kind: 'cap'; text: string }
  | { kind: 'br' }
  | { kind: 'inverse'; children: RichNode[] }
  | { kind: 'input' }
  | { kind: 'priceTable' }
  | { kind: 'afford'; amount: number }
  | { kind: 'millionaire' }

export type ShipSlotView = {
  present: boolean
  sinkY: number
  muzzle: boolean
  damageFrame: number | null
}

export type GameView = {
  screen: ScreenId
  message: RichNode[]
  battleLine2: RichNode[]
  battleLine4: RichNode[]
  inputSlot: InputSlot
  cursor: boolean
  showExtraShips: boolean
  enemyFlash: boolean
  atSea: boolean
  ships: ShipSlotView[]
}

const SCREENS: readonly ScreenId[] = ['firm', 'stake', 'port', 'battle', 'score']
const INPUT_SLOTS: readonly InputSlot[] = ['firm', 'stake', 'message', 'battle', 'none']

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

export function emptyShipSlot(): ShipSlotView {
  return { present: false, sinkY: 0, muzzle: false, damageFrame: null }
}

export function createEmptyView(): GameView {
  return {
    screen: 'firm',
    message: [],
    battleLine2: [],
    battleLine4: [],
    inputSlot: 'none',
    cursor: false,
    showExtraShips: false,
    enemyFlash: false,
    atSea: false,
    ships: Array.from({ length: 10 }, () => emptyShipSlot())
  }
}

export function isRichNode(value: unknown): value is RichNode {
  if (!isRecord(value) || typeof value.kind !== 'string') return false
  switch (value.kind) {
    case 'text':
    case 'cap':
      return typeof value.text === 'string'
    case 'br':
    case 'input':
    case 'priceTable':
    case 'millionaire':
      return true
    case 'afford':
      return typeof value.amount === 'number' && Number.isFinite(value.amount)
    case 'inverse':
      return Array.isArray(value.children) && value.children.every(isRichNode)
    default:
      return false
  }
}

function isRichText(value: unknown): value is RichNode[] {
  return Array.isArray(value) && value.every(isRichNode)
}

function isShipSlot(value: unknown): value is ShipSlotView {
  if (!isRecord(value)) return false
  if (typeof value.present !== 'boolean' || typeof value.muzzle !== 'boolean') return false
  if (typeof value.sinkY !== 'number' || !Number.isFinite(value.sinkY)) return false
  if (
    value.damageFrame !== null &&
    (typeof value.damageFrame !== 'number' || !Number.isFinite(value.damageFrame))
  )
    return false
  return true
}

export function isGameView(value: unknown): value is GameView {
  if (!isRecord(value)) return false
  if (!SCREENS.includes(value.screen as ScreenId)) return false
  if (!INPUT_SLOTS.includes(value.inputSlot as InputSlot)) return false
  if (typeof value.cursor !== 'boolean') return false
  if (typeof value.showExtraShips !== 'boolean') return false
  if (typeof value.enemyFlash !== 'boolean') return false
  if (typeof value.atSea !== 'boolean') return false
  if (
    !isRichText(value.message) ||
    !isRichText(value.battleLine2) ||
    !isRichText(value.battleLine4)
  )
    return false
  if (!Array.isArray(value.ships) || value.ships.length !== 10 || !value.ships.every(isShipSlot))
    return false
  return true
}

function inlineDisplay(html: string, id: string): 'block' | 'none' | 'unset' {
  const match = html.match(new RegExp(`id="${id}"([^>]*)>`))
  const attrs = match?.[1] ?? ''
  if (attrs.includes('display: none')) return 'none'
  if (attrs.includes('display: block')) return 'block'
  return 'unset'
}

export function screenFromLegacy(html: string): ScreenId {
  if (inlineDisplay(html, 'S6') === 'block') return 'score'
  if (inlineDisplay(html, 'S5') === 'block') return 'battle'
  if (inlineDisplay(html, 'S3') === 'block') return 'stake'
  if (inlineDisplay(html, 'S4') === 'block') return 'port'
  if (inlineDisplay(html, 'S2') === 'none') return 'port'
  return 'firm'
}

function shipsFromLegacy(html: string): ShipSlotView[] {
  return Array.from({ length: 10 }, (_, index) => {
    const start = html.indexOf(`id="sf${index}"`)
    if (start < 0) return emptyShipSlot()
    const nextShip = html.indexOf('id="sf', start + 1)
    const plus = html.indexOf('id="plus"', start + 1)
    const ends = [nextShip, plus].filter((position) => position >= 0)
    const end = ends.length > 0 ? Math.min(...ends) : html.length
    const chunk = html.slice(start, end)
    const top = chunk.match(/top:\s*(\d+)px/)
    return {
      present: chunk.includes('class="ship"'),
      sinkY: top ? Number(top[1]) : 0,
      muzzle: /class="ff"[^>]*visibility:\s*visible|visibility:\s*visible[^>]*class="ff"/.test(
        chunk
      ),
      damageFrame: null
    }
  })
}

export function viewFromLegacyHtml(html: string): GameView {
  const view = createEmptyView()
  view.screen = screenFromLegacy(html)
  view.atSea = html.includes('>t sea<')
  view.ships = shipsFromLegacy(html)
  view.showExtraShips = /id="plus"[^>]*>\s*\+/.test(html)
  view.enemyFlash = /id="ef"[^>]*style="[^"]*visibility:\s*visible/.test(html)
  return view
}
