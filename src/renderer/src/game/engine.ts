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

const damageGifs = [dm0, dm1, dm2, dm3, dm4, dm5, dm6, dm7, dm8, dm9, dm10]

const M = Math
const Mf = M.floor
const Ml = M.log
const Mm = M.min
const Mp = M.pow
const Mr = M.random

type Line = number | string
type Choice = [number, Line, ...string[]]
type Field = [HTMLElement | null, number, string]

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

export function startGame(root: HTMLElement): () => void {
  const pending = new Set<number>()
  const elements: Record<string, HTMLElement> = {}
  for (const id of IDS) {
    const el = root.querySelector('#' + id)
    if (!(el instanceof HTMLElement)) throw new Error('Missing #' + id)
    elements[id] = el
  }

  let delay = 0
  let goto: Line = ''
  let allow: Choice | false = false
  let get: Choice | false = false
  let input: Field = [null, 0, '']
  const cursor: [HTMLElement | null, boolean] = [null, true]
  let fname: number | false = false
  let prices = ''

  let MO = 0
  let YE = 1860
  let SC = 60
  let BA = 0
  let LO: number | string = 1
  let TI = 1
  let WC = 10000
  let WS = 0
  let EC = 20
  let ED = 0.5
  let F1 = 0
  let DM = 0
  let SP = 0
  let WW = 0
  let D = 0
  let DW = 0
  let CA = 0
  let MW = 0
  let GN = 0
  let FQ = 0
  const ST: number[][] = [
    [0, 0, 0, 0],
    [0, 0, 0, 0]
  ]
  const BP: (string | number)[][] = [
    ['<span class="cap">O</span>pium', 11, 16, 15, 14, 12, 10, 13],
    ['<span class="cap">S</span>ilk', 11, 14, 15, 16, 10, 13, 12],
    ['<span class="cap">A</span>rms', 12, 16, 10, 11, 13, 14, 15],
    ['<span class="cap">G</span>eneral <span class="cap">C</span>argo', 10, 11, 12, 13, 14, 15, 16]
  ]
  let LI = 0
  let LI$ = 0
  let SN = 0
  let S0 = 0
  let SS = 0
  let SK = 0
  let BT = 0
  let LC: number | string = 0
  let CMD = ''
  let OK = 0
  let IK = 0
  const AM: number[][] = [[], [], [], [], [], [], [], [], [], []]
  const CP: number[] = []
  let BR = 0
  let item = 0
  let afford = 0
  let wh1 = 0
  let wh2 = 0
  let CG = 0
  let DQ = 0
  let YEARSf = 0
  let MONTHSf = 0
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
  let mesid = 0
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

  function fnTimer(): void {
    if (cursor[0] != null) {
      cursor[1] = !cursor[1]
      cursor[0].style.visibility = cursor[1] == true ? 'visible' : 'hidden'
    }
    if (delay > 0) delay--
    if (goto != '' && delay == 0) fnMain(goto)
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
    const IK = Mp(10, II - 2)
    const scaled = (Mf(value / IK + 0.5) * IK) / Mp(10, IJ)
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
    return Number(BP[good][LO as number])
  }

  function fRP(): void {
    elements['MW'].innerHTML = String(MW)
    elements['GN'].innerHTML = String(GN)
    elements['CA'].innerHTML = fnFC(CA)
    elements['BA'].innerHTML = fnFC(BA)
    elements['DW'].innerHTML = fnFC(DW)
    WW = 100 - Mf((DM / SC) * 100)
    elements['DM'].innerHTML = sstatus[Mf(WW / 20)] + (WW < 100 ? ': ' : ':') + WW
  }

  function fnAddShips(): void {
    for (let i = 0; i < 10; i++) {
      if (SS < SN && AM[i][0] == 0) {
        AM[i][0] = fR(EC) + 20
        AM[i][1] = 0
        SS++
        elements['sf' + i].innerHTML = '<div class="ship"></div><div class="ff"></div>'
      } else if (AM[i][0] == 0) {
        elements['sf' + i].innerHTML = ''
      }
    }
    elements['plus'].innerHTML = SS < SN ? '+' : ''
  }

  function fnRemoveShips(): void {
    for (let i = 9; i >= 0; i--) {
      if (SS > SN && AM[i][0]) {
        AM[i][0] = 0
        AM[i][1] = 0
        SS--
        elements['sf' + i].innerHTML = ''
      }
    }
    if (SS <= SN) elements['plus'].innerHTML = ''
  }

  function fnFire(ship: number, vh: string): void {
    const fire = elements['sf' + ship].childNodes[1] as HTMLElement | undefined
    if (fire) fire.style.visibility = vh
  }

  function fnEnemyFire(vh: string): void {
    elements['ef'].style.visibility = vh
  }

  function fnSink(ship: number, px: number, sinkDelay: number): void {
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
      goto = 5800
    }
  }

  function onKeyPress(e: KeyboardEvent): void {
    const key = e.charCode || e.keyCode
    if (key == 8) e.preventDefault()
  }

  function onKeyDown(e: KeyboardEvent): void {
    delay = 0
    let key = e.charCode || e.keyCode
    if (key == 8) {
      e.preventDefault()
      if (input[1] > 0) {
        input[2] = input[2].substring(0, input[2].length - 1)
        input[1]--
        if (input[0]) input[0].innerHTML = input[2]
      }
    } else if (get) {
      if (key >= 96 && key <= 105) key -= 48
      const inchar = String.fromCharCode(key)
      for (let n = 2; n < get.length; n++) {
        if (inchar == get[n]) {
          input[2] = inchar
          input[1] = 1
          cursor[0] = null
          fnMain(get[1])
        }
      }
    } else if (key == 13 && allow && input[1] > 0) {
      cursor[0] = null
      fnMain(allow[1])
    } else if (allow) {
      if (key >= 96 && key <= 105) key -= 48
      const inchar = String.fromCharCode(key)
      for (let n = 2; n < allow.length; n++) {
        if (input[1] < allow[0] && inchar == allow[n]) {
          input[2] += inchar
          input[1]++
          if (input[0]) input[0].innerHTML = input[2]
        }
      }
    } else if (fname) {
      const limit = fname
      if (key == 13 && input[1] > 0) {
        fname = false
        fnMain(10130)
      }
      if (key < 32 || key > 120) return
      if (key >= 96 && key <= 105) key -= 48
      const inchar = String.fromCharCode(key)
      if (input[1] < limit) {
        input[2] += inchar
        input[1]++
        if (input[0]) input[0].innerHTML = input[2]
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
    goto = ''
    let amount: number
    let W: number
    let i: number
    let shot = 0
    switch (line) {
      case 1000:
        BA += Mf(BA * 0.005)
        DW += Mf(DW * 0.1)
        TI++
        MO++
        if (MO == 12) {
          MO = 0
          YE++
          EC += 10
          ED += 0.5
          for (i = 0; i < 4; i++) {
            for (let j = 1; j < 8; j++) BP[i][j] = (BP[i][j] as number) + fR(2)
          }
        }
      case 1030:
        fRP()
        elements['month0'].innerHTML = months[MO][0]
        elements['month1'].innerHTML = months[MO][1]
        elements['year'].innerHTML = String(YE)
        if (LO != 1) {
          goto = 1500
          delay = 0
          break
        }
        if (LI == 0 && CA > 0) {
          WW = 0
          W = 1.8
          if (TI > 12) {
            WW = fR(1000 * TI) + 1000 * TI
            W = 1
          }
          LI$ = fR(CA / W) + WW
          elements['message'].innerHTML =
            comp$ +
            '<span class="cap">L</span>i <span class="cap">Y</span>uen asks ' +
            fnFC(LI$) +
            ' in donation<br />to the temple of <span class="cap">T</span>in <span class="cap">H</span>au, the <span class="cap">S</span>ea<br /><span class="cap">G</span>oddess. <span class="cap">W</span>ill you pay? <span id="input"></span><span id="cursor">_</span>'
          allow = [1, 1060, 'Y', 'N']
          fnKeyInput()
          break
        }
      case 1060:
        if (line == 1060 && input[2] == 'Y') {
          CA -= LI$
          if (CA >= 0) {
            LI = 1
            elements['CA'].innerHTML = fnFC(CA)
          } else {
            elements['message'].innerHTML =
              comp$ +
              t$ +
              ', you do not have enough cash!!<br /><br /><span class="cap">D</span>o you want <span class="cap">E</span>lder <span class="cap">B</span>rother <span class="cap">W</span>u to make up<br />the difference for you? <span id="input"></span><span id="cursor">_</span>'
            allow = [1, 1080, 'Y', 'N']
            fnKeyInput()
            break
          }
        }
      case 1080:
        if (line == 1080) {
          if (input[2] == 'Y') {
            DW -= CA
            LI = 1
            elements['message'].innerHTML =
              comp$ +
              '<span class="cap">E</span>lder <span class="cap">B</span>rother has given <span class="cap">L</span>i <span class="cap">Y</span>uen the <br />difference between what he wanted and<br />your cash on hand and added the same<br />amount to your debt.'
            elements['DW'].innerHTML = fnFC(DW)
          } else {
            elements['message'].innerHTML =
              comp$ +
              '<span class="cap">V</span>ery well. <span class="cap">E</span>lder <span class="cap">B</span>rother <span class="cap">W</span>u will not pay<br /><span class="cap">L</span>i <span class="cap">Y</span>uen the difference. <span class="cap">I</span> would be very<br />wary of pirates if <span class="cap">I</span> were you, ' +
              t$ +
              '.'
          }
          CA = 0
          elements['CA'].innerHTML = fnFC(CA)
          fnKeyInput()
          delay = 10
          goto = 1120
          break
        }
      case 1120:
        if (LO == 1 && DM > 0) {
          elements['message'].innerHTML =
            comp$ +
            t$ +
            ', <span class="cap">M</span>c <span class="cap">H</span>enry from the <span class="cap">H</span>ong <span class="cap">K</span>ong<br /><span class="cap">S</span>hipyards has arrived! <span class="cap">H</span>e says, \'I see<br />ye\'ve a wee bit of damage to yer ship.<br /><span class="cap">W</span>ill ye be wanting repairs?\' <span id="input"></span><span id="cursor">_</span>'
          allow = [1, 1130, 'Y', 'N']
          fnKeyInput()
          break
        } else {
          goto = 1210
          delay = 0
          break
        }
      case 1130:
        if (input[2] == 'N') {
          goto = 1210
          delay = 0
          break
        }
      case 1140:
        BR = Mf(((fR((60 * (TI + 3)) / 4) + (25 * (TI + 3)) / 4) * SC) / 50)
      case 1145:
        elements['message'].innerHTML =
          comp$ +
          '<span class="cap">O</span>ch, \'tis a pity to be ' +
          Mf((DM / SC) * 100) +
          '% damaged.<br /><span class="cap">W</span>e can fix yer whole ship for ' +
          fnFC(BR) +
          '<br />or make partial repairs if you wish.<br /><span class="cap">H</span>ow much will ye spend? <span id="input"></span><span id="cursor">_</span>'
        allow = [9, 1150, 'A', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9']
        fnKeyInput()
        break
      case 1150:
        if (input[2] == 'A') {
          amount = BR
          if (CA < amount) amount = CA
        } else amount = +input[2]
        if (CA < amount) {
          elements['message'].innerHTML = comp$ + t$ + ', you do not have enough cash!!'
          fnKeyInput()
          cursor[0] = null
          delay = 6
          goto = 1145
          break
        }
        WW = Mf((DM * amount) / BR)
        DM = WW <= DM ? DM - WW : 0
        CA -= amount
        fRP()
      case 1210:
      case 1300:
        if (LO == 1) {
          elements['message'].innerHTML =
            comp$ +
            '<span class="cap">D</span>o you have business with <span class="cap">E</span>lder <span class="cap">B</span>rother<br /><span class="cap">W</span>u, the moneylender? <span id="input"></span><span id="cursor">_</span>'
          allow = [1, 1310, 'Y', 'N']
          fnKeyInput()
          break
        } else {
          goto = 1500
          delay = 0
          break
        }
      case 1310:
        if (input[2] == 'N') {
          goto = 1500
          delay = 0
          break
        }
      case 1360:
        if (DW == 0 || CA == 0) {
          goto = 1400
          delay = 0
          break
        }
      case 1370:
        elements['message'].innerHTML =
          comp$ +
          '<span class="cap">H</span>ow much do you wish to repay<br />him? <span id="input"></span><span id="cursor">_</span>'
        allow = [9, 1380, 'A', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9']
        fnKeyInput()
        break
      case 1380:
        amount = input[2] == 'A' ? CA : +input[2]
        if (CA >= amount) {
          CA -= amount
          DW -= amount
          fRP()
        } else {
          elements['message'].innerHTML +=
            '<br /><br /><br />' + t$ + ', you have only ' + fnFC(CA) + '<br />in cash.'
          fnKeyInput()
          goto = 1370
          delay = 10
          break
        }
      case 1400:
        elements['message'].innerHTML =
          comp$ +
          '<span class="cap">H</span>ow much do you wish to<br />borrow? <span id="input"></span><span id="cursor">_</span>'
        allow = [9, 1420, '0', '1', '2', '3', '4', '5', '6', '7', '8', '9']
        fnKeyInput()
        break
      case 1420:
        i = +input[2]
        if (CA * 2 >= i) {
          CA += i
          DW += i
          fRP()
        } else {
          elements['message'].innerHTML +=
            '<br /><br /><br /><span class="cap">H</span>e won\'t loan you so much, ' + t$ + '!'
          goto = 1400
          delay = 10
          break
        }
      case 1500:
        SP = Mf(1000 + fR((1000 * (TI + 5)) / 6)) * (Mf(SC / 50) * (DM > 0 ? 1 : 0) + 1)
        if (CA >= SP && fR(4) == 0) {
          goto = 'NEWSHIP1'
          delay = 0
          break
        }
      case 'R-NEWSHIP':
        SP = Mf(fR((1000 * (TI + 5)) / 6) + 500)
        if (CA >= SP && fR(3) == 0) {
          goto = 'NEWGUN1'
          delay = 0
          break
        }
      case 'R-NEWGUN':
        if (ST[1][0] > 0 && Number(LO) > 1 && fR(18) == 0) {
          i = Mf(CA / 1.8)
          MW += ST[1][0]
          elements['MW'].innerHTML = String(MW)
          ST[1][0] = 0
          elements['h0'].innerHTML = '0'
          CA -= i
          elements['CA'].innerHTML = fnFC(CA)
          elements['message'].innerHTML =
            comp$ +
            'Bad Joss!!<br />The local authorities have seized your<br /><span class="cap">O</span>pium cargo and have also fined you<br />' +
            fnFC(i) +
            ', ' +
            t$ +
            '!'
          fnKeyInput()
          delay = 18
          goto = 'R-BUSTED'
          break
        }
      case 'R-BUSTED':
      case 2100:
        for (i = 0; i < 4; i++) CP[i] = Mf((portPrice(i) / 2) * (fR(3) + 1) * Mp(10, 3 - i))
        LI = Mm(LI, fR(20))
        if (LI == 0 && Number(LO) > 1 && fR(4)) {
          elements['message'].innerHTML =
            comp$ +
            '<span class="cap">L</span>i <span class="cap">Y</span>uen has sent a lieutenant,<br />' +
            t$ +
            '. <span class="cap">H</span>e says his admiral wishes<br />to see you in <span class="cap">H</span>ong <span class="cap">K</span>ong, posthaste!'
          fnKeyInput()
          delay = 10
          goto = 2410
          break
        }
      case 2410:
        if (fR(9) == 0) {
          goto = 'PRICE'
          delay = 0
          break
        }
      case 'R-PRICE':
        if (CA > 25000 && fR(20) == 0) {
          goto = 'ROBBED'
          delay = 0
          break
        }
      case 'R-ROBBED':
      case 'PORT2': {
        if (LO == 1 && CA + BA >= 1e6) {
          mesid = 0
          allow = [1, 'PORT3', 'B', 'S', 'V', 'T', 'R', 'Q']
        } else if (LO == 1) {
          mesid = 1
          allow = [1, 'PORT3', 'B', 'S', 'V', 'T', 'Q']
        } else {
          mesid = 2
          allow = [1, 'PORT3', 'B', 'S', 'Q']
        }
        prices =
          comp$ +
          t$ +
          ', present prices per unit here are:<br/>' +
          '<table><tr><td class="c10">&nbsp;</td><td class="c40">' +
          BP[0][0] +
          ': ' +
          CP[0] +
          '</td><td class="c40">' +
          BP[1][0] +
          ': ' +
          CP[1] +
          '</td><td class="c10">&nbsp;</td></tr>' +
          '<tr><td class="c10">&nbsp;</td><td class="c40">' +
          BP[2][0] +
          ': ' +
          CP[2] +
          '</td><td class="c40"><span class="cap">G</span>eneral: ' +
          CP[3] +
          '</td><td class="c10">&nbsp;</td></tr></table><br/>'
        elements['message'].innerHTML =
          prices + shallI[mesid] + ' <span id="input"></span><span id="cursor">_</span>'
        fnKeyInput()
        break
      }
      case 'PORT3':
        if (input[2] == 'B') goto = 'B1'
        else if (input[2] == 'S') goto = 'S1'
        else if (input[2] == 'V') goto = 'V1'
        else if (input[2] == 'T') goto = 2620
        else if (input[2] == 'Q' && MW < 0) goto = 'OVERLOAD'
        else if (input[2] == 'Q') goto = 'Q1'
        else if (input[2] == 'R') goto = 2695
        else goto = 'NOTYET'
        delay = 0
        break
      case 'NEWSHIP1':
        allow = [1, 'NEWSHIP2', 'Y', 'N']
        elements['message'].innerHTML =
          comp$ +
          '<span class="cap">D</span>o you wish to trade in your ' +
          (DM > 0 ? '<span class="inverse">damaged</span>' : 'fine') +
          '<br/>ship for one with 50 more capacity by<br/>paying an additional ' +
          fnFC(SP) +
          ', ' +
          t$ +
          '? <span id="input"></span><span id="cursor">_</span>'
        fnKeyInput()
        break
      case 'NEWSHIP2':
        if (input[2] == 'Y') {
          CA -= SP
          MW += 50
          SC += 50
          DM = 0
          fRP()
        }
        goto = 'R-NEWSHIP'
        delay = 2
        break
      case 'NEWGUN1':
        allow = [1, 'NEWGUN2', 'Y', 'N']
        elements['message'].innerHTML =
          comp$ +
          '<span class="cap">D</span>o you wish to buy a ship\'s gun<br/>for ' +
          fnFC(SP) +
          ', ' +
          t$ +
          '? <span id="input"></span><span id="cursor">_</span>'
        fnKeyInput()
        break
      case 'NEWGUN2':
        if (input[2] == 'Y' && MW >= 10) {
          CA -= SP
          GN += 1
          MW -= 10
          fRP()
          delay = 2
          goto = 'R-NEWGUN'
        } else if (input[2] == 'Y') {
          elements['message'].innerHTML +=
            '<br/><br/><span class="cap">Y</span>our ship would be overburdened, ' + t$ + '!'
          fnKeyInput()
          cursor[0] = null
          delay = 10
          goto = 'R-NEWGUN'
        } else {
          delay = 2
          goto = 'R-NEWGUN'
        }
        break
      case 'PRICE':
        i = fR(4)
        if (fR(2) == 0) {
          CP[i] = Mf(CP[i] / 5)
          elements['message'].innerHTML =
            comp$ + t$ + '!!&nbsp; The price of ' + BP[i][0] + ' has dropped to ' + CP[i] + '!!'
        } else {
          CP[i] *= fR(5) + 5
          elements['message'].innerHTML =
            comp$ + t$ + '!!&nbsp; The price of ' + BP[i][0] + ' has risen to ' + CP[i] + '!!'
        }
        fnKeyInput()
        delay = 10
        goto = 'R-PRICE'
        break
      case 'ROBBED':
        i = Mf(CA / 1.4)
        elements['message'].innerHTML =
          comp$ + "You've been beaten up and robbed of " + fnFC(i) + ' in cash, ' + t$ + '!!'
        CA -= i
        elements['CA'].innerHTML = fnFC(CA)
        fnKeyInput()
        delay = 18
        goto = 'R-ROBBED'
        break
      case 'B1':
        allow = [1, 'B2', 'O', 'S', 'A', 'G']
        elements['message'].innerHTML =
          prices +
          '<span class="cap">W</span>hat do you wish me to buy, ' +
          t$ +
          '? <span id="input"></span><span id="cursor">_</span>'
        fnKeyInput()
        break
      case 'B2':
        allow = [6, 'B3', 'A', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9']
        if (input[2] == 'O') item = 0
        else if (input[2] == 'S') item = 1
        else if (input[2] == 'A') item = 2
        else item = 3
        afford = Mf(CA / CP[item])
      case 'B2a':
        elements['message'].innerHTML =
          prices +
          '<span class="cap">H</span>ow much ' +
          BP[item][0] +
          ' shall<br/><span class="cap">I</span> buy, ' +
          t$ +
          '? <span id="input"></span><span id="cursor">_</span>' +
          '<span class="afford">You can<br/>afford<br/>' +
          afford +
          '</span>'
        fnKeyInput()
        break
      case 'B3':
        amount = input[2] == 'A' ? afford : +input[2]
        if (amount <= afford) {
          MW -= amount
          elements['MW'].innerHTML = MW >= 0 ? String(MW) : overload$
          CA -= CP[item] * amount
          elements['CA'].innerHTML = fnFC(CA)
          ST[1][item] += amount
          elements['h' + item].innerHTML = String(ST[1][item])
          goto = 'PORT2'
        } else goto = 'B2a'
        delay = 0
        break
      case 'S1':
        allow = [1, 'S2', 'O', 'S', 'A', 'G']
        elements['message'].innerHTML =
          prices +
          '<span class="cap">W</span>hat do you wish me to sell, ' +
          t$ +
          '? <span id="input"></span><span id="cursor">_</span>'
        fnKeyInput()
        break
      case 'S2':
        allow = [6, 'S3', 'A', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9']
        if (input[2] == 'O') item = 0
        else if (input[2] == 'S') item = 1
        else if (input[2] == 'A') item = 2
        else item = 3
      case 'S2a':
        elements['message'].innerHTML =
          prices +
          '<span class="cap">H</span>ow much ' +
          BP[item][0] +
          ' shall<br/><span class="cap">I</span> sell, ' +
          t$ +
          '? <span id="input"></span><span id="cursor">_</span>'
        fnKeyInput()
        break
      case 'S3':
        amount = input[2] == 'A' ? ST[1][item] : +input[2]
        if (amount <= ST[1][item]) {
          MW += amount
          elements['MW'].innerHTML = MW >= 0 ? String(MW) : overload$
          CA += CP[item] * amount
          elements['CA'].innerHTML = fnFC(CA)
          ST[1][item] -= amount
          elements['h' + item].innerHTML = String(ST[1][item])
          goto = 'PORT2'
        } else goto = 'S2a'
        delay = 0
        break
      case 'OVERLOAD':
        elements['message'].innerHTML =
          comp$ + '<span class="cap">Y</span>our ship is overloaded, ' + t$ + '!!'
        delay = 16
        goto = 'PORT2'
        fnKeyInput()
        break
      case 'V1':
        allow = [9, 'V2', 'A', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9']
        elements['message'].innerHTML =
          comp$ +
          '<span class="cap">H</span>ow much will you deposit? <span id="input"></span><span id="cursor">_</span>'
        fnKeyInput()
        break
      case 'V2':
        amount = input[2] == 'A' ? CA : +input[2]
        if (amount > CA) {
          elements['message'].innerHTML +=
            '<br/><br/>' + t$ + ', you have only ' + fnFC(CA) + '<br/>in cash.'
          delay = 24
          goto = 'V1'
          fnKeyInput()
          cursor[0] = null
          break
        } else {
          CA -= amount
          BA += amount
          fRP()
        }
      case 'V3':
        allow = [9, 'V4', 'A', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9']
        elements['message'].innerHTML =
          comp$ +
          '<span class="cap">H</span>ow much will you withdraw? <span id="input"></span><span id="cursor">_</span>'
        fnKeyInput()
        break
      case 'V4':
        amount = input[2] == 'A' ? BA : +input[2]
        if (amount > BA) {
          elements['message'].innerHTML +=
            '<br/><br/>' + t$ + ', you have only ' + fnFC(BA) + '<br/>in the bank.'
          delay = 24
          goto = 'V3'
          fnKeyInput()
          cursor[0] = null
          break
        } else {
          BA -= amount
          CA += amount
          fRP()
        }
        goto = 'PORT2'
        delay = 0
        break
      case 2620:
      case 2622:
        W = 0
        for (wh1 = 0; wh1 < 2; wh1++) {
          for (wh2 = 0; wh2 < 4; wh2++) W += ST[wh1][wh2]
        }
        if (W == 0) {
          elements['message'].innerHTML =
            prices + '<span class="cap">Y</span>ou have no cargo, ' + t$ + '.'
          delay = 12
          goto = 'PORT2'
          fnKeyInput()
          break
        }
        wh1 = 2
        wh2 = 0
      case 2624:
        do {
          wh1--
          if (wh1 < 0) {
            if (wh2 < 3) {
              wh1 = 1
              wh2++
            } else {
              goto = 'PORT2'
              delay = 0
              return
            }
          }
        } while (ST[wh1][wh2] == 0)
      case 2626:
        elements['message'].innerHTML =
          comp$ +
          '<span class="cap">H</span>ow much ' +
          BP[wh2][0] +
          ' shall <span class="cap">I</span> move<br />' +
          (wh1 == 0 ? 'aboard ship' : 'to the warehouse') +
          ', ' +
          t$ +
          '? <span id="input"></span><span id="cursor">_</span>'
        allow = [5, 2628, 'A', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9']
        fnKeyInput()
        break
      case 2628:
        amount = input[2] == 'A' ? ST[wh1][wh2] : +input[2]
        if (wh1 == 1 && amount > 0 && WC == 0) {
          elements['message'].innerHTML += '<br/><br/>Your warehouse is full, ' + t$ + '!'
          delay = 10
          goto = 2626
          fnKeyInput()
          cursor[0] = null
          break
        }
        if (wh1 == 1 && amount > WC) {
          elements['message'].innerHTML +=
            '<br/><br/>Your warehouse will only hold an<br />additional ' +
            fnFC(WC) +
            ', ' +
            t$ +
            '!'
          delay = 10
          goto = 2626
          fnKeyInput()
          cursor[0] = null
          break
        }
        if (amount > ST[wh1][wh2]) {
          elements['message'].innerHTML +=
            '<br/><br/>You have only ' + fnFC(ST[wh1][wh2]) + ', ' + t$ + '.'
          delay = 10
          goto = 2626
          fnKeyInput()
          cursor[0] = null
          break
        }
        ST[wh1][wh2] -= amount
        if (wh1 == 0) {
          ST[1][wh2] += amount
          WS -= amount
          WC += amount
          MW -= amount
        } else {
          ST[0][wh2] += amount
          WS += amount
          WC -= amount
          MW += amount
        }
        elements['w' + wh2].innerHTML = fnFC(ST[0][wh2])
        elements['h' + wh2].innerHTML = fnFC(ST[1][wh2])
        elements['WS'].innerHTML = fnFC(WS)
        elements['WC'].innerHTML = fnFC(WC)
        elements['MW'].innerHTML = MW >= 0 ? String(MW) : overload$
        goto = 2624
        delay = 0
        break
      case 2695:
        elements['message'].innerHTML =
          '<br /><div class="millionaire"><span class="cap">Y</span> o&nbsp;u &nbsp;\' &nbsp;r &nbsp;e &nbsp; &nbsp;a<br /><br /><span class="cap">M &nbsp; I &nbsp; L &nbsp; L &nbsp; I &nbsp; O &nbsp; N &nbsp; A &nbsp; I &nbsp; R &nbsp; E &nbsp; !</span></div>'
        fnKeyInput()
        delay = 18
        goto = 20000
        break
      case 'NOTYET':
        elements['message'].innerHTML = comp$ + t$ + ", that command hasn't yet been implemented!"
        delay = 6
        goto = 'PORT2'
        fnKeyInput()
        break
      case 'Q1':
        allow = [1, 'Q2', '1', '2', '3', '4', '5', '6', '7']
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
        if (input[2] == LO) {
          elements['message'].innerHTML +=
            '<br/><span class="cap">Y</span>ou\'re already here, ' + t$ + '.'
          fnKeyInput()
          cursor[0] = null
          delay = 16
          goto = 'Q1'
          break
        }
      case 3030:
        elements['location'].innerHTML = cities[0]
        LO = input[2]
        elements['message'].innerHTML = capt$
        fnKeyInput()
        delay = 2
        goto = 3100
        break
      case 3100:
        if (fR(FQ) == 0) {
          SN = fR(SC / 10 + GN) + 1
          F1 = 1
          elements['message'].innerHTML =
            capt$ + SN + ' hostile ship' + (SN > 1 ? 's' : '') + ' approaching, ' + t$ + '!!'
          fnKeyInput()
          delay = 10
          goto = 5000
          break
        }
        if (fR(4 + 8 * LI) == 0) {
          elements['message'].innerHTML =
            capt$ +
            '<span class="cap">L</span>i <span class="cap">Y</span>uen\'s pirates, ' +
            t$ +
            '!!'
          fnKeyInput()
          delay = 4
          goto = 3230
          break
        }
        goto = 3300
        delay = 0
        break
      case 3230:
        if (LI > 0) {
          elements['message'].innerHTML +=
            '<br /><br /><span class="cap">G</span>ood joss!! <span class="cap">T</span>hey let us be!!'
          fnKeyInput()
          delay = 6
          goto = 3300
          break
        } else {
          SN = fR(SC / 5 + GN) + 5
          F1 = 2
          elements['message'].innerHTML +=
            '<br /><br />' +
            SN +
            ' ship' +
            (SN > 1 ? 's' : '') +
            ' of <span class="cap">L</span>i <span class="cap">Y</span>uen\'s pirate<br />fleet, ' +
            t$ +
            '!!'
          fnKeyInput()
          delay = 6
          goto = 5000
          break
        }
      case 3300:
        if (fR(10) == 0) {
          elements['message'].innerHTML =
            capt$ + '<span class="cap">S</span>' + 'torm, ' + t$ + '!!'
          fnKeyInput()
          delay = 4
          goto = 3320
          break
        } else {
          fnKeyInput()
          delay = 0
          goto = 'ARR1'
          break
        }
      case 3320:
        if (fR(30) == 0) {
          elements['message'].innerHTML +=
            '<br /><br />&nbsp; &nbsp;<span class="cap">I</span> think we\'re going down!!'
          fnKeyInput()
          delay = 4
          goto = 'STORM'
          break
        } else {
          fnKeyInput()
          delay = 0
          goto = 3330
          break
        }
      case 'STORM':
        if (fR((DM / SC) * 3) == 0) {
          elements['message'].innerHTML +=
            '<br /><br /><span class="cap">W</span>' + "e're going down, " + t$ + '!!'
          fnKeyInput()
          delay = 4
          goto = 20000
          break
        }
      case 3330:
        elements['message'].innerHTML +=
          '<br /><br />&nbsp; &nbsp; <span class="cap">W</span>e made it!!'
        fnKeyInput()
        delay = 4
        goto = 3340
        break
      case 3340:
        if (fR(3) == 0) {
          D = Number(LO)
          while (Number(LO) == D) LO = fR(7) + 1
          elements['message'].innerHTML =
            capt$ + "We've been blown off course<br />to " + cities[LO as number]
          fnKeyInput()
          delay = 4
          goto = 'ARR1'
          break
        }
      case 'ARR1':
        elements['message'].innerHTML =
          capt$ + '<span class="cap">A</span>rriving at ' + cities[LO as number]
        fnKeyInput()
        delay = 8
        goto = 'ARR2'
        break
      case 'ARR2':
        elements['message'].innerHTML = comp$
        elements['location'].innerHTML = cities[LO as number]
        fnKeyInput()
        delay = 4
        goto = 1000
        break
      case 5000:
        LC = 0
        OK = 3
        IK = 1
        S0 = SN
        BT = fR((TI / 4) * 1000 * Mp(SN, 1.05)) + fR(1000) + 250
        SS = 0
        for (i = 0; i < 10; i++) AM[i][0] = 0
        elements['SN'].innerHTML = String(SN)
        elements['GNs'].innerHTML = String(GN)
        elements['S4'].style.display = 'none'
        elements['S5'].style.display = 'block'
        elements['f2'].innerHTML =
          '<span class="cap">Y</span>our orders are to: <span id="input"></span><span id="cursor">_</span>'
      case 5060:
        WW = 100 - Mf((DM / SC) * 100)
        elements['f4'].innerHTML =
          '<span class="cap">C</span>urrent seaworthiness: &nbsp;' +
          sstatus[Mf(WW / 20)] +
          ' (' +
          WW +
          '%)'
      case 5100:
        fnAddShips()
        allow = false
        get = [1, 5160, 'F', 'R']
        delay = LC == 0 ? 12 : 4
        goto = 5190
        fnKeyInput()
        break
      case 5160:
        LC = input[2]
        if (LC == 'F') CMD = '<span class="cap">F</span>ight'
        else if (LC == 'R') CMD = '<span class="cap">R</span>un'
        else CMD = '<span class="cap">T</span>hrow cargo'
        elements['f2'].innerHTML = '<span class="cap">Y</span>our orders are to: ' + CMD
      case 5190:
        if (LC == 'R') goto = 5200
        else if (LC == 'F') goto = 5300
        else if (LC == 'T') goto = 5400
        else elements['f4'].innerHTML = t$ + ', what shall we do?? (Fight, Run)'
        delay = 0
        break
      case 5200:
        get = false
        elements['f4'].innerHTML = '<span class="cap">A</span>ye, we\'ll run, ' + t$ + '!'
        fnKeyInput()
        delay = 4
        goto = 5210
        break
      case 5210:
        OK += IK++
        if (fR(OK) > fR(SN)) {
          OK = 3
          elements['f4'].innerHTML = '<span class="cap">W</span>e got away from \'em, ' + t$ + '!!'
          fnKeyInput()
          delay = 4
          goto = 5900
          break
        }
      case 5220:
        elements['f4'].innerHTML = '<span class="cap">C</span>an\'t lose \'em!!'
        fnKeyInput()
        delay = 4
        goto = 5230
        break
      case 5230:
        if (SN > 2 && fR(5) == 0) {
          W = Mf(fR(SN / 2) + 1)
          SN -= W
          elements['SN'].innerHTML = String(SN)
          if (SS > SN) fnRemoveShips()
          elements['f4'].innerHTML =
            '<span class="cap">B</span>ut we escaped from ' + W + " of 'em, " + t$ + '!'
          fnKeyInput()
          delay = 4
          goto = 5500
          break
        } else {
          delay = 0
          goto = 5500
          break
        }
      case 5300:
        get = false
        if (GN == 0) {
          elements['f4'].innerHTML = '<span class="cap">W</span>e have no guns, ' + t$ + '!!'
          fnKeyInput()
          delay = 4
          goto = 5500
          break
        }
        CG = 0
        elements['f4'].innerHTML = '<span class="cap">A</span>ye, we\'ll fight \'em, ' + t$ + '!'
        fnKeyInput()
        delay = 4
        goto = 5310
        break
      case 5310:
        SK = 0
        elements['f4'].innerHTML = '<span class="cap">W</span>e\'re firing on \'em, ' + t$ + '!'
      case 5320:
        if (SS == 0) fnAddShips()
        if (SN > 0 && ++CG <= GN) {
          do shot = fR(10)
          while (AM[shot][0] == 0)
        } else {
          fnKeyInput()
          delay = 0
          goto = 5340
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
        AM[shot][1] += fR(30) + 10
        if (AM[shot][1] > AM[shot][0]) {
          AM[shot][0] = 0
          AM[shot][1] = 0
          SN--
          SS--
          SK++
          fnSink(shot, 0, fR(20) == 0 ? 40 : 20)
          break
        }
        fnKeyInput()
        delay = 2
        goto = 5320
        break
      case 5340:
        if (SK)
          elements['f4'].innerHTML =
            '<span class="cap">S</span>unk ' + SK + ' of the buggers, ' + t$ + '!'
        else
          elements['f4'].innerHTML =
            "<span class=\"cap\">H</span>it 'em, but didn't sink 'em, " + t$ + '!'
        fnKeyInput()
        delay = 4
        goto = 5360
        break
      case 5360:
        if (fR(S0) < (SN * 0.6) / F1 || SN == 0 || SN == S0 || SN < 3) {
          fnKeyInput()
          delay = 0
          goto = 5500
          break
        }
        W = Mf(fR(SN / 3 / F1) + 1)
        SN -= W
        elements['SN'].innerHTML = String(SN)
        if (SS > SN) fnRemoveShips()
        elements['f4'].innerHTML = W + ' ran away, ' + t$ + '!'
        fnKeyInput()
        delay = 4
        goto = 5500
        break
      case 5400:
        get = false
      case 5500:
        if (SN == 0) {
          OK = 1
          elements['f4'].innerHTML = '<span class="cap">W</span>e got \'em all, ' + t$ + '!!'
          fnKeyInput()
          delay = 4
          goto = 5900
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
        delay = 4
        goto = 5510
        break
      case 5510:
        elements['f4'].innerHTML = '<span class="cap">W</span>e\'ve been hit, ' + t$ + '!!'
        fnKeyInput()
        delay = 4
        goto = 5540
        break
      case 5540:
        DQ = SN > 15 ? 15 : SN
        if (GN > 0 && (fR(100) < (DM / SC) * 100 || (DM / SC) * 100 > 80)) {
          DQ = 1
          GN--
          MW += 10
          elements['GNs'].innerHTML = String(GN)
          elements['f4'].innerHTML = '<span class="cap">T</span>he buggers hit a gun, ' + t$ + '!!'
          fnKeyInput()
          delay = 4
          goto = 5550
          break
        }
      case 5550:
        DM += fR(ED * DQ * F1) + DQ / 2
        if (DM > SC) {
          fnKeyInput()
          delay = 0
          goto = 20000
          break
        }
        fnKeyInput()
        delay = 0
        goto = 5060
        break
      case 5800:
        elements['SN'].innerHTML = String(SN)
        delay = 2
        goto = 5320
        break
      case 5900:
        if (LC == 'F') {
          CA += BT
          elements['message'].innerHTML =
            '<br /><br /><span class="cap">W</span>e\'ve captured some booty.<br />It\'s worth ' +
            fnFC(BT) +
            '!'
        } else
          elements['message'].innerHTML =
            '<br /><br /><span class="cap">W</span>e made it, ' + t$ + '!'
        fRP()
        elements['S5'].style.display = 'none'
        elements['S4'].style.display = 'block'
        get = false
        fnKeyInput()
        delay = 10
        goto = 3300
        break
      case 10000:
      case 10120:
        elements['S2b'].innerHTML = '<span id="input"></span><span id="cursor">_</span>'
        fname = 22
        fnKeyInput()
        break
      case 10130:
        if (input[2] == '') {
          delay = 0
          goto = 10120
          break
        }
        elements['H'].innerHTML = input[2]
        elements['S2'].style.display = 'none'
        elements['S2b'].innerHTML = ''
        elements['S3'].style.display = 'block'
      case 10140:
        elements['S3b'].innerHTML = '<span id="input"></span><span id="cursor">_</span>'
        allow = [1, 10150, '1', '2']
        fnKeyInput()
        break
      case 10150:
        if (input[2] == '1') {
          DW = 5000
          CA = 400
          MW = 60
          GN = 0
          FQ = 10
        } else {
          DW = 0
          CA = 0
          MW = 10
          GN = 5
          FQ = 7
        }
        goto = 1030
        elements['S3'].style.display = 'none'
        elements['S3b'].innerHTML = ''
        elements['S4'].style.display = 'block'
        break
      case 20000:
        WW = CA + BA - DW
        elements['CAf'].innerHTML = fnFC(WW)
        elements['SCf'].innerHTML = String(SC)
        elements['GNf'].innerHTML = String(GN)
        YEARSf = Mf(TI / 12)
        elements['YEARSf'].innerHTML = YEARSf + ' year'
        if (YEARSf != 1) elements['YEARSf'].innerHTML += 's'
        MONTHSf = TI - YEARSf * 12
        elements['MONTHSf'].innerHTML = MONTHSf + ' month'
        if (MONTHSf != 1) elements['MONTHSf'].innerHTML += 's'
        WW = Mf((CA + BA - DW) / 100 / Mp(TI, 1.1))
        elements['SCOREf'].innerHTML = String(WW)
        if (WW < 500) elements['SCORE1f'].className = 'inverse'
        else if (WW < 1000) elements['SCORE2f'].className = 'inverse'
        else if (WW < 8000) elements['SCORE3f'].className = 'inverse'
        else if (WW < 50000) elements['SCORE4f'].className = 'inverse'
        else elements['SCORE5f'].className = 'inverse'
        elements['S4'].style.display = 'none'
        elements['S5'].style.display = 'none'
        elements['S6'].style.display = 'block'
        break
    }
  }
  /* eslint-enable no-fallthrough */

  document.addEventListener('keydown', onKeyDown)
  document.addEventListener('keypress', onKeyPress)
  root.addEventListener('click', focusHelper)
  const intervalId = window.setInterval(fnTimer, 500)
  fnMain(10000)

  return () => {
    window.clearInterval(intervalId)
    for (const id of pending) window.clearTimeout(id)
    pending.clear()
    document.removeEventListener('keydown', onKeyDown)
    document.removeEventListener('keypress', onKeyPress)
    root.removeEventListener('click', focusHelper)
  }
}
