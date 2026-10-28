import dm0 from '../assets/dm0.gif'
import dm1 from '../assets/dm1.gif'
import dm2 from '../assets/dm2.gif'
import dm3 from '../assets/dm3.gif'
import dm4 from '../assets/dm4.gif'
import dm5 from '../assets/dm5.gif'
import dm6 from '../assets/dm6.gif'
import dm7 from '../assets/dm7.gif'
import dm8 from '../assets/dm8.gif'
import dm9 from '../assets/dm9.gif'
import dm10 from '../assets/dm10.gif'
import { createInitialState, type GameState, type Line } from '../../../shared/save'
import { gameMarkup } from './markup'

const damageGifs = [dm0, dm1, dm2, dm3, dm4, dm5, dm6, dm7, dm8, dm9, dm10]

const M = Math
const Mf = M.floor
const Ml = M.log
const Mm = M.min
const Mp = M.pow
const Mr = M.random

type Field = [HTMLElement | null, number, string]

export type GameHooks = {
  persist: (state: GameState) => void
  markDone: (state: GameState) => void
  flush: (state: GameState) => void
}

const IDS = [
  'S2',
  'S2b',
  'S3',
  'S3b',
  'S4',
  'S5',
  'S6',
  'H',
  'MW',
  'GN',
  'w0',
  'w1',
  'w2',
  'w3',
  'WS',
  'WC',
  'h0',
  'h1',
  'h2',
  'h3',
  'CA',
  'BA',
  'message',
  'month0',
  'month1',
  'year',
  'location',
  'DW',
  'DM',
  'SN',
  'GNs',
  'f2',
  'f4',
  'sf0',
  'sf1',
  'sf2',
  'sf3',
  'sf4',
  'sf5',
  'sf6',
  'sf7',
  'sf8',
  'sf9',
  'plus',
  'ef',
  'CAf',
  'SCf',
  'GNf',
  'YEARSf',
  'MONTHSf',
  'SCOREf',
  'SCORE5f',
  'SCORE4f',
  'SCORE3f',
  'SCORE2f',
  'SCORE1f'
]

