import { describe, expect, it } from 'vitest'
import { cityNodes, goodNodes, nodes, portMenu } from './richText'

describe('nodes', () => {
  it('flattens strings, numbers, and nested arrays', () => {
    expect(nodes('a', 1, [{ kind: 'cap', text: 'B' }], 'c')).toEqual([
      { kind: 'text', text: 'a' },
      { kind: 'text', text: '1' },
      { kind: 'cap', text: 'B' },
      { kind: 'text', text: 'c' }
    ])
  })
})

describe('goodNodes', () => {
  it('splits General Cargo and caps other goods', () => {
    expect(goodNodes('Silk')).toEqual([{ kind: 'cap', text: 'Silk' }])
    expect(goodNodes('General Cargo')).toEqual([
      { kind: 'cap', text: 'General' },
      { kind: 'text', text: ' ' },
      { kind: 'cap', text: 'Cargo' }
    ])
  })
})

describe('cityNodes', () => {
  it('maps port indexes and defaults to at sea', () => {
    expect(cityNodes(1)).toEqual([
      { kind: 'cap', text: 'Hong' },
      { kind: 'text', text: ' ' },
      { kind: 'cap', text: 'Kong' }
    ])
    expect(cityNodes(0)).toEqual([{ kind: 'cap', text: 'At sea' }])
    expect(cityNodes(99)).toEqual([{ kind: 'cap', text: 'At sea' }])
  })
})

describe('portMenu', () => {
  it('varies options by prompt index', () => {
    const other = portMenu(2)
      .map((node) => ('text' in node ? node.text : ''))
      .join('')
    expect(other).toContain('Quit')
    expect(other).not.toContain('Retire')
    expect(other).not.toContain('bank')

    const hongKong = portMenu(1)
      .map((node) => ('text' in node ? node.text : ''))
      .join('')
    expect(hongKong).toContain('bank')
    expect(hongKong).toContain('Quit')
    expect(hongKong).not.toContain('Retire')

    const retire = portMenu(0)
      .map((node) => ('text' in node ? node.text : ''))
      .join('')
    expect(retire).toContain('Retire')
  })

  it('offers Hong Kong services in Modern', () => {
    const hongKong = portMenu(1, true)
      .map((node) => ('text' in node ? node.text : ''))
      .join('')
    expect(hongKong).toContain('Transfer')
    expect(hongKong).toContain('Visit')
    expect(hongKong).toContain('McHenry')
    expect(hongKong).toContain('Wu')
    expect(hongKong).toContain('Li')
    expect(hongKong).toContain('Quit')
    expect(hongKong).not.toContain('Retire')

    const retire = portMenu(0, true)
      .map((node) => ('text' in node ? node.text : ''))
      .join('')
    expect(retire).toContain('Li')
    expect(retire).toContain('Retire')
  })
})
