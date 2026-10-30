import type { RichNode } from '../../../shared/view'

export const br: RichNode = { kind: 'br' }
export const prompt: RichNode = { kind: 'input' }
export const priceTable: RichNode = { kind: 'priceTable' }
export const millionaire: RichNode = { kind: 'millionaire' }

export function cap(text: string): RichNode {
  return { kind: 'cap', text }
}

export function text(value: string): RichNode {
  return { kind: 'text', text: value }
}

export function afford(amount: number): RichNode {
  return { kind: 'afford', amount }
}

export function nodes(...parts: Array<RichNode | RichNode[] | string | number>): RichNode[] {
  const out: RichNode[] = []
  for (const part of parts) {
    if (typeof part === 'string' || typeof part === 'number') out.push(text(String(part)))
    else if (Array.isArray(part)) out.push(...part)
    else out.push(part)
  }
  return out
}

export function comprador(): RichNode[] {
  return [cap('Comprador'), text("'s "), cap('Report'), text(':'), br, br]
}

export function captain(): RichNode[] {
  return [text('\u00a0\u00a0'), cap('Captain'), text("'s "), cap('Report'), text(':'), br, br]
}

export function taipan(): RichNode[] {
  return [cap('Taipan')]
}

export function goodNodes(name: string): RichNode[] {
  if (name === 'General Cargo') return [cap('General'), text(' '), cap('Cargo')]
  return [cap(name)]
}

export function cityNodes(index: number): RichNode[] {
  switch (index) {
    case 0:
      return [cap('At sea')]
    case 1:
      return [cap('Hong'), text(' '), cap('Kong')]
    case 2:
      return [cap('Shanghai')]
    case 3:
      return [cap('Nagasaki')]
    case 4:
      return [cap('Saigon')]
    case 5:
      return [cap('Manila')]
    case 6:
      return [cap('Singapore')]
    case 7:
      return [cap('Batavia')]
    default:
      return [cap('At sea')]
  }
}

export function portMenu(promptIndex: number): RichNode[] {
  const buySell = [
    cap('Shall'),
    text(' '),
    cap('I'),
    text(' '),
    cap('Buy'),
    text(', '),
    cap('Sell')
  ]
  if (promptIndex === 2) return [...buySell, text(', or '), cap('Quit'), text(' trading?')]
  const hongKong = [
    ...buySell,
    text(', '),
    cap('Visit'),
    text(' bank, '),
    cap('Transfer'),
    text(' cargo,'),
    br
  ]
  if (promptIndex === 1) return [...hongKong, text('or '), cap('Quit'), text(' trading?')]
  return [...hongKong, cap('Quit'), text(' trading, or '), cap('Retire'), text('?')]
}
