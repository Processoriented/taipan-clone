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
      state.nextLine === '' &&
      state.allowedInput === false &&
      state.keyChoice === false &&
      state.firmNameLimit === false
    ) {
      state.nextLine = state.resumeLine
      state.delayTicks = 0
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
    if (state.delayTicks > 0) state.delayTicks--
    if (state.nextLine != '' && state.delayTicks == 0) fnMain(state.nextLine)
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
    return Number(state.goods[good][state.location as number])
  }

  function fRP(): void {
    elements['MW'].innerHTML = String(state.holdRoom)
    elements['GN'].innerHTML = String(state.guns)
    elements['CA'].innerHTML = fnFC(state.cash)
    elements['BA'].innerHTML = fnFC(state.bank)
    elements['DW'].innerHTML = fnFC(state.debt)
    const seaworthiness = 100 - Mf((state.damage / state.shipCapacity) * 100)
    elements['DM'].innerHTML =
      sstatus[Mf(seaworthiness / 20)] + (seaworthiness < 100 ? ': ' : ':') + seaworthiness
  }

  function fnAddShips(): void {
    for (let i = 0; i < 10; i++) {
      if (state.shipsOnScreen < state.enemyShips && state.enemySlots[i][0] == 0) {
        state.enemySlots[i][0] = fR(state.enemyStrength) + 20
        state.enemySlots[i][1] = 0
        state.shipsOnScreen++
        elements['sf' + i].innerHTML = '<div class="ship"></div><div class="ff"></div>'
      } else if (state.enemySlots[i][0] == 0) {
        elements['sf' + i].innerHTML = ''
      }
    }
    elements['plus'].innerHTML = state.shipsOnScreen < state.enemyShips ? '+' : ''
  }

  function fnRemoveShips(): void {
    for (let i = 9; i >= 0; i--) {
      if (state.shipsOnScreen > state.enemyShips && state.enemySlots[i][0]) {
        state.enemySlots[i][0] = 0
        state.enemySlots[i][1] = 0
        state.shipsOnScreen--
        elements['sf' + i].innerHTML = ''
      }
    }
    if (state.shipsOnScreen <= state.enemyShips) elements['plus'].innerHTML = ''
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
      state.nextLine = 5800
    }
  }

  function onKeyPress(e: KeyboardEvent): void {
    const key = e.charCode || e.keyCode
    if (key == 8) e.preventDefault()
  }

  function onKeyDown(e: KeyboardEvent): void {
    state.delayTicks = 0
    let key = e.charCode || e.keyCode
    if (key == 8) {
      e.preventDefault()
      if (input[1] > 0) {
        input[2] = input[2].substring(0, input[2].length - 1)
        input[1]--
        if (input[0]) input[0].innerHTML = input[2]
        touch()
      }
    } else if (state.keyChoice) {
      if (key >= 96 && key <= 105) key -= 48
      const inchar = String.fromCharCode(key)
      for (let n = 2; n < state.keyChoice.length; n++) {
        if (inchar == state.keyChoice[n]) {
          input[2] = inchar
          input[1] = 1
          cursor[0] = null
          fnMain(state.keyChoice[1])
        }
      }
    } else if (key == 13 && state.allowedInput && input[1] > 0) {
      cursor[0] = null
      fnMain(state.allowedInput[1])
    } else if (state.allowedInput) {
      if (key >= 96 && key <= 105) key -= 48
      const inchar = String.fromCharCode(key)
      for (let n = 2; n < state.allowedInput.length; n++) {
        if (input[1] < state.allowedInput[0] && inchar == state.allowedInput[n]) {
          input[2] += inchar
          input[1]++
          if (input[0]) input[0].innerHTML = input[2]
          touch()
        }
      }
    } else if (state.firmNameLimit) {
      const limit = state.firmNameLimit
      if (key == 13 && input[1] > 0) {
        state.firmNameLimit = false
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
    state.nextLine = ''
    let endGame = false
    let amount: number
    let i: number
    let shot = 0
    switch (line) {
      case 1000:
        state.bank += Mf(state.bank * 0.005)
        state.debt += Mf(state.debt * 0.1)
        state.monthsElapsed++
        state.month++
        if (state.month == 12) {
          state.month = 0
          state.year++
          state.enemyStrength += 10
          state.enemyDamage += 0.5
          for (i = 0; i < 4; i++) {
            for (let j = 1; j < 8; j++) state.goods[i][j] = (state.goods[i][j] as number) + fR(2)
          }
        }
      case 1030:
        fRP()
        elements['month0'].innerHTML = months[state.month][0]
        elements['month1'].innerHTML = months[state.month][1]
        elements['year'].innerHTML = String(state.year)
        if (state.location != 1) {
          state.nextLine = 1500
          state.delayTicks = 0
          break
        }
        if (state.liFavor == 0 && state.cash > 0) {
          let donationBonus = 0
          let donationScale = 1.8
          if (state.monthsElapsed > 12) {
            donationBonus = fR(1000 * state.monthsElapsed) + 1000 * state.monthsElapsed
            donationScale = 1
          }
          state.liDonation = fR(state.cash / donationScale) + donationBonus
          elements['message'].innerHTML =
            comp$ +
            '<span class="cap">L</span>i <span class="cap">Y</span>uen asks ' +
            fnFC(state.liDonation) +
            ' in donation<br />to the temple of <span class="cap">T</span>in <span class="cap">H</span>au, the <span class="cap">S</span>ea<br /><span class="cap">G</span>oddess. <span class="cap">W</span>ill you pay? <span id="input"></span><span id="cursor">_</span>'
          state.allowedInput = [1, 1060, 'Y', 'N']
          fnKeyInput()
          break
        }
      case 1060:
        if (line == 1060 && input[2] == 'Y') {
          state.cash -= state.liDonation
          if (state.cash >= 0) {
            state.liFavor = 1
            elements['CA'].innerHTML = fnFC(state.cash)
          } else {
            elements['message'].innerHTML =
              comp$ +
              t$ +
              ', you do not have enough cash!!<br /><br /><span class="cap">D</span>o you want <span class="cap">E</span>lder <span class="cap">B</span>rother <span class="cap">W</span>u to make up<br />the difference for you? <span id="input"></span><span id="cursor">_</span>'
            state.allowedInput = [1, 1080, 'Y', 'N']
            fnKeyInput()
            break
          }
        }
      case 1080:
        if (line == 1080) {
          if (input[2] == 'Y') {
            state.debt -= state.cash
            state.liFavor = 1
            elements['message'].innerHTML =
              comp$ +
              '<span class="cap">E</span>lder <span class="cap">B</span>rother has given <span class="cap">L</span>i <span class="cap">Y</span>uen the <br />difference between what he wanted and<br />your cash on hand and added the same<br />amount to your debt.'
            elements['DW'].innerHTML = fnFC(state.debt)
          } else {
            elements['message'].innerHTML =
              comp$ +
              '<span class="cap">V</span>ery well. <span class="cap">E</span>lder <span class="cap">B</span>rother <span class="cap">W</span>u will not pay<br /><span class="cap">L</span>i <span class="cap">Y</span>uen the difference. <span class="cap">I</span> would be very<br />wary of pirates if <span class="cap">I</span> were you, ' +
              t$ +
              '.'
          }
          state.cash = 0
          elements['CA'].innerHTML = fnFC(state.cash)
          fnKeyInput()
          state.delayTicks = 10
          state.nextLine = 1120
          break
        }
      case 1120:
        if (state.location == 1 && state.damage > 0) {
          elements['message'].innerHTML =
            comp$ +
            t$ +
            ', <span class="cap">M</span>c <span class="cap">H</span>enry from the <span class="cap">H</span>ong <span class="cap">K</span>ong<br /><span class="cap">S</span>hipyards has arrived! <span class="cap">H</span>e says, \'I see<br />ye\'ve a wee bit of damage to yer ship.<br /><span class="cap">W</span>ill ye be wanting repairs?\' <span id="input"></span><span id="cursor">_</span>'
          state.allowedInput = [1, 1130, 'Y', 'N']
          fnKeyInput()
          break
        } else {
          state.nextLine = 1210
          state.delayTicks = 0
          break
        }
      case 1130:
        if (input[2] == 'N') {
          state.nextLine = 1210
          state.delayTicks = 0
          break
        }
      case 1140:
        state.repairCost = Mf(
          ((fR((60 * (state.monthsElapsed + 3)) / 4) + (25 * (state.monthsElapsed + 3)) / 4) *
            state.shipCapacity) /
            50
        )
      case 1145:
        elements['message'].innerHTML =
          comp$ +
          '<span class="cap">O</span>ch, \'tis a pity to be ' +
          Mf((state.damage / state.shipCapacity) * 100) +
          '% damaged.<br /><span class="cap">W</span>e can fix yer whole ship for ' +
          fnFC(state.repairCost) +
          '<br />or make partial repairs if you wish.<br /><span class="cap">H</span>ow much will ye spend? <span id="input"></span><span id="cursor">_</span>'
        state.allowedInput = [9, 1150, 'A', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9']
        fnKeyInput()
        break
      case 1150:
        if (input[2] == 'A') {
          amount = state.repairCost
          if (state.cash < amount) amount = state.cash
        } else amount = +input[2]
        if (state.cash < amount) {
          elements['message'].innerHTML = comp$ + t$ + ', you do not have enough cash!!'
          fnKeyInput()
          cursor[0] = null
          state.delayTicks = 6
          state.nextLine = 1145
          break
        }
        {
          const damageRepaired = Mf((state.damage * amount) / state.repairCost)
          state.damage = damageRepaired <= state.damage ? state.damage - damageRepaired : 0
        }
        state.cash -= amount
        fRP()
      case 1210:
      case 1300:
        if (state.location == 1) {
          elements['message'].innerHTML =
            comp$ +
            '<span class="cap">D</span>o you have business with <span class="cap">E</span>lder <span class="cap">B</span>rother<br /><span class="cap">W</span>u, the moneylender? <span id="input"></span><span id="cursor">_</span>'
          state.allowedInput = [1, 1310, 'Y', 'N']
          fnKeyInput()
          break
        } else {
          state.nextLine = 1500
          state.delayTicks = 0
          break
        }
      case 1310:
        if (input[2] == 'N') {
          state.nextLine = 1500
          state.delayTicks = 0
          break
        }
      case 1360:
        if (state.debt == 0 || state.cash == 0) {
          state.nextLine = 1400
          state.delayTicks = 0
          break
        }
      case 1370:
        elements['message'].innerHTML =
          comp$ +
          '<span class="cap">H</span>ow much do you wish to repay<br />him? <span id="input"></span><span id="cursor">_</span>'
        state.allowedInput = [9, 1380, 'A', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9']
        fnKeyInput()
        break
      case 1380:
        amount = input[2] == 'A' ? state.cash : +input[2]
        if (state.cash >= amount) {
          state.cash -= amount
          state.debt -= amount
          fRP()
        } else {
          elements['message'].innerHTML +=
            '<br /><br /><br />' + t$ + ', you have only ' + fnFC(state.cash) + '<br />in cash.'
          fnKeyInput()
          state.nextLine = 1370
          state.delayTicks = 10
          break
        }
      case 1400:
        elements['message'].innerHTML =
          comp$ +
          '<span class="cap">H</span>ow much do you wish to<br />borrow? <span id="input"></span><span id="cursor">_</span>'
        state.allowedInput = [9, 1420, '0', '1', '2', '3', '4', '5', '6', '7', '8', '9']
        fnKeyInput()
        break
      case 1420:
        i = +input[2]
        if (state.cash * 2 >= i) {
          state.cash += i
          state.debt += i
          fRP()
        } else {
          elements['message'].innerHTML +=
            '<br /><br /><br /><span class="cap">H</span>e won\'t loan you so much, ' + t$ + '!'
          state.nextLine = 1400
          state.delayTicks = 10
          break
        }
      case 1500:
        state.offerPrice =
          Mf(1000 + fR((1000 * (state.monthsElapsed + 5)) / 6)) *
          (Mf(state.shipCapacity / 50) * (state.damage > 0 ? 1 : 0) + 1)
        if (state.cash >= state.offerPrice && fR(4) == 0) {
          state.nextLine = 'NEWSHIP1'
          state.delayTicks = 0
          break
        }
      case 'R-NEWSHIP':
        state.offerPrice = Mf(fR((1000 * (state.monthsElapsed + 5)) / 6) + 500)
        if (state.cash >= state.offerPrice && fR(3) == 0) {
          state.nextLine = 'NEWGUN1'
          state.delayTicks = 0
          break
        }
      case 'R-NEWGUN':
        if (state.cargo[1][0] > 0 && Number(state.location) > 1 && fR(18) == 0) {
          i = Mf(state.cash / 1.8)
          state.holdRoom += state.cargo[1][0]
          elements['MW'].innerHTML = String(state.holdRoom)
          state.cargo[1][0] = 0
          elements['h0'].innerHTML = '0'
          state.cash -= i
          elements['CA'].innerHTML = fnFC(state.cash)
          elements['message'].innerHTML =
            comp$ +
            'Bad Joss!!<br />The local authorities have seized your<br /><span class="cap">O</span>pium cargo and have also fined you<br />' +
            fnFC(i) +
            ', ' +
            t$ +
            '!'
          fnKeyInput()
          state.delayTicks = 18
          state.nextLine = 'R-BUSTED'
          break
        }
      case 'R-BUSTED':
      case 2100:
        for (i = 0; i < 4; i++)
          state.portPrices[i] = Mf((portPrice(i) / 2) * (fR(3) + 1) * Mp(10, 3 - i))
        state.liFavor = Mm(state.liFavor, fR(20))
        if (state.liFavor == 0 && Number(state.location) > 1 && fR(4)) {
          elements['message'].innerHTML =
            comp$ +
            '<span class="cap">L</span>i <span class="cap">Y</span>uen has sent a lieutenant,<br />' +
            t$ +
            '. <span class="cap">H</span>e says his admiral wishes<br />to see you in <span class="cap">H</span>ong <span class="cap">K</span>ong, posthaste!'
          fnKeyInput()
          state.delayTicks = 10
          state.nextLine = 2410
          break
        }
      case 2410:
        if (fR(9) == 0) {
          state.nextLine = 'PRICE'
          state.delayTicks = 0
          break
        }
      case 'R-PRICE':
        if (state.cash > 25000 && fR(20) == 0) {
          state.nextLine = 'ROBBED'
          state.delayTicks = 0
          break
        }
      case 'R-ROBBED':
      case 'PORT2': {
        if (state.location == 1 && state.cash + state.bank >= 1e6) {
          state.portPrompt = 0
          state.allowedInput = [1, 'PORT3', 'B', 'S', 'V', 'T', 'R', 'Q']
        } else if (state.location == 1) {
          state.portPrompt = 1
          state.allowedInput = [1, 'PORT3', 'B', 'S', 'V', 'T', 'Q']
        } else {
          state.portPrompt = 2
          state.allowedInput = [1, 'PORT3', 'B', 'S', 'Q']
        }
        state.priceTableHtml =
          comp$ +
          t$ +
          ', present prices per unit here are:<br/>' +
          '<table><tr><td class="c10">&nbsp;</td><td class="c40">' +
          state.goods[0][0] +
          ': ' +
          state.portPrices[0] +
          '</td><td class="c40">' +
          state.goods[1][0] +
          ': ' +
          state.portPrices[1] +
          '</td><td class="c10">&nbsp;</td></tr>' +
          '<tr><td class="c10">&nbsp;</td><td class="c40">' +
          state.goods[2][0] +
          ': ' +
          state.portPrices[2] +
          '</td><td class="c40"><span class="cap">G</span>eneral: ' +
          state.portPrices[3] +
          '</td><td class="c10">&nbsp;</td></tr></table><br/>'
        elements['message'].innerHTML =
          state.priceTableHtml +
          shallI[state.portPrompt] +
          ' <span id="input"></span><span id="cursor">_</span>'
        fnKeyInput()
        break
      }
      case 'PORT3':
        if (input[2] == 'B') state.nextLine = 'B1'
        else if (input[2] == 'S') state.nextLine = 'S1'
        else if (input[2] == 'V') state.nextLine = 'V1'
        else if (input[2] == 'T') state.nextLine = 2620
        else if (input[2] == 'Q' && state.holdRoom < 0) state.nextLine = 'OVERLOAD'
        else if (input[2] == 'Q') state.nextLine = 'Q1'
        else if (input[2] == 'R') state.nextLine = 2695
        else state.nextLine = 'NOTYET'
        state.delayTicks = 0
        break
      case 'NEWSHIP1':
        state.allowedInput = [1, 'NEWSHIP2', 'Y', 'N']
        elements['message'].innerHTML =
          comp$ +
          '<span class="cap">D</span>o you wish to trade in your ' +
          (state.damage > 0 ? '<span class="inverse">damaged</span>' : 'fine') +
          '<br/>ship for one with 50 more capacity by<br/>paying an additional ' +
          fnFC(state.offerPrice) +
          ', ' +
          t$ +
          '? <span id="input"></span><span id="cursor">_</span>'
        fnKeyInput()
        break
      case 'NEWSHIP2':
        if (input[2] == 'Y') {
          state.cash -= state.offerPrice
          state.holdRoom += 50
          state.shipCapacity += 50
          state.damage = 0
          fRP()
        }
        state.nextLine = 'R-NEWSHIP'
        state.delayTicks = 2
        break
      case 'NEWGUN1':
        state.allowedInput = [1, 'NEWGUN2', 'Y', 'N']
        elements['message'].innerHTML =
          comp$ +
          '<span class="cap">D</span>o you wish to buy a ship\'s gun<br/>for ' +
          fnFC(state.offerPrice) +
          ', ' +
          t$ +
          '? <span id="input"></span><span id="cursor">_</span>'
        fnKeyInput()
        break
      case 'NEWGUN2':
        if (input[2] == 'Y' && state.holdRoom >= 10) {
          state.cash -= state.offerPrice
          state.guns += 1
          state.holdRoom -= 10
          fRP()
          state.delayTicks = 2
          state.nextLine = 'R-NEWGUN'
        } else if (input[2] == 'Y') {
          elements['message'].innerHTML +=
            '<br/><br/><span class="cap">Y</span>our ship would be overburdened, ' + t$ + '!'
          fnKeyInput()
          cursor[0] = null
          state.delayTicks = 10
          state.nextLine = 'R-NEWGUN'
        } else {
          state.delayTicks = 2
          state.nextLine = 'R-NEWGUN'
        }
        break
      case 'PRICE':
        i = fR(4)
        if (fR(2) == 0) {
          state.portPrices[i] = Mf(state.portPrices[i] / 5)
          elements['message'].innerHTML =
            comp$ +
            t$ +
            '!!&nbsp; The price of ' +
            state.goods[i][0] +
            ' has dropped to ' +
            state.portPrices[i] +
            '!!'
        } else {
          state.portPrices[i] *= fR(5) + 5
          elements['message'].innerHTML =
            comp$ +
            t$ +
            '!!&nbsp; The price of ' +
            state.goods[i][0] +
            ' has risen to ' +
            state.portPrices[i] +
            '!!'
        }
        fnKeyInput()
        state.delayTicks = 10
        state.nextLine = 'R-PRICE'
        break
      case 'ROBBED':
        i = Mf(state.cash / 1.4)
        elements['message'].innerHTML =
          comp$ + "You've been beaten up and robbed of " + fnFC(i) + ' in cash, ' + t$ + '!!'
        state.cash -= i
        elements['CA'].innerHTML = fnFC(state.cash)
        fnKeyInput()
        state.delayTicks = 18
        state.nextLine = 'R-ROBBED'
        break
      case 'B1':
        state.allowedInput = [1, 'B2', 'O', 'S', 'A', 'G']
        elements['message'].innerHTML =
          state.priceTableHtml +
          '<span class="cap">W</span>hat do you wish me to buy, ' +
          t$ +
          '? <span id="input"></span><span id="cursor">_</span>'
        fnKeyInput()
        break
      case 'B2':
        state.allowedInput = [6, 'B3', 'A', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9']
        if (input[2] == 'O') state.selectedGood = 0
        else if (input[2] == 'S') state.selectedGood = 1
        else if (input[2] == 'A') state.selectedGood = 2
        else state.selectedGood = 3
        state.affordableUnits = Mf(state.cash / state.portPrices[state.selectedGood])
      case 'B2a':
        elements['message'].innerHTML =
          state.priceTableHtml +
          '<span class="cap">H</span>ow much ' +
          state.goods[state.selectedGood][0] +
          ' shall<br/><span class="cap">I</span> buy, ' +
          t$ +
          '? <span id="input"></span><span id="cursor">_</span>' +
          '<span class="afford">You can<br/>afford<br/>' +
          state.affordableUnits +
          '</span>'
        fnKeyInput()
        break
      case 'B3':
        amount = input[2] == 'A' ? state.affordableUnits : +input[2]
        if (amount <= state.affordableUnits) {
          state.holdRoom -= amount
          elements['MW'].innerHTML = state.holdRoom >= 0 ? String(state.holdRoom) : overload$
          state.cash -= state.portPrices[state.selectedGood] * amount
          elements['CA'].innerHTML = fnFC(state.cash)
          state.cargo[1][state.selectedGood] += amount
          elements['h' + state.selectedGood].innerHTML = String(state.cargo[1][state.selectedGood])
          state.nextLine = 'PORT2'
        } else state.nextLine = 'B2a'
        state.delayTicks = 0
        break
      case 'S1':
        state.allowedInput = [1, 'S2', 'O', 'S', 'A', 'G']
        elements['message'].innerHTML =
          state.priceTableHtml +
          '<span class="cap">W</span>hat do you wish me to sell, ' +
          t$ +
          '? <span id="input"></span><span id="cursor">_</span>'
        fnKeyInput()
        break
      case 'S2':
        state.allowedInput = [6, 'S3', 'A', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9']
        if (input[2] == 'O') state.selectedGood = 0
        else if (input[2] == 'S') state.selectedGood = 1
        else if (input[2] == 'A') state.selectedGood = 2
        else state.selectedGood = 3
      case 'S2a':
        elements['message'].innerHTML =
          state.priceTableHtml +
          '<span class="cap">H</span>ow much ' +
          state.goods[state.selectedGood][0] +
          ' shall<br/><span class="cap">I</span> sell, ' +
          t$ +
          '? <span id="input"></span><span id="cursor">_</span>'
        fnKeyInput()
        break
      case 'S3':
        amount = input[2] == 'A' ? state.cargo[1][state.selectedGood] : +input[2]
        if (amount <= state.cargo[1][state.selectedGood]) {
          state.holdRoom += amount
          elements['MW'].innerHTML = state.holdRoom >= 0 ? String(state.holdRoom) : overload$
          state.cash += state.portPrices[state.selectedGood] * amount
          elements['CA'].innerHTML = fnFC(state.cash)
          state.cargo[1][state.selectedGood] -= amount
          elements['h' + state.selectedGood].innerHTML = String(state.cargo[1][state.selectedGood])
          state.nextLine = 'PORT2'
        } else state.nextLine = 'S2a'
        state.delayTicks = 0
        break
      case 'OVERLOAD':
        elements['message'].innerHTML =
          comp$ + '<span class="cap">Y</span>our ship is overloaded, ' + t$ + '!!'
        state.delayTicks = 16
        state.nextLine = 'PORT2'
        fnKeyInput()
        break
      case 'V1':
        state.allowedInput = [9, 'V2', 'A', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9']
        elements['message'].innerHTML =
          comp$ +
          '<span class="cap">H</span>ow much will you deposit? <span id="input"></span><span id="cursor">_</span>'
        fnKeyInput()
        break
      case 'V2':
        amount = input[2] == 'A' ? state.cash : +input[2]
        if (amount > state.cash) {
          elements['message'].innerHTML +=
            '<br/><br/>' + t$ + ', you have only ' + fnFC(state.cash) + '<br/>in cash.'
          state.delayTicks = 24
          state.nextLine = 'V1'
          fnKeyInput()
          cursor[0] = null
          break
        } else {
          state.cash -= amount
          state.bank += amount
          fRP()
        }
      case 'V3':
        state.allowedInput = [9, 'V4', 'A', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9']
        elements['message'].innerHTML =
          comp$ +
          '<span class="cap">H</span>ow much will you withdraw? <span id="input"></span><span id="cursor">_</span>'
        fnKeyInput()
        break
      case 'V4':
        amount = input[2] == 'A' ? state.bank : +input[2]
        if (amount > state.bank) {
          elements['message'].innerHTML +=
            '<br/><br/>' + t$ + ', you have only ' + fnFC(state.bank) + '<br/>in the bank.'
          state.delayTicks = 24
          state.nextLine = 'V3'
          fnKeyInput()
          cursor[0] = null
          break
        } else {
          state.bank -= amount
          state.cash += amount
          fRP()
        }
        state.nextLine = 'PORT2'
        state.delayTicks = 0
        break
      case 2620:
      case 2622:
        {
          let cargoTotal = 0
          for (state.transferFrom = 0; state.transferFrom < 2; state.transferFrom++) {
            for (state.transferGood = 0; state.transferGood < 4; state.transferGood++) {
              cargoTotal += state.cargo[state.transferFrom][state.transferGood]
            }
          }
          if (cargoTotal == 0) {
            elements['message'].innerHTML =
              state.priceTableHtml + '<span class="cap">Y</span>ou have no cargo, ' + t$ + '.'
            state.delayTicks = 12
            state.nextLine = 'PORT2'
            fnKeyInput()
            break
          }
        }
        state.transferFrom = 2
        state.transferGood = 0
      case 2624:
        do {
          state.transferFrom--
          if (state.transferFrom < 0) {
            if (state.transferGood < 3) {
              state.transferFrom = 1
              state.transferGood++
            } else {
              state.nextLine = 'PORT2'
              state.delayTicks = 0
              touch()
              return
            }
          }
        } while (state.cargo[state.transferFrom][state.transferGood] == 0)
      case 2626:
        elements['message'].innerHTML =
          comp$ +
          '<span class="cap">H</span>ow much ' +
          state.goods[state.transferGood][0] +
          ' shall <span class="cap">I</span> move<br />' +
          (state.transferFrom == 0 ? 'aboard ship' : 'to the warehouse') +
          ', ' +
          t$ +
          '? <span id="input"></span><span id="cursor">_</span>'
        state.allowedInput = [5, 2628, 'A', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9']
        fnKeyInput()
        break
      case 2628:
        amount = input[2] == 'A' ? state.cargo[state.transferFrom][state.transferGood] : +input[2]
        if (state.transferFrom == 1 && amount > 0 && state.warehouseFree == 0) {
          elements['message'].innerHTML += '<br/><br/>Your warehouse is full, ' + t$ + '!'
          state.delayTicks = 10
          state.nextLine = 2626
          fnKeyInput()
          cursor[0] = null
          break
        }
        if (state.transferFrom == 1 && amount > state.warehouseFree) {
          elements['message'].innerHTML +=
            '<br/><br/>Your warehouse will only hold an<br />additional ' +
            fnFC(state.warehouseFree) +
            ', ' +
            t$ +
            '!'
          state.delayTicks = 10
          state.nextLine = 2626
          fnKeyInput()
          cursor[0] = null
          break
        }
        if (amount > state.cargo[state.transferFrom][state.transferGood]) {
          elements['message'].innerHTML +=
            '<br/><br/>You have only ' +
            fnFC(state.cargo[state.transferFrom][state.transferGood]) +
            ', ' +
            t$ +
            '.'
          state.delayTicks = 10
          state.nextLine = 2626
          fnKeyInput()
          cursor[0] = null
          break
        }
        state.cargo[state.transferFrom][state.transferGood] -= amount
        if (state.transferFrom == 0) {
          state.cargo[1][state.transferGood] += amount
          state.warehouseUsed -= amount
          state.warehouseFree += amount
          state.holdRoom -= amount
        } else {
          state.cargo[0][state.transferGood] += amount
          state.warehouseUsed += amount
          state.warehouseFree -= amount
          state.holdRoom += amount
        }
        elements['w' + state.transferGood].innerHTML = fnFC(state.cargo[0][state.transferGood])
        elements['h' + state.transferGood].innerHTML = fnFC(state.cargo[1][state.transferGood])
        elements['WS'].innerHTML = fnFC(state.warehouseUsed)
        elements['WC'].innerHTML = fnFC(state.warehouseFree)
        elements['MW'].innerHTML = state.holdRoom >= 0 ? String(state.holdRoom) : overload$
        state.nextLine = 2624
        state.delayTicks = 0
        break
      case 2695:
        elements['message'].innerHTML =
          '<br /><div class="millionaire"><span class="cap">Y</span> o&nbsp;u &nbsp;\' &nbsp;r &nbsp;e &nbsp; &nbsp;a<br /><br /><span class="cap">M &nbsp; I &nbsp; L &nbsp; L &nbsp; I &nbsp; O &nbsp; N &nbsp; A &nbsp; I &nbsp; R &nbsp; E &nbsp; !</span></div>'
        fnKeyInput()
        state.delayTicks = 18
        state.nextLine = 20000
        break
      case 'NOTYET':
        elements['message'].innerHTML = comp$ + t$ + ", that command hasn't yet been implemented!"
        state.delayTicks = 6
        state.nextLine = 'PORT2'
        fnKeyInput()
        break
      case 'Q1':
        state.allowedInput = [1, 'Q2', '1', '2', '3', '4', '5', '6', '7']
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
        if (input[2] == state.location) {
          elements['message'].innerHTML +=
            '<br/><span class="cap">Y</span>ou\'re already here, ' + t$ + '.'
          fnKeyInput()
          cursor[0] = null
          state.delayTicks = 16
          state.nextLine = 'Q1'
          break
        }
      case 3030:
        elements['location'].innerHTML = cities[0]
        state.location = input[2]
        elements['message'].innerHTML = capt$
        fnKeyInput()
        state.delayTicks = 2
        state.nextLine = 3100
        break
      case 3100:
        if (fR(state.pirateRarity) == 0) {
          state.enemyShips = fR(state.shipCapacity / 10 + state.guns) + 1
          state.attackerKind = 1
          elements['message'].innerHTML =
            capt$ +
            state.enemyShips +
            ' hostile ship' +
            (state.enemyShips > 1 ? 's' : '') +
            ' approaching, ' +
            t$ +
            '!!'
          fnKeyInput()
          state.delayTicks = 10
          state.nextLine = 5000
          break
        }
        if (fR(4 + 8 * state.liFavor) == 0) {
          elements['message'].innerHTML =
            capt$ +
            '<span class="cap">L</span>i <span class="cap">Y</span>uen\'s pirates, ' +
            t$ +
            '!!'
          fnKeyInput()
          state.delayTicks = 4
          state.nextLine = 3230
          break
        }
        state.nextLine = 3300
        state.delayTicks = 0
        break
      case 3230:
        if (state.liFavor > 0) {
          elements['message'].innerHTML +=
            '<br /><br /><span class="cap">G</span>ood joss!! <span class="cap">T</span>hey let us be!!'
          fnKeyInput()
          state.delayTicks = 6
          state.nextLine = 3300
          break
        } else {
          state.enemyShips = fR(state.shipCapacity / 5 + state.guns) + 5
          state.attackerKind = 2
          elements['message'].innerHTML +=
            '<br /><br />' +
            state.enemyShips +
            ' ship' +
            (state.enemyShips > 1 ? 's' : '') +
            ' of <span class="cap">L</span>i <span class="cap">Y</span>uen\'s pirate<br />fleet, ' +
            t$ +
            '!!'
          fnKeyInput()
          state.delayTicks = 6
          state.nextLine = 5000
          break
        }
      case 3300:
        if (fR(10) == 0) {
          elements['message'].innerHTML =
            capt$ + '<span class="cap">S</span>' + 'torm, ' + t$ + '!!'
          fnKeyInput()
          state.delayTicks = 4
          state.nextLine = 3320
          break
        } else {
          fnKeyInput()
          state.delayTicks = 0
          state.nextLine = 'ARR1'
          break
        }
      case 3320:
        if (fR(30) == 0) {
          elements['message'].innerHTML +=
            '<br /><br />&nbsp; &nbsp;<span class="cap">I</span> think we\'re going down!!'
          fnKeyInput()
          state.delayTicks = 4
          state.nextLine = 'STORM'
          break
        } else {
          fnKeyInput()
          state.delayTicks = 0
          state.nextLine = 3330
          break
        }
      case 'STORM':
        if (fR((state.damage / state.shipCapacity) * 3) == 0) {
          elements['message'].innerHTML +=
            '<br /><br /><span class="cap">W</span>' + "e're going down, " + t$ + '!!'
          fnKeyInput()
          state.delayTicks = 4
          state.nextLine = 20000
          break
        }
      case 3330:
        elements['message'].innerHTML +=
          '<br /><br />&nbsp; &nbsp; <span class="cap">W</span>e made it!!'
        fnKeyInput()
        state.delayTicks = 4
        state.nextLine = 3340
        break
      case 3340:
        if (fR(3) == 0) {
          const previousLocation = Number(state.location)
          while (Number(state.location) == previousLocation) state.location = fR(7) + 1
          elements['message'].innerHTML =
            capt$ + "We've been blown off course<br />to " + cities[state.location as number]
          fnKeyInput()
          state.delayTicks = 4
          state.nextLine = 'ARR1'
          break
        }
      case 'ARR1':
        elements['message'].innerHTML =
          capt$ + '<span class="cap">A</span>rriving at ' + cities[state.location as number]
        fnKeyInput()
        state.delayTicks = 8
        state.nextLine = 'ARR2'
        break
      case 'ARR2':
        elements['message'].innerHTML = comp$
        elements['location'].innerHTML = cities[state.location as number]
        fnKeyInput()
        state.delayTicks = 4
        state.nextLine = 1000
        break
      case 5000:
        state.battleOrder = 0
        state.escapeOdds = 3
        state.escapeStep = 1
        state.enemyShipsAtStart = state.enemyShips
        state.booty =
          fR((state.monthsElapsed / 4) * 1000 * Mp(state.enemyShips, 1.05)) + fR(1000) + 250
        state.shipsOnScreen = 0
        for (i = 0; i < 10; i++) state.enemySlots[i][0] = 0
        elements['SN'].innerHTML = String(state.enemyShips)
        elements['GNs'].innerHTML = String(state.guns)
        elements['S4'].style.display = 'none'
        elements['S5'].style.display = 'block'
        elements['f2'].innerHTML =
          '<span class="cap">Y</span>our orders are to: <span id="input"></span><span id="cursor">_</span>'
      case 5060: {
        const seaworthiness = 100 - Mf((state.damage / state.shipCapacity) * 100)
        elements['f4'].innerHTML =
          '<span class="cap">C</span>urrent seaworthiness: &nbsp;' +
          sstatus[Mf(seaworthiness / 20)] +
          ' (' +
          seaworthiness +
          '%)'
      }
      case 5100:
        fnAddShips()
        state.allowedInput = false
        state.keyChoice = [1, 5160, 'F', 'R']
        state.delayTicks = state.battleOrder == 0 ? 12 : 4
        state.nextLine = 5190
        fnKeyInput()
        break
      case 5160:
        state.battleOrder = input[2]
        if (state.battleOrder == 'F') state.battleOrderHtml = '<span class="cap">F</span>ight'
        else if (state.battleOrder == 'R') state.battleOrderHtml = '<span class="cap">R</span>un'
        else state.battleOrderHtml = '<span class="cap">T</span>hrow cargo'
        elements['f2'].innerHTML =
          '<span class="cap">Y</span>our orders are to: ' + state.battleOrderHtml
      case 5190:
        if (state.battleOrder == 'R') state.nextLine = 5200
        else if (state.battleOrder == 'F') state.nextLine = 5300
        else if (state.battleOrder == 'T') state.nextLine = 5400
        else elements['f4'].innerHTML = t$ + ', what shall we do?? (Fight, Run)'
        state.delayTicks = 0
        break
      case 5200:
        state.keyChoice = false
        elements['f4'].innerHTML = '<span class="cap">A</span>ye, we\'ll run, ' + t$ + '!'
        fnKeyInput()
        state.delayTicks = 4
        state.nextLine = 5210
        break
      case 5210:
        state.escapeOdds += state.escapeStep++
        if (fR(state.escapeOdds) > fR(state.enemyShips)) {
          state.escapeOdds = 3
          elements['f4'].innerHTML = '<span class="cap">W</span>e got away from \'em, ' + t$ + '!!'
          fnKeyInput()
          state.delayTicks = 4
          state.nextLine = 5900
          break
        }
      case 5220:
        elements['f4'].innerHTML = '<span class="cap">C</span>an\'t lose \'em!!'
        fnKeyInput()
        state.delayTicks = 4
        state.nextLine = 5230
        break
      case 5230:
        if (state.enemyShips > 2 && fR(5) == 0) {
          const escaped = Mf(fR(state.enemyShips / 2) + 1)
          state.enemyShips -= escaped
          elements['SN'].innerHTML = String(state.enemyShips)
          if (state.shipsOnScreen > state.enemyShips) fnRemoveShips()
          elements['f4'].innerHTML =
            '<span class="cap">B</span>ut we escaped from ' + escaped + " of 'em, " + t$ + '!'
          fnKeyInput()
          state.delayTicks = 4
          state.nextLine = 5500
          break
        } else {
          state.delayTicks = 0
          state.nextLine = 5500
          break
        }
      case 5300:
        state.keyChoice = false
        if (state.guns == 0) {
          elements['f4'].innerHTML = '<span class="cap">W</span>e have no guns, ' + t$ + '!!'
          fnKeyInput()
          state.delayTicks = 4
          state.nextLine = 5500
          break
        }
        state.gunsFired = 0
        elements['f4'].innerHTML = '<span class="cap">A</span>ye, we\'ll fight \'em, ' + t$ + '!'
        fnKeyInput()
        state.delayTicks = 4
        state.nextLine = 5310
        break
      case 5310:
        state.shipsSunk = 0
        elements['f4'].innerHTML = '<span class="cap">W</span>e\'re firing on \'em, ' + t$ + '!'
      case 5320:
        if (state.shipsOnScreen == 0) fnAddShips()
        if (state.enemyShips > 0 && ++state.gunsFired <= state.guns) {
          do shot = fR(10)
          while (state.enemySlots[shot][0] == 0)
        } else {
          fnKeyInput()
          state.delayTicks = 0
          state.nextLine = 5340
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
        state.enemySlots[shot][1] += fR(30) + 10
        if (state.enemySlots[shot][1] > state.enemySlots[shot][0]) {
          state.enemySlots[shot][0] = 0
          state.enemySlots[shot][1] = 0
          state.enemyShips--
          state.shipsOnScreen--
          state.shipsSunk++
          fnSink(shot, 0, fR(20) == 0 ? 40 : 20)
          break
        }
        fnKeyInput()
        state.delayTicks = 2
        state.nextLine = 5320
        break
      case 5340:
        if (state.shipsSunk)
          elements['f4'].innerHTML =
            '<span class="cap">S</span>unk ' + state.shipsSunk + ' of the buggers, ' + t$ + '!'
        else
          elements['f4'].innerHTML =
            "<span class=\"cap\">H</span>it 'em, but didn't sink 'em, " + t$ + '!'
        fnKeyInput()
        state.delayTicks = 4
        state.nextLine = 5360
        break
      case 5360:
        if (
          fR(state.enemyShipsAtStart) < (state.enemyShips * 0.6) / state.attackerKind ||
          state.enemyShips == 0 ||
          state.enemyShips == state.enemyShipsAtStart ||
          state.enemyShips < 3
        ) {
          fnKeyInput()
          state.delayTicks = 0
          state.nextLine = 5500
          break
        }
        {
          const escaped = Mf(fR(state.enemyShips / 3 / state.attackerKind) + 1)
          state.enemyShips -= escaped
          elements['SN'].innerHTML = String(state.enemyShips)
          if (state.shipsOnScreen > state.enemyShips) fnRemoveShips()
          elements['f4'].innerHTML = escaped + ' ran away, ' + t$ + '!'
          fnKeyInput()
          state.delayTicks = 4
          state.nextLine = 5500
        }
        break
      case 5400:
        state.keyChoice = false
      case 5500:
        if (state.enemyShips == 0) {
          state.escapeOdds = 1
          elements['f4'].innerHTML = '<span class="cap">W</span>e got \'em all, ' + t$ + '!!'
          fnKeyInput()
          state.delayTicks = 4
          state.nextLine = 5900
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
        state.delayTicks = 4
        state.nextLine = 5510
        break
      case 5510:
        elements['f4'].innerHTML = '<span class="cap">W</span>e\'ve been hit, ' + t$ + '!!'
        fnKeyInput()
        state.delayTicks = 4
        state.nextLine = 5540
        break
      case 5540:
        state.incomingFire = state.enemyShips > 15 ? 15 : state.enemyShips
        if (
          state.guns > 0 &&
          (fR(100) < (state.damage / state.shipCapacity) * 100 ||
            (state.damage / state.shipCapacity) * 100 > 80)
        ) {
          state.incomingFire = 1
          state.guns--
          state.holdRoom += 10
          elements['GNs'].innerHTML = String(state.guns)
          elements['f4'].innerHTML = '<span class="cap">T</span>he buggers hit a gun, ' + t$ + '!!'
          fnKeyInput()
          state.delayTicks = 4
          state.nextLine = 5550
          break
        }
      case 5550:
        state.damage +=
          fR(state.enemyDamage * state.incomingFire * state.attackerKind) + state.incomingFire / 2
        if (state.damage > state.shipCapacity) {
          fnKeyInput()
          state.delayTicks = 0
          state.nextLine = 20000
          break
        }
        fnKeyInput()
        state.delayTicks = 0
        state.nextLine = 5060
        break
      case 5800:
        elements['SN'].innerHTML = String(state.enemyShips)
        state.delayTicks = 2
        state.nextLine = 5320
        break
      case 5900:
        if (state.battleOrder == 'F') {
          state.cash += state.booty
          elements['message'].innerHTML =
            '<br /><br /><span class="cap">W</span>e\'ve captured some booty.<br />It\'s worth ' +
            fnFC(state.booty) +
            '!'
        } else
          elements['message'].innerHTML =
            '<br /><br /><span class="cap">W</span>e made it, ' + t$ + '!'
        fRP()
        elements['S5'].style.display = 'none'
        elements['S4'].style.display = 'block'
        state.keyChoice = false
        fnKeyInput()
        state.delayTicks = 10
        state.nextLine = 3300
        break
      case 10000:
      case 10120:
        elements['S2b'].innerHTML = '<span id="input"></span><span id="cursor">_</span>'
        state.firmNameLimit = 22
        fnKeyInput()
        break
      case 10130:
        if (input[2] == '') {
          state.delayTicks = 0
          state.nextLine = 10120
          break
        }
        elements['H'].innerHTML = input[2]
        state.firmName = input[2]
        elements['S2'].style.display = 'none'
        elements['S2b'].innerHTML = ''
        elements['S3'].style.display = 'block'
      case 10140:
        elements['S3b'].innerHTML = '<span id="input"></span><span id="cursor">_</span>'
        state.allowedInput = [1, 10150, '1', '2']
        fnKeyInput()
        break
      case 10150:
        if (input[2] == '1') {
          state.debt = 5000
          state.cash = 400
          state.holdRoom = 60
          state.guns = 0
          state.pirateRarity = 10
        } else {
          state.debt = 0
          state.cash = 0
          state.holdRoom = 10
          state.guns = 5
          state.pirateRarity = 7
        }
        state.nextLine = 1030
        elements['S3'].style.display = 'none'
        elements['S3b'].innerHTML = ''
        elements['S4'].style.display = 'block'
        break
      case 20000: {
        const netWorth = state.cash + state.bank - state.debt
        elements['CAf'].innerHTML = fnFC(netWorth)
        elements['SCf'].innerHTML = String(state.shipCapacity)
        elements['GNf'].innerHTML = String(state.guns)
        state.yearsPlayed = Mf(state.monthsElapsed / 12)
        elements['YEARSf'].innerHTML = state.yearsPlayed + ' year'
        if (state.yearsPlayed != 1) elements['YEARSf'].innerHTML += 's'
        state.monthsPlayed = state.monthsElapsed - state.yearsPlayed * 12
        elements['MONTHSf'].innerHTML = state.monthsPlayed + ' month'
        if (state.monthsPlayed != 1) elements['MONTHSf'].innerHTML += 's'
        const score = Mf(netWorth / 100 / Mp(state.monthsElapsed, 1.1))
        elements['SCOREf'].innerHTML = String(score)
        if (score < 500) elements['SCORE1f'].className = 'inverse'
        else if (score < 1000) elements['SCORE2f'].className = 'inverse'
        else if (score < 8000) elements['SCORE3f'].className = 'inverse'
        else if (score < 50000) elements['SCORE4f'].className = 'inverse'
        else elements['SCORE5f'].className = 'inverse'
        elements['S4'].style.display = 'none'
        elements['S5'].style.display = 'none'
        elements['S6'].style.display = 'block'
        endGame = true
        break
      }
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