export function startGame(root: HTMLElement, state: GameState, hooks: GameHooks): () => void {
  const pending = new Set<number>()
  let resumed = state.viewHtml !== ''
  if (resumed) {
    root.innerHTML = state.viewHtml
    if (
      state.resumeLine !== '' &&
      state.goto === '' &&
      state.allow === false &&
      state.get === false &&
      state.fname === false
    ) {
      state.goto = state.resumeLine
      state.delay = 0
      state.resumeLine = ''
    }
  } else {
    root.innerHTML = gameMarkup
  }

  const elements = collectElements()

  function collectElements(): Record<string, HTMLElement> {
    const found: Record<string, HTMLElement> = {}
    for (const id of IDS) {
      const el = root.querySelector('#' + id)
      if (!(el instanceof HTMLElement)) {
        if (!resumed) throw new Error('Missing #' + id)
        Object.assign(state, createInitialState())
        root.innerHTML = gameMarkup
        resumed = false
        return collectElements()
      }
      found[id] = el
    }
    return found
  }

  let input: Field = [null, 0, '']
  const cursor: [HTMLElement | null, boolean] = [null, true]

  const LT = Ml(10)
  const comma = /(\d+)(\d{3})/
  const cities = [
    '<span class="cap">A</span>t sea',
    '<span class="cap">H</span>ong <span class="cap">K</span>ong',
    '<span class="cap">S</span>hanghai',
    '<span class="cap">N</span>agasaki',
    '<span class="cap">S</span>aigon',
    '<span class="cap">M</span>anila',
    '<span class="cap">S</span>ingapore',
    '<span class="cap">B</span>atavia'
  ]
  const months = [
    ['J', 'an'],
    ['F', 'eb'],
    ['M', 'ar'],
    ['A', 'pr'],
    ['M', 'ay'],
    ['J', 'un'],
    ['J', 'ul'],
    ['A', 'ug'],
    ['S', 'ep'],
    ['O', 'ct'],
    ['N', 'ov'],
    ['D', 'ec']
  ]
  const sstatus = [
    '<span class="cap">C</span>ritical',
    '<span class="cap">P</span>oor',
    '<span class="cap">F</span>air',
    '<span class="cap">G</span>ood',
    '<span class="cap">P</span>rime',
    '<span class="cap">P</span>erfect'
  ]
  const shallI = [
    '<span class="cap">S</span>hall <span class="cap">I</span> <span class="cap">B</span>uy, <span class="cap">S</span>ell, <span class="cap">V</span>isit bank, <span class="cap">T</span>ransfer cargo,<br/><span class="cap">Q</span>uit trading, or <span class="cap">R</span>etire?',
    '<span class="cap">S</span>hall <span class="cap">I</span> <span class="cap">B</span>uy, <span class="cap">S</span>ell, <span class="cap">V</span>isit bank, <span class="cap">T</span>ransfer cargo,<br/>or <span class="cap">Q</span>uit trading?',
    '<span class="cap">S</span>hall <span class="cap">I</span> <span class="cap">B</span>uy, <span class="cap">S</span>ell, or <span class="cap">Q</span>uit trading?'
  ]
  const t$ = '<span class="cap">T</span>aipan'
  const capt$ =
    '&nbsp;&nbsp;<span class="cap">C</span>aptain\'s <span class="cap">R</span>eport:<br/><br/>'
  const comp$ = '<span class="cap">C</span>omprador\'s <span class="cap">R</span>eport:<br/><br/>'
  const overload$ = '<span class="inverse"><span class="cap">O</span>verload</span>'

  function later(fn: () => void, ms: number): void {
    const id = window.setTimeout(() => {
      pending.delete(id)
      fn()
    }, ms)
    pending.add(id)
  }

  function byId(id: string): HTMLElement | null {
    const el = root.querySelector('#' + id)
    return el instanceof HTMLElement ? el : null
  }

  function touch(endGame = false): void {
    state.inputText = input[2]
    state.viewHtml = root.innerHTML
    if (endGame) hooks.markDone(state)
    else hooks.persist(state)
  }

  function onBeforeUnload(): void {
    state.inputText = input[2]
    state.viewHtml = root.innerHTML
    hooks.flush(state)
  }

  function fnTimer(): void {
    if (cursor[0] != null) {
      cursor[1] = !cursor[1]
      cursor[0].style.visibility = cursor[1] == true ? 'visible' : 'hidden'
    }
    if (state.delay > 0) state.delay--
    if (state.goto != '' && state.delay == 0) fnMain(state.goto)
  }

  function fnKeyInput(): void {
    input = [byId('input'), 0, '']
    cursor[0] = byId('cursor')
  }

  function fnFC(value: number): string {
    if (value < 1000) return String(value)
    if (value < 1e6) return value.toString().replace(comma, '$1,$2')
    const II = Mf(Ml(value) / LT)
    const IJ = Mf(II / 3) * 3
    const scale = Mp(10, II - 2)
    const scaled = (Mf(value / scale + 0.5) * scale) / Mp(10, IJ)
    let text: string
    if (scaled < 10) text = scaled.toFixed(2)
    else if (scaled < 100) text = scaled.toFixed(1)
    else text = String(scaled)
    let unit = ''
    if (IJ == 6) unit = '<span class="cap">M</span>illion'
    else if (IJ == 9) unit = '<span class="cap">B</span>illion'
    else if (IJ == 12) unit = '<span class="cap">T</span>rillion'
    return text + ' ' + unit
  }

  function fR(i: number): number {
    return Mf(Mr() * i)
  }

  function portPrice(good: number): number {
    return Number(state.BP[good][state.LO as number])
  }

  function fRP(): void {
    elements['MW'].innerHTML = String(state.MW)
    elements['GN'].innerHTML = String(state.GN)
    elements['CA'].innerHTML = fnFC(state.CA)
    elements['BA'].innerHTML = fnFC(state.BA)
    elements['DW'].innerHTML = fnFC(state.DW)
    state.WW = 100 - Mf((state.DM / state.SC) * 100)
    elements['DM'].innerHTML = sstatus[Mf(state.WW / 20)] + (state.WW < 100 ? ': ' : ':') + state.WW
  }

  function fnAddShips(): void {
    for (let i = 0; i < 10; i++) {
      if (state.SS < state.SN && state.AM[i][0] == 0) {
        state.AM[i][0] = fR(state.EC) + 20
        state.AM[i][1] = 0
        state.SS++
        elements['sf' + i].innerHTML = '<div class="ship"></div><div class="ff"></div>'
      } else if (state.AM[i][0] == 0) {
        elements['sf' + i].innerHTML = ''
      }
    }
    elements['plus'].innerHTML = state.SS < state.SN ? '+' : ''
  }

  function fnRemoveShips(): void {
    for (let i = 9; i >= 0; i--) {
      if (state.SS > state.SN && state.AM[i][0]) {
        state.AM[i][0] = 0
        state.AM[i][1] = 0
        state.SS--
        elements['sf' + i].innerHTML = ''
      }
    }
    if (state.SS <= state.SN) elements['plus'].innerHTML = ''
  }

  function fnFire(ship: number, vh: string): void {
    const fire = elements['sf' + ship].childNodes[1] as HTMLElement | undefined
    if (fire) fire.style.visibility = vh
  }

  function fnEnemyFire(vh: string): void {
    elements['ef'].style.visibility = vh
  }

  function fnSink(ship: number, px: number, sinkDelay: number): void {
    state.resumeLine = 5800
    if (px == 0) {
      px = 1
      later(() => fnSink(ship, px, sinkDelay), 500)
      return
    }
    const hull = elements['sf' + ship].childNodes[0] as HTMLElement
    hull.style.top = px + 'px'
    px++
    if (px < 84) later(() => fnSink(ship, px, sinkDelay), sinkDelay)
    else {
      elements['sf' + ship].innerHTML = ''
      state.resumeLine = ''
      state.goto = 5800
    }
  }

  function onKeyPress(e: KeyboardEvent): void {
    const key = e.charCode || e.keyCode
    if (key == 8) e.preventDefault()
  }

  function onKeyDown(e: KeyboardEvent): void {
    state.delay = 0
    let key = e.charCode || e.keyCode
    if (key == 8) {
      e.preventDefault()
      if (input[1] > 0) {
        input[2] = input[2].substring(0, input[2].length - 1)
        input[1]--
        if (input[0]) input[0].innerHTML = input[2]
        touch()
      }
    } else if (state.get) {
      if (key >= 96 && key <= 105) key -= 48
      const inchar = String.fromCharCode(key)
      for (let n = 2; n < state.get.length; n++) {
        if (inchar == state.get[n]) {
          input[2] = inchar
          input[1] = 1
          cursor[0] = null
          fnMain(state.get[1])
        }
      }
    } else if (key == 13 && state.allow && input[1] > 0) {
      cursor[0] = null
      fnMain(state.allow[1])
    } else if (state.allow) {
      if (key >= 96 && key <= 105) key -= 48
      const inchar = String.fromCharCode(key)
      for (let n = 2; n < state.allow.length; n++) {
        if (input[1] < state.allow[0] && inchar == state.allow[n]) {
          input[2] += inchar
          input[1]++
          if (input[0]) input[0].innerHTML = input[2]
          touch()
        }
      }
    } else if (state.fname) {
      const limit = state.fname
      if (key == 13 && input[1] > 0) {
        state.fname = false
        fnMain(10130)
      }
      if (key < 32 || key > 120) return
      if (key >= 96 && key <= 105) key -= 48
      const inchar = String.fromCharCode(key)
      if (input[1] < limit) {
        input[2] += inchar
        input[1]++
        if (input[0]) input[0].innerHTML = input[2]
        touch()
      }
    }
  }

  function focusHelper(event: MouseEvent): void {
    const target = event.target
    if (target instanceof Element && target.closest('#play-again')) return
    byId('mobilehelper')?.focus()
  }

  // The cases below fall through on purpose. That is the original line-numbered flow.
  /* eslint-disable no-fallthrough */
  function fnMain(line: Line): void {
    state.goto = ''
    let endGame = false
    let amount: number
    let W: number
    let i: number
    let shot = 0
    switch (line) {
      case 1000:
        state.BA += Mf(state.BA * 0.005)
        state.DW += Mf(state.DW * 0.1)
        state.TI++
        state.MO++
        if (state.MO == 12) {
          state.MO = 0
          state.YE++
          state.EC += 10
          state.ED += 0.5
          for (i = 0; i < 4; i++) {
            for (let j = 1; j < 8; j++) state.BP[i][j] = (state.BP[i][j] as number) + fR(2)
          }
        }
      case 1030:
        fRP()
        elements['month0'].innerHTML = months[state.MO][0]
        elements['month1'].innerHTML = months[state.MO][1]
        elements['year'].innerHTML = String(state.YE)
        if (state.LO != 1) {
          state.goto = 1500
          state.delay = 0
          break
        }
        if (state.LI == 0 && state.CA > 0) {
          state.WW = 0
          W = 1.8
          if (state.TI > 12) {
            state.WW = fR(1000 * state.TI) + 1000 * state.TI
            W = 1
          }
          state.LI$ = fR(state.CA / W) + state.WW
          elements['message'].innerHTML =
            comp$ +
            '<span class="cap">L</span>i <span class="cap">Y</span>uen asks ' +
            fnFC(state.LI$) +
            ' in donation<br />to the temple of <span class="cap">T</span>in <span class="cap">H</span>au, the <span class="cap">S</span>ea<br /><span class="cap">G</span>oddess. <span class="cap">W</span>ill you pay? <span id="input"></span><span id="cursor">_</span>'
          state.allow = [1, 1060, 'Y', 'N']
          fnKeyInput()
          break
        }
      case 1060:
        if (line == 1060 && input[2] == 'Y') {
          state.CA -= state.LI$
          if (state.CA >= 0) {
            state.LI = 1
            elements['CA'].innerHTML = fnFC(state.CA)
          } else {
            elements['message'].innerHTML =
              comp$ +
              t$ +
              ', you do not have enough cash!!<br /><br /><span class="cap">D</span>o you want <span class="cap">E</span>lder <span class="cap">B</span>rother <span class="cap">W</span>u to make up<br />the difference for you? <span id="input"></span><span id="cursor">_</span>'
            state.allow = [1, 1080, 'Y', 'N']
            fnKeyInput()
            break
          }
        }
      case 1080:
        if (line == 1080) {
          if (input[2] == 'Y') {
            state.DW -= state.CA
            state.LI = 1
            elements['message'].innerHTML =
              comp$ +
              '<span class="cap">E</span>lder <span class="cap">B</span>rother has given <span class="cap">L</span>i <span class="cap">Y</span>uen the <br />difference between what he wanted and<br />your cash on hand and added the same<br />amount to your debt.'
            elements['DW'].innerHTML = fnFC(state.DW)
          } else {
            elements['message'].innerHTML =
              comp$ +
              '<span class="cap">V</span>ery well. <span class="cap">E</span>lder <span class="cap">B</span>rother <span class="cap">W</span>u will not pay<br /><span class="cap">L</span>i <span class="cap">Y</span>uen the difference. <span class="cap">I</span> would be very<br />wary of pirates if <span class="cap">I</span> were you, ' +
              t$ +
              '.'
          }
          state.CA = 0
          elements['CA'].innerHTML = fnFC(state.CA)
          fnKeyInput()
          state.delay = 10
          state.goto = 1120
          break
        }
      case 1120:
        if (state.LO == 1 && state.DM > 0) {
          elements['message'].innerHTML =
            comp$ +
            t$ +
            ', <span class="cap">M</span>c <span class="cap">H</span>enry from the <span class="cap">H</span>ong <span class="cap">K</span>ong<br /><span class="cap">S</span>hipyards has arrived! <span class="cap">H</span>e says, \'I see<br />ye\'ve a wee bit of damage to yer ship.<br /><span class="cap">W</span>ill ye be wanting repairs?\' <span id="input"></span><span id="cursor">_</span>'
          state.allow = [1, 1130, 'Y', 'N']
          fnKeyInput()
          break
        } else {
          state.goto = 1210
          state.delay = 0
          break
        }
      case 1130:
        if (input[2] == 'N') {
          state.goto = 1210
          state.delay = 0
          break
        }
      case 1140:
        state.BR = Mf(((fR((60 * (state.TI + 3)) / 4) + (25 * (state.TI + 3)) / 4) * state.SC) / 50)
      case 1145:
        elements['message'].innerHTML =
          comp$ +
          '<span class="cap">O</span>ch, \'tis a pity to be ' +
          Mf((state.DM / state.SC) * 100) +
          '% damaged.<br /><span class="cap">W</span>e can fix yer whole ship for ' +
          fnFC(state.BR) +
          '<br />or make partial repairs if you wish.<br /><span class="cap">H</span>ow much will ye spend? <span id="input"></span><span id="cursor">_</span>'
        state.allow = [9, 1150, 'A', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9']
        fnKeyInput()
        break
      case 1150:
        if (input[2] == 'A') {
          amount = state.BR
          if (state.CA < amount) amount = state.CA
        } else amount = +input[2]
        if (state.CA < amount) {
          elements['message'].innerHTML = comp$ + t$ + ', you do not have enough cash!!'
          fnKeyInput()
          cursor[0] = null
          state.delay = 6
          state.goto = 1145
          break
        }
        state.WW = Mf((state.DM * amount) / state.BR)
        state.DM = state.WW <= state.DM ? state.DM - state.WW : 0
        state.CA -= amount
        fRP()
      case 1210:
      case 1300:
        if (state.LO == 1) {
          elements['message'].innerHTML =
            comp$ +
            '<span class="cap">D</span>o you have business with <span class="cap">E</span>lder <span class="cap">B</span>rother<br /><span class="cap">W</span>u, the moneylender? <span id="input"></span><span id="cursor">_</span>'
          state.allow = [1, 1310, 'Y', 'N']
          fnKeyInput()
          break
        } else {
          state.goto = 1500
          state.delay = 0
          break
        }
      case 1310:
        if (input[2] == 'N') {
          state.goto = 1500
          state.delay = 0
          break
        }
      case 1360:
        if (state.DW == 0 || state.CA == 0) {
          state.goto = 1400
          state.delay = 0
          break
        }
      case 1370:
        elements['message'].innerHTML =
          comp$ +
          '<span class="cap">H</span>ow much do you wish to repay<br />him? <span id="input"></span><span id="cursor">_</span>'
        state.allow = [9, 1380, 'A', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9']
        fnKeyInput()
        break
      case 1380:
        amount = input[2] == 'A' ? state.CA : +input[2]
        if (state.CA >= amount) {
          state.CA -= amount
          state.DW -= amount
          fRP()
        } else {
          elements['message'].innerHTML +=
            '<br /><br /><br />' + t$ + ', you have only ' + fnFC(state.CA) + '<br />in cash.'
          fnKeyInput()
          state.goto = 1370
          state.delay = 10
          break
        }
      case 1400:
        elements['message'].innerHTML =
          comp$ +
          '<span class="cap">H</span>ow much do you wish to<br />borrow? <span id="input"></span><span id="cursor">_</span>'
        state.allow = [9, 1420, '0', '1', '2', '3', '4', '5', '6', '7', '8', '9']
        fnKeyInput()
        break
      case 1420:
        i = +input[2]
        if (state.CA * 2 >= i) {
          state.CA += i
          state.DW += i
          fRP()
        } else {
          elements['message'].innerHTML +=
            '<br /><br /><br /><span class="cap">H</span>e won\'t loan you so much, ' + t$ + '!'
          state.goto = 1400
          state.delay = 10
          break
        }
      case 1500:
        state.SP =
          Mf(1000 + fR((1000 * (state.TI + 5)) / 6)) *
          (Mf(state.SC / 50) * (state.DM > 0 ? 1 : 0) + 1)
        if (state.CA >= state.SP && fR(4) == 0) {
          state.goto = 'NEWSHIP1'
          state.delay = 0
          break
        }
      case 'R-NEWSHIP':
        state.SP = Mf(fR((1000 * (state.TI + 5)) / 6) + 500)
        if (state.CA >= state.SP && fR(3) == 0) {
          state.goto = 'NEWGUN1'
          state.delay = 0
          break
        }
      case 'R-NEWGUN':
        if (state.ST[1][0] > 0 && Number(state.LO) > 1 && fR(18) == 0) {
          i = Mf(state.CA / 1.8)
          state.MW += state.ST[1][0]
          elements['MW'].innerHTML = String(state.MW)
          state.ST[1][0] = 0
          elements['h0'].innerHTML = '0'
          state.CA -= i
          elements['CA'].innerHTML = fnFC(state.CA)
          elements['message'].innerHTML =
            comp$ +
            'Bad Joss!!<br />The local authorities have seized your<br /><span class="cap">O</span>pium cargo and have also fined you<br />' +
            fnFC(i) +
            ', ' +
            t$ +
            '!'
          fnKeyInput()
          state.delay = 18
          state.goto = 'R-BUSTED'
          break
        }
      case 'R-BUSTED':
      case 2100:
        for (i = 0; i < 4; i++) state.CP[i] = Mf((portPrice(i) / 2) * (fR(3) + 1) * Mp(10, 3 - i))
        state.LI = Mm(state.LI, fR(20))
        if (state.LI == 0 && Number(state.LO) > 1 && fR(4)) {
          elements['message'].innerHTML =
            comp$ +
            '<span class="cap">L</span>i <span class="cap">Y</span>uen has sent a lieutenant,<br />' +
            t$ +
            '. <span class="cap">H</span>e says his admiral wishes<br />to see you in <span class="cap">H</span>ong <span class="cap">K</span>ong, posthaste!'
          fnKeyInput()
          state.delay = 10
          state.goto = 2410
          break
        }
      case 2410:
        if (fR(9) == 0) {
          state.goto = 'PRICE'
          state.delay = 0
          break
        }
      case 'R-PRICE':
        if (state.CA > 25000 && fR(20) == 0) {
          state.goto = 'ROBBED'
          state.delay = 0
          break
        }
      case 'R-ROBBED':
      case 'PORT2': {
        if (state.LO == 1 && state.CA + state.BA >= 1e6) {
          state.mesid = 0
          state.allow = [1, 'PORT3', 'B', 'S', 'V', 'T', 'R', 'Q']
        } else if (state.LO == 1) {
          state.mesid = 1
          state.allow = [1, 'PORT3', 'B', 'S', 'V', 'T', 'Q']
        } else {
          state.mesid = 2
          state.allow = [1, 'PORT3', 'B', 'S', 'Q']
        }
        state.prices =
          comp$ +
          t$ +
          ', present prices per unit here are:<br/>' +
          '<table><tr><td class="c10">&nbsp;</td><td class="c40">' +
          state.BP[0][0] +
          ': ' +
          state.CP[0] +
          '</td><td class="c40">' +
          state.BP[1][0] +
          ': ' +
          state.CP[1] +
          '</td><td class="c10">&nbsp;</td></tr>' +
          '<tr><td class="c10">&nbsp;</td><td class="c40">' +
          state.BP[2][0] +
          ': ' +
          state.CP[2] +
          '</td><td class="c40"><span class="cap">G</span>eneral: ' +
          state.CP[3] +
          '</td><td class="c10">&nbsp;</td></tr></table><br/>'
        elements['message'].innerHTML =
          state.prices + shallI[state.mesid] + ' <span id="input"></span><span id="cursor">_</span>'
        fnKeyInput()
        break
      }
      case 'PORT3':
        if (input[2] == 'B') state.goto = 'B1'
        else if (input[2] == 'S') state.goto = 'S1'
        else if (input[2] == 'V') state.goto = 'V1'
        else if (input[2] == 'T') state.goto = 2620
        else if (input[2] == 'Q' && state.MW < 0) state.goto = 'OVERLOAD'
        else if (input[2] == 'Q') state.goto = 'Q1'
        else if (input[2] == 'R') state.goto = 2695
        else state.goto = 'NOTYET'
        state.delay = 0
        break
      case 'NEWSHIP1':
        state.allow = [1, 'NEWSHIP2', 'Y', 'N']
        elements['message'].innerHTML =
          comp$ +
          '<span class="cap">D</span>o you wish to trade in your ' +
          (state.DM > 0 ? '<span class="inverse">damaged</span>' : 'fine') +
          '<br/>ship for one with 50 more capacity by<br/>paying an additional ' +
          fnFC(state.SP) +
          ', ' +
          t$ +
          '? <span id="input"></span><span id="cursor">_</span>'
        fnKeyInput()
        break
      case 'NEWSHIP2':
        if (input[2] == 'Y') {
          state.CA -= state.SP
          state.MW += 50
          state.SC += 50
          state.DM = 0
          fRP()
        }
        state.goto = 'R-NEWSHIP'
        state.delay = 2
        break
      case 'NEWGUN1':
        state.allow = [1, 'NEWGUN2', 'Y', 'N']
        elements['message'].innerHTML =
          comp$ +
          '<span class="cap">D</span>o you wish to buy a ship\'s gun<br/>for ' +
          fnFC(state.SP) +
          ', ' +
          t$ +
          '? <span id="input"></span><span id="cursor">_</span>'
        fnKeyInput()
        break
      case 'NEWGUN2':
        if (input[2] == 'Y' && state.MW >= 10) {
          state.CA -= state.SP
          state.GN += 1
          state.MW -= 10
          fRP()
          state.delay = 2
          state.goto = 'R-NEWGUN'
        } else if (input[2] == 'Y') {
          elements['message'].innerHTML +=
            '<br/><br/><span class="cap">Y</span>our ship would be overburdened, ' + t$ + '!'
          fnKeyInput()
          cursor[0] = null
          state.delay = 10
          state.goto = 'R-NEWGUN'
        } else {
          state.delay = 2
          state.goto = 'R-NEWGUN'
        }
        break
      case 'PRICE':
        i = fR(4)
        if (fR(2) == 0) {
          state.CP[i] = Mf(state.CP[i] / 5)
          elements['message'].innerHTML =
            comp$ +
            t$ +
            '!!&nbsp; The price of ' +
            state.BP[i][0] +
            ' has dropped to ' +
            state.CP[i] +
            '!!'
        } else {
          state.CP[i] *= fR(5) + 5
          elements['message'].innerHTML =
            comp$ +
            t$ +
            '!!&nbsp; The price of ' +
            state.BP[i][0] +
            ' has risen to ' +
            state.CP[i] +
            '!!'
        }
        fnKeyInput()
        state.delay = 10
        state.goto = 'R-PRICE'
        break
      case 'ROBBED':
        i = Mf(state.CA / 1.4)
        elements['message'].innerHTML =
          comp$ + "You've been beaten up and robbed of " + fnFC(i) + ' in cash, ' + t$ + '!!'
        state.CA -= i
        elements['CA'].innerHTML = fnFC(state.CA)
        fnKeyInput()
        state.delay = 18
        state.goto = 'R-ROBBED'
        break
      case 'B1':
        state.allow = [1, 'B2', 'O', 'S', 'A', 'G']
        elements['message'].innerHTML =
          state.prices +
          '<span class="cap">W</span>hat do you wish me to buy, ' +
          t$ +
          '? <span id="input"></span><span id="cursor">_</span>'
        fnKeyInput()
        break
      case 'B2':
        state.allow = [6, 'B3', 'A', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9']
        if (input[2] == 'O') state.item = 0
        else if (input[2] == 'S') state.item = 1
        else if (input[2] == 'A') state.item = 2
        else state.item = 3
        state.afford = Mf(state.CA / state.CP[state.item])
      case 'B2a':
        elements['message'].innerHTML =
          state.prices +
          '<span class="cap">H</span>ow much ' +
          state.BP[state.item][0] +
          ' shall<br/><span class="cap">I</span> buy, ' +
          t$ +
          '? <span id="input"></span><span id="cursor">_</span>' +
          '<span class="afford">You can<br/>afford<br/>' +
          state.afford +
          '</span>'
        fnKeyInput()
        break
      case 'B3':
        amount = input[2] == 'A' ? state.afford : +input[2]
        if (amount <= state.afford) {
          state.MW -= amount
          elements['MW'].innerHTML = state.MW >= 0 ? String(state.MW) : overload$
          state.CA -= state.CP[state.item] * amount
          elements['CA'].innerHTML = fnFC(state.CA)
          state.ST[1][state.item] += amount
          elements['h' + state.item].innerHTML = String(state.ST[1][state.item])
          state.goto = 'PORT2'
        } else state.goto = 'B2a'
        state.delay = 0
        break
      case 'S1':
        state.allow = [1, 'S2', 'O', 'S', 'A', 'G']
        elements['message'].innerHTML =
          state.prices +
          '<span class="cap">W</span>hat do you wish me to sell, ' +
          t$ +
          '? <span id="input"></span><span id="cursor">_</span>'
        fnKeyInput()
        break
      case 'S2':
        state.allow = [6, 'S3', 'A', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9']
        if (input[2] == 'O') state.item = 0
        else if (input[2] == 'S') state.item = 1
        else if (input[2] == 'A') state.item = 2
        else state.item = 3
      case 'S2a':
        elements['message'].innerHTML =
          state.prices +
          '<span class="cap">H</span>ow much ' +
          state.BP[state.item][0] +
          ' shall<br/><span class="cap">I</span> sell, ' +
          t$ +
          '? <span id="input"></span><span id="cursor">_</span>'
        fnKeyInput()
        break
      case 'S3':
        amount = input[2] == 'A' ? state.ST[1][state.item] : +input[2]
        if (amount <= state.ST[1][state.item]) {
          state.MW += amount
          elements['MW'].innerHTML = state.MW >= 0 ? String(state.MW) : overload$
          state.CA += state.CP[state.item] * amount
          elements['CA'].innerHTML = fnFC(state.CA)
          state.ST[1][state.item] -= amount
          elements['h' + state.item].innerHTML = String(state.ST[1][state.item])
          state.goto = 'PORT2'
        } else state.goto = 'S2a'
        state.delay = 0
        break
      case 'OVERLOAD':
        elements['message'].innerHTML =
          comp$ + '<span class="cap">Y</span>our ship is overloaded, ' + t$ + '!!'
        state.delay = 16
        state.goto = 'PORT2'
        fnKeyInput()
        break
      case 'V1':
        state.allow = [9, 'V2', 'A', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9']
        elements['message'].innerHTML =
          comp$ +
          '<span class="cap">H</span>ow much will you deposit? <span id="input"></span><span id="cursor">_</span>'
        fnKeyInput()
        break
      case 'V2':
        amount = input[2] == 'A' ? state.CA : +input[2]
        if (amount > state.CA) {
          elements['message'].innerHTML +=
            '<br/><br/>' + t$ + ', you have only ' + fnFC(state.CA) + '<br/>in cash.'
          state.delay = 24
          state.goto = 'V1'
          fnKeyInput()
          cursor[0] = null
          break
        } else {
          state.CA -= amount
          state.BA += amount
          fRP()
        }
      case 'V3':
        state.allow = [9, 'V4', 'A', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9']
        elements['message'].innerHTML =
          comp$ +
          '<span class="cap">H</span>ow much will you withdraw? <span id="input"></span><span id="cursor">_</span>'
        fnKeyInput()
        break
      case 'V4':
        amount = input[2] == 'A' ? state.BA : +input[2]
        if (amount > state.BA) {
          elements['message'].innerHTML +=
            '<br/><br/>' + t$ + ', you have only ' + fnFC(state.BA) + '<br/>in the bank.'
          state.delay = 24
          state.goto = 'V3'
          fnKeyInput()
          cursor[0] = null
          break
        } else {
          state.BA -= amount
          state.CA += amount
          fRP()
        }
        state.goto = 'PORT2'
        state.delay = 0
        break
      case 2620:
      case 2622:
        W = 0
        for (state.wh1 = 0; state.wh1 < 2; state.wh1++) {
          for (state.wh2 = 0; state.wh2 < 4; state.wh2++) W += state.ST[state.wh1][state.wh2]
        }
        if (W == 0) {
          elements['message'].innerHTML =
            state.prices + '<span class="cap">Y</span>ou have no cargo, ' + t$ + '.'
          state.delay = 12
          state.goto = 'PORT2'
          fnKeyInput()
          break
        }
        state.wh1 = 2
        state.wh2 = 0
      case 2624:
        do {
          state.wh1--
          if (state.wh1 < 0) {
            if (state.wh2 < 3) {
              state.wh1 = 1
              state.wh2++
            } else {
              state.goto = 'PORT2'
              state.delay = 0
              touch()
              return
            }
          }
        } while (state.ST[state.wh1][state.wh2] == 0)
      case 2626:
        elements['message'].innerHTML =
          comp$ +
          '<span class="cap">H</span>ow much ' +
          state.BP[state.wh2][0] +
          ' shall <span class="cap">I</span> move<br />' +
          (state.wh1 == 0 ? 'aboard ship' : 'to the warehouse') +
          ', ' +
          t$ +
          '? <span id="input"></span><span id="cursor">_</span>'
        state.allow = [5, 2628, 'A', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9']
        fnKeyInput()
        break
      case 2628:
        amount = input[2] == 'A' ? state.ST[state.wh1][state.wh2] : +input[2]
        if (state.wh1 == 1 && amount > 0 && state.WC == 0) {
          elements['message'].innerHTML += '<br/><br/>Your warehouse is full, ' + t$ + '!'
          state.delay = 10
          state.goto = 2626
          fnKeyInput()
          cursor[0] = null
          break
        }
        if (state.wh1 == 1 && amount > state.WC) {
          elements['message'].innerHTML +=
            '<br/><br/>Your warehouse will only hold an<br />additional ' +
            fnFC(state.WC) +
            ', ' +
            t$ +
            '!'
          state.delay = 10
          state.goto = 2626
          fnKeyInput()
          cursor[0] = null
          break
        }
        if (amount > state.ST[state.wh1][state.wh2]) {
          elements['message'].innerHTML +=
            '<br/><br/>You have only ' + fnFC(state.ST[state.wh1][state.wh2]) + ', ' + t$ + '.'
          state.delay = 10
          state.goto = 2626
          fnKeyInput()
          cursor[0] = null
          break
        }
        state.ST[state.wh1][state.wh2] -= amount
        if (state.wh1 == 0) {
          state.ST[1][state.wh2] += amount
          state.WS -= amount
          state.WC += amount
          state.MW -= amount
        } else {
          state.ST[0][state.wh2] += amount
          state.WS += amount
          state.WC -= amount
          state.MW += amount
        }
        elements['w' + state.wh2].innerHTML = fnFC(state.ST[0][state.wh2])
        elements['h' + state.wh2].innerHTML = fnFC(state.ST[1][state.wh2])
        elements['WS'].innerHTML = fnFC(state.WS)
        elements['WC'].innerHTML = fnFC(state.WC)
        elements['MW'].innerHTML = state.MW >= 0 ? String(state.MW) : overload$
        state.goto = 2624
        state.delay = 0
        break
      case 2695:
        elements['message'].innerHTML =
          '<br /><div class="millionaire"><span class="cap">Y</span> o&nbsp;u &nbsp;\' &nbsp;r &nbsp;e &nbsp; &nbsp;a<br /><br /><span class="cap">M &nbsp; I &nbsp; L &nbsp; L &nbsp; I &nbsp; O &nbsp; N &nbsp; A &nbsp; I &nbsp; R &nbsp; E &nbsp; !</span></div>'
        fnKeyInput()
        state.delay = 18
        state.goto = 20000
        break
      case 'NOTYET':
        elements['message'].innerHTML = comp$ + t$ + ", that command hasn't yet been implemented!"
        state.delay = 6
        state.goto = 'PORT2'
        fnKeyInput()
        break
      case 'Q1':
        state.allow = [1, 'Q2', '1', '2', '3', '4', '5', '6', '7']
        elements['message'].innerHTML =
          comp$ +
          t$ +
          ', do you wish to go to:<br/><br/>' +
          '1) ' +
          cities[1] +
          ', 2) ' +
          cities[2] +
          ', 3) ' +
          cities[3] +
          ',<br/>' +
          '4) ' +
          cities[4] +
          ', 5) ' +
          cities[5] +
          ', 6) ' +
          cities[6] +
          ', or<br/>' +
          '7) ' +
          cities[7] +
          ' ? <span id="input"></span><span id="cursor">_</span>'
        fnKeyInput()
        break
      case 'Q2':
        if (input[2] == state.LO) {
          elements['message'].innerHTML +=
            '<br/><span class="cap">Y</span>ou\'re already here, ' + t$ + '.'
          fnKeyInput()
          cursor[0] = null
          state.delay = 16
          state.goto = 'Q1'
          break
        }
      case 3030:
        elements['location'].innerHTML = cities[0]
        state.LO = input[2]
        elements['message'].innerHTML = capt$
        fnKeyInput()
        state.delay = 2
        state.goto = 3100
        break
      case 3100:
        if (fR(state.FQ) == 0) {
          state.SN = fR(state.SC / 10 + state.GN) + 1
          state.F1 = 1
          elements['message'].innerHTML =
            capt$ +
            state.SN +
            ' hostile ship' +
            (state.SN > 1 ? 's' : '') +
            ' approaching, ' +
            t$ +
            '!!'
          fnKeyInput()
          state.delay = 10
          state.goto = 5000
          break
        }
        if (fR(4 + 8 * state.LI) == 0) {
          elements['message'].innerHTML =
            capt$ +
            '<span class="cap">L</span>i <span class="cap">Y</span>uen\'s pirates, ' +
            t$ +
            '!!'
          fnKeyInput()
          state.delay = 4
          state.goto = 3230
          break
        }
        state.goto = 3300
        state.delay = 0
        break
      case 3230:
        if (state.LI > 0) {
          elements['message'].innerHTML +=
            '<br /><br /><span class="cap">G</span>ood joss!! <span class="cap">T</span>hey let us be!!'
          fnKeyInput()
          state.delay = 6
          state.goto = 3300
          break
        } else {
          state.SN = fR(state.SC / 5 + state.GN) + 5
          state.F1 = 2
          elements['message'].innerHTML +=
            '<br /><br />' +
            state.SN +
            ' ship' +
            (state.SN > 1 ? 's' : '') +
            ' of <span class="cap">L</span>i <span class="cap">Y</span>uen\'s pirate<br />fleet, ' +
            t$ +
            '!!'
          fnKeyInput()
          state.delay = 6
          state.goto = 5000
          break
        }
      case 3300:
        if (fR(10) == 0) {
          elements['message'].innerHTML =
            capt$ + '<span class="cap">S</span>' + 'torm, ' + t$ + '!!'
          fnKeyInput()
          state.delay = 4
          state.goto = 3320
          break
        } else {
          fnKeyInput()
          state.delay = 0
          state.goto = 'ARR1'
          break
        }
      case 3320:
        if (fR(30) == 0) {
          elements['message'].innerHTML +=
            '<br /><br />&nbsp; &nbsp;<span class="cap">I</span> think we\'re going down!!'
          fnKeyInput()
          state.delay = 4
          state.goto = 'STORM'
          break
        } else {
          fnKeyInput()
          state.delay = 0
          state.goto = 3330
          break
        }
      case 'STORM':
        if (fR((state.DM / state.SC) * 3) == 0) {
          elements['message'].innerHTML +=
            '<br /><br /><span class="cap">W</span>' + "e're going down, " + t$ + '!!'
          fnKeyInput()
          state.delay = 4
          state.goto = 20000
          break
        }
      case 3330:
        elements['message'].innerHTML +=
          '<br /><br />&nbsp; &nbsp; <span class="cap">W</span>e made it!!'
        fnKeyInput()
        state.delay = 4
        state.goto = 3340
        break
      case 3340:
        if (fR(3) == 0) {
          state.D = Number(state.LO)
          while (Number(state.LO) == state.D) state.LO = fR(7) + 1
          elements['message'].innerHTML =
            capt$ + "We've been blown off course<br />to " + cities[state.LO as number]
          fnKeyInput()
          state.delay = 4
          state.goto = 'ARR1'
          break
        }
      case 'ARR1':
        elements['message'].innerHTML =
          capt$ + '<span class="cap">A</span>rriving at ' + cities[state.LO as number]
        fnKeyInput()
        state.delay = 8
        state.goto = 'ARR2'
        break
      case 'ARR2':
        elements['message'].innerHTML = comp$
        elements['location'].innerHTML = cities[state.LO as number]
        fnKeyInput()
        state.delay = 4
        state.goto = 1000
        break
      case 5000:
        state.LC = 0
        state.OK = 3
        state.IK = 1
        state.S0 = state.SN
        state.BT = fR((state.TI / 4) * 1000 * Mp(state.SN, 1.05)) + fR(1000) + 250
        state.SS = 0
        for (i = 0; i < 10; i++) state.AM[i][0] = 0
        elements['SN'].innerHTML = String(state.SN)
        elements['GNs'].innerHTML = String(state.GN)
        elements['S4'].style.display = 'none'
        elements['S5'].style.display = 'block'
        elements['f2'].innerHTML =
          '<span class="cap">Y</span>our orders are to: <span id="input"></span><span id="cursor">_</span>'
      case 5060:
        state.WW = 100 - Mf((state.DM / state.SC) * 100)
        elements['f4'].innerHTML =
          '<span class="cap">C</span>urrent seaworthiness: &nbsp;' +
          sstatus[Mf(state.WW / 20)] +
          ' (' +
          state.WW +
          '%)'
      case 5100:
        fnAddShips()
        state.allow = false
        state.get = [1, 5160, 'F', 'R']
        state.delay = state.LC == 0 ? 12 : 4
        state.goto = 5190
        fnKeyInput()
        break
      case 5160:
        state.LC = input[2]
        if (state.LC == 'F') state.CMD = '<span class="cap">F</span>ight'
        else if (state.LC == 'R') state.CMD = '<span class="cap">R</span>un'
        else state.CMD = '<span class="cap">T</span>hrow cargo'
        elements['f2'].innerHTML = '<span class="cap">Y</span>our orders are to: ' + state.CMD
      case 5190:
        if (state.LC == 'R') state.goto = 5200
        else if (state.LC == 'F') state.goto = 5300
        else if (state.LC == 'T') state.goto = 5400
        else elements['f4'].innerHTML = t$ + ', what shall we do?? (Fight, Run)'
        state.delay = 0
        break
      case 5200:
        state.get = false
        elements['f4'].innerHTML = '<span class="cap">A</span>ye, we\'ll run, ' + t$ + '!'
        fnKeyInput()
        state.delay = 4
        state.goto = 5210
        break
      case 5210:
        state.OK += state.IK++
        if (fR(state.OK) > fR(state.SN)) {
          state.OK = 3
          elements['f4'].innerHTML = '<span class="cap">W</span>e got away from \'em, ' + t$ + '!!'
          fnKeyInput()
          state.delay = 4
          state.goto = 5900
          break
        }
      case 5220:
        elements['f4'].innerHTML = '<span class="cap">C</span>an\'t lose \'em!!'
        fnKeyInput()
        state.delay = 4
        state.goto = 5230
        break
      case 5230:
        if (state.SN > 2 && fR(5) == 0) {
          W = Mf(fR(state.SN / 2) + 1)
          state.SN -= W
          elements['SN'].innerHTML = String(state.SN)
          if (state.SS > state.SN) fnRemoveShips()
          elements['f4'].innerHTML =
            '<span class="cap">B</span>ut we escaped from ' + W + " of 'em, " + t$ + '!'
          fnKeyInput()
          state.delay = 4
          state.goto = 5500
          break
        } else {
          state.delay = 0
          state.goto = 5500
          break
        }
      case 5300:
        state.get = false
        if (state.GN == 0) {
          elements['f4'].innerHTML = '<span class="cap">W</span>e have no guns, ' + t$ + '!!'
          fnKeyInput()
          state.delay = 4
          state.goto = 5500
          break
        }
        state.CG = 0
        elements['f4'].innerHTML = '<span class="cap">A</span>ye, we\'ll fight \'em, ' + t$ + '!'
        fnKeyInput()
        state.delay = 4
        state.goto = 5310
        break
      case 5310:
        state.SK = 0
        elements['f4'].innerHTML = '<span class="cap">W</span>e\'re firing on \'em, ' + t$ + '!'
      case 5320:
        if (state.SS == 0) fnAddShips()
        if (state.SN > 0 && ++state.CG <= state.GN) {
          do shot = fR(10)
          while (state.AM[shot][0] == 0)
        } else {
          fnKeyInput()
          state.delay = 0
          state.goto = 5340
          break
        }
        fnFire(shot, 'visible')
        later(() => fnFire(shot, 'hidden'), 75)
        later(() => fnFire(shot, 'visible'), 150)
        later(() => fnFire(shot, 'hidden'), 225)
        later(() => fnFire(shot, 'visible'), 300)
        later(() => fnFire(shot, 'hidden'), 375)
        {
          const img = document.createElement('img')
          img.className = 'dmg'
          img.src = damageGifs[fR(11)]
          const hull = elements['sf' + shot].childNodes[0] as HTMLElement
          hull.appendChild(img)
        }
        state.AM[shot][1] += fR(30) + 10
        if (state.AM[shot][1] > state.AM[shot][0]) {
          state.AM[shot][0] = 0
          state.AM[shot][1] = 0
          state.SN--
          state.SS--
          state.SK++
          fnSink(shot, 0, fR(20) == 0 ? 40 : 20)
          break
        }
        fnKeyInput()
        state.delay = 2
        state.goto = 5320
        break
      case 5340:
        if (state.SK)
          elements['f4'].innerHTML =
            '<span class="cap">S</span>unk ' + state.SK + ' of the buggers, ' + t$ + '!'
        else
          elements['f4'].innerHTML =
            "<span class=\"cap\">H</span>it 'em, but didn't sink 'em, " + t$ + '!'
        fnKeyInput()
        state.delay = 4
        state.goto = 5360
        break
      case 5360:
        if (
          fR(state.S0) < (state.SN * 0.6) / state.F1 ||
          state.SN == 0 ||
          state.SN == state.S0 ||
          state.SN < 3
        ) {
          fnKeyInput()
          state.delay = 0
          state.goto = 5500
          break
        }
        W = Mf(fR(state.SN / 3 / state.F1) + 1)
        state.SN -= W
        elements['SN'].innerHTML = String(state.SN)
        if (state.SS > state.SN) fnRemoveShips()
        elements['f4'].innerHTML = W + ' ran away, ' + t$ + '!'
        fnKeyInput()
        state.delay = 4
        state.goto = 5500
        break
      case 5400:
        state.get = false
      case 5500:
        if (state.SN == 0) {
          state.OK = 1
          elements['f4'].innerHTML = '<span class="cap">W</span>e got \'em all, ' + t$ + '!!'
          fnKeyInput()
          state.delay = 4
          state.goto = 5900
          break
        }
        elements['f4'].innerHTML = '<span class="cap">T</span>hey\'re firing on us, ' + t$ + '!'
        fnEnemyFire('visible')
        later(() => fnEnemyFire('hidden'), 75)
        later(() => fnEnemyFire('visible'), 150)
        later(() => fnEnemyFire('hidden'), 225)
        later(() => fnEnemyFire('visible'), 300)
        later(() => fnEnemyFire('hidden'), 375)
        later(() => fnEnemyFire('visible'), 450)
        later(() => fnEnemyFire('hidden'), 525)
        fnKeyInput()
        state.delay = 4
        state.goto = 5510
        break
      case 5510:
        elements['f4'].innerHTML = '<span class="cap">W</span>e\'ve been hit, ' + t$ + '!!'
        fnKeyInput()
        state.delay = 4
        state.goto = 5540
        break
      case 5540:
        state.DQ = state.SN > 15 ? 15 : state.SN
        if (
          state.GN > 0 &&
          (fR(100) < (state.DM / state.SC) * 100 || (state.DM / state.SC) * 100 > 80)
        ) {
          state.DQ = 1
          state.GN--
          state.MW += 10
          elements['GNs'].innerHTML = String(state.GN)
          elements['f4'].innerHTML = '<span class="cap">T</span>he buggers hit a gun, ' + t$ + '!!'
          fnKeyInput()
          state.delay = 4
          state.goto = 5550
          break
        }
      case 5550:
        state.DM += fR(state.ED * state.DQ * state.F1) + state.DQ / 2
        if (state.DM > state.SC) {
          fnKeyInput()
          state.delay = 0
          state.goto = 20000
          break
        }
        fnKeyInput()
        state.delay = 0
        state.goto = 5060
        break
      case 5800:
        elements['SN'].innerHTML = String(state.SN)
        state.delay = 2
        state.goto = 5320
        break
      case 5900:
        if (state.LC == 'F') {
          state.CA += state.BT
          elements['message'].innerHTML =
            '<br /><br /><span class="cap">W</span>e\'ve captured some booty.<br />It\'s worth ' +
            fnFC(state.BT) +
            '!'
        } else
          elements['message'].innerHTML =
            '<br /><br /><span class="cap">W</span>e made it, ' + t$ + '!'
        fRP()
        elements['S5'].style.display = 'none'
        elements['S4'].style.display = 'block'
        state.get = false
        fnKeyInput()
        state.delay = 10
        state.goto = 3300
        break
      case 10000:
      case 10120:
        elements['S2b'].innerHTML = '<span id="input"></span><span id="cursor">_</span>'
        state.fname = 22
        fnKeyInput()
        break
      case 10130:
        if (input[2] == '') {
          state.delay = 0
          state.goto = 10120
          break
        }
        elements['H'].innerHTML = input[2]
        state.firmName = input[2]
        elements['S2'].style.display = 'none'
        elements['S2b'].innerHTML = ''
        elements['S3'].style.display = 'block'
      case 10140:
        elements['S3b'].innerHTML = '<span id="input"></span><span id="cursor">_</span>'
        state.allow = [1, 10150, '1', '2']
        fnKeyInput()
        break
      case 10150:
        if (input[2] == '1') {
          state.DW = 5000
          state.CA = 400
          state.MW = 60
          state.GN = 0
          state.FQ = 10
        } else {
          state.DW = 0
          state.CA = 0
          state.MW = 10
          state.GN = 5
          state.FQ = 7
        }
        state.goto = 1030
        elements['S3'].style.display = 'none'
        elements['S3b'].innerHTML = ''
        elements['S4'].style.display = 'block'
        break
      case 20000:
        state.WW = state.CA + state.BA - state.DW
        elements['CAf'].innerHTML = fnFC(state.WW)
        elements['SCf'].innerHTML = String(state.SC)
        elements['GNf'].innerHTML = String(state.GN)
        state.YEARSf = Mf(state.TI / 12)
        elements['YEARSf'].innerHTML = state.YEARSf + ' year'
        if (state.YEARSf != 1) elements['YEARSf'].innerHTML += 's'
        state.MONTHSf = state.TI - state.YEARSf * 12
        elements['MONTHSf'].innerHTML = state.MONTHSf + ' month'
        if (state.MONTHSf != 1) elements['MONTHSf'].innerHTML += 's'
        state.WW = Mf((state.CA + state.BA - state.DW) / 100 / Mp(state.TI, 1.1))
        elements['SCOREf'].innerHTML = String(state.WW)
        if (state.WW < 500) elements['SCORE1f'].className = 'inverse'
        else if (state.WW < 1000) elements['SCORE2f'].className = 'inverse'
        else if (state.WW < 8000) elements['SCORE3f'].className = 'inverse'
        else if (state.WW < 50000) elements['SCORE4f'].className = 'inverse'
        else elements['SCORE5f'].className = 'inverse'
        elements['S4'].style.display = 'none'
        elements['S5'].style.display = 'none'
        elements['S6'].style.display = 'block'
        endGame = true
        break
    }
    touch(endGame)
  }
  /* eslint-enable no-fallthrough */

  input[0] = byId('input')
  input[1] = state.inputText.length
  input[2] = state.inputText
  if (resumed && input[0]) input[0].innerHTML = state.inputText
  cursor[0] = byId('cursor')

  document.addEventListener('keydown', onKeyDown)
  document.addEventListener('keypress', onKeyPress)
  root.addEventListener('click', focusHelper)
  window.addEventListener('beforeunload', onBeforeUnload)
  const intervalId = window.setInterval(fnTimer, 500)
  if (!resumed) fnMain(10000)

  return () => {
    window.clearInterval(intervalId)
    for (const id of pending) window.clearTimeout(id)
    pending.clear()
    document.removeEventListener('keydown', onKeyDown)
    document.removeEventListener('keypress', onKeyPress)
    root.removeEventListener('click', focusHelper)
    window.removeEventListener('beforeunload', onBeforeUnload)
  }
}
