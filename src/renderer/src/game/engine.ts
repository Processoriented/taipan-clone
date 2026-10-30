import type { GameState, Line } from '../../../shared/save'
import type { GameView, RichNode } from '../../../shared/view'
import { formatMoney, seaworthinessLine } from './format'
import {
  afford,
  br,
  cap,
  captain,
  cityNodes,
  comprador,
  goodNodes,
  millionaire,
  nodes,
  portMenu,
  priceTable,
  prompt,
  taipan
} from './richText'
import { createEmptyView, viewFromLegacyHtml } from './view'

const M = Math
const Mf = M.floor
const Mm = M.min
const Mp = M.pow
const Mr = M.random

export type GameHooks = {
  persist: (state: GameState) => void
  markDone: (state: GameState) => void
  flush: (state: GameState) => void
  onFrame: () => void
}

export function startGame(state: GameState, hooks: GameHooks): () => void {
  const pending = new Set<number>()
  let inputValue = state.inputText
  let inputLen = state.inputText.length

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

  function ensureView(): GameView {
    if (!state.view) {
      state.view = state.viewHtml ? viewFromLegacyHtml(state.viewHtml) : createEmptyView()
    }
    return state.view
  }

  function show(screen: GameView['screen']): GameView {
    const view = ensureView()
    view.screen = screen
    return view
  }

  function containsInput(list: RichNode[]): boolean {
    return list.some((node) => node.kind === 'input')
  }

  function say(list: RichNode[]): void {
    const view = ensureView()
    view.message = list
    view.inputSlot = containsInput(list) ? 'message' : 'none'
  }

  function add(list: RichNode[]): void {
    ensureView().message.push(...list)
  }

  function setLine2(list: RichNode[]): void {
    const view = ensureView()
    view.battleLine2 = list
    if (containsInput(list)) view.inputSlot = 'battle'
    else if (view.inputSlot === 'battle') view.inputSlot = 'none'
  }

  function setLine4(list: RichNode[]): void {
    ensureView().battleLine4 = list
  }

  function hideCursor(): void {
    if (state.view) state.view.cursor = false
  }

  function publish(): void {
    hooks.onFrame()
  }

  function touch(endGame = false): void {
    state.inputText = inputValue
    if (state.view) delete state.viewHtml
    if (endGame) hooks.markDone(state)
    else hooks.persist(state)
    hooks.onFrame()
  }

  function onBeforeUnload(): void {
    state.inputText = inputValue
    if (state.view) delete state.viewHtml
    hooks.flush(state)
  }

  function later(fn: () => void, ms: number): void {
    const id = window.setTimeout(() => {
      pending.delete(id)
      fn()
    }, ms)
    pending.add(id)
  }

  function fnTimer(): void {
    if (state.delayTicks > 0) state.delayTicks--
    if (state.nextLine != '' && state.delayTicks == 0) fnMain(state.nextLine)
  }

  function fnKeyInput(): void {
    inputValue = ''
    inputLen = 0
    state.inputText = ''
    if (state.view) state.view.cursor = state.view.inputSlot !== 'none'
  }

  function fR(i: number): number {
    return Mf(Mr() * i)
  }

  function portPrice(good: number): number {
    return Number(state.goods[good][state.location as number])
  }

  function good(index: number): RichNode[] {
    return goodNodes(String(state.goods[index][0]))
  }

  function resetShips(): void {
    const view = ensureView()
    view.ships = Array.from({ length: 10 }, () => ({
      present: false,
      sinkY: 0,
      muzzle: false,
      damageFrame: null
    }))
    view.showExtraShips = false
    view.enemyFlash = false
  }

  function fnAddShips(): void {
    const view = ensureView()
    for (let i = 0; i < 10; i++) {
      if (state.shipsOnScreen < state.enemyShips && state.enemySlots[i][0] == 0) {
        state.enemySlots[i][0] = fR(state.enemyStrength) + 20
        state.enemySlots[i][1] = 0
        state.shipsOnScreen++
        view.ships[i] = { present: true, sinkY: 0, muzzle: false, damageFrame: null }
      } else if (state.enemySlots[i][0] == 0) {
        view.ships[i] = { present: false, sinkY: 0, muzzle: false, damageFrame: null }
      }
    }
    view.showExtraShips = state.shipsOnScreen < state.enemyShips
  }

  function fnRemoveShips(): void {
    const view = ensureView()
    for (let i = 9; i >= 0; i--) {
      if (state.shipsOnScreen > state.enemyShips && state.enemySlots[i][0]) {
        state.enemySlots[i][0] = 0
        state.enemySlots[i][1] = 0
        state.shipsOnScreen--
        view.ships[i].present = false
        view.ships[i].sinkY = 0
        view.ships[i].muzzle = false
        view.ships[i].damageFrame = null
      }
    }
    if (state.shipsOnScreen <= state.enemyShips) view.showExtraShips = false
  }

  function fnFire(ship: number, visible: boolean): void {
    const slot = state.view?.ships[ship]
    if (slot) slot.muzzle = visible
    publish()
  }

  function fnEnemyFire(visible: boolean): void {
    if (state.view) state.view.enemyFlash = visible
    publish()
  }

  function fnSink(ship: number, px: number, sinkDelay: number): void {
    state.resumeLine = 5800
    if (px == 0) {
      px = 1
      later(() => fnSink(ship, px, sinkDelay), 500)
      return
    }
    const slot = state.view?.ships[ship]
    if (slot) slot.sinkY = px
    publish()
    px++
    if (px < 84) later(() => fnSink(ship, px, sinkDelay), sinkDelay)
    else {
      if (slot) {
        slot.present = false
        slot.sinkY = 0
        slot.muzzle = false
        slot.damageFrame = null
      }
      publish()
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
      if (inputLen > 0) {
        inputValue = inputValue.substring(0, inputValue.length - 1)
        inputLen--
        state.inputText = inputValue
        touch()
      }
    } else if (state.keyChoice) {
      if (key >= 96 && key <= 105) key -= 48
      const inchar = String.fromCharCode(key)
      for (let n = 2; n < state.keyChoice.length; n++) {
        if (inchar == state.keyChoice[n]) {
          inputValue = inchar
          inputLen = 1
          state.inputText = inputValue
          hideCursor()
          fnMain(state.keyChoice[1])
        }
      }
    } else if (key == 13 && state.allowedInput && inputLen > 0) {
      hideCursor()
      fnMain(state.allowedInput[1])
    } else if (state.allowedInput) {
      if (key >= 96 && key <= 105) key -= 48
      const inchar = String.fromCharCode(key)
      for (let n = 2; n < state.allowedInput.length; n++) {
        if (inputLen < state.allowedInput[0] && inchar == state.allowedInput[n]) {
          inputValue += inchar
          inputLen++
          state.inputText = inputValue
          touch()
        }
      }
    } else if (state.firmNameLimit) {
      const limit = state.firmNameLimit
      if (key == 13 && inputLen > 0) {
        state.firmNameLimit = false
        fnMain(10130)
      }
      if (key < 32 || key > 120) return
      if (key >= 96 && key <= 105) key -= 48
      const inchar = String.fromCharCode(key)
      if (inputLen < limit) {
        inputValue += inchar
        inputLen++
        state.inputText = inputValue
        touch()
      }
    }
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
          say(
            nodes(
              comprador(),
              cap('Li'),
              ' ',
              cap('Yuen'),
              ' asks ',
              formatMoney(state.liDonation),
              ' in donation',
              br,
              'to the temple of ',
              cap('Tin'),
              ' ',
              cap('Hau'),
              ', the ',
              cap('Sea'),
              br,
              cap('Goddess'),
              '. ',
              cap('Will'),
              ' you pay? ',
              prompt
            )
          )
          state.allowedInput = [1, 1060, 'Y', 'N']
          fnKeyInput()
          break
        }
      case 1060:
        if (line == 1060 && inputValue == 'Y') {
          state.cash -= state.liDonation
          if (state.cash >= 0) {
            state.liFavor = 1
          } else {
            say(
              nodes(
                comprador(),
                taipan(),
                ', you do not have enough cash!!',
                br,
                br,
                cap('Do'),
                ' you want ',
                cap('Elder'),
                ' ',
                cap('Brother'),
                ' ',
                cap('Wu'),
                ' to make up',
                br,
                'the difference for you? ',
                prompt
              )
            )
            state.allowedInput = [1, 1080, 'Y', 'N']
            fnKeyInput()
            break
          }
        }
      case 1080:
        if (line == 1080) {
          if (inputValue == 'Y') {
            state.debt -= state.cash
            state.liFavor = 1
            say(
              nodes(
                comprador(),
                cap('Elder'),
                ' ',
                cap('Brother'),
                ' has given ',
                cap('Li'),
                ' ',
                cap('Yuen'),
                ' the ',
                br,
                'difference between what he wanted and',
                br,
                'your cash on hand and added the same',
                br,
                'amount to your debt.'
              )
            )
          } else {
            say(
              nodes(
                comprador(),
                cap('Very'),
                ' well. ',
                cap('Elder'),
                ' ',
                cap('Brother'),
                ' ',
                cap('Wu'),
                ' will not pay',
                br,
                cap('Li'),
                ' ',
                cap('Yuen'),
                ' the difference. ',
                cap('I'),
                ' would be very',
                br,
                'wary of pirates if ',
                cap('I'),
                ' were you, ',
                taipan(),
                '.'
              )
            )
          }
          state.cash = 0
          fnKeyInput()
          state.delayTicks = 10
          state.nextLine = 1120
          break
        }
      case 1120:
        if (state.location == 1 && state.damage > 0) {
          say(
            nodes(
              comprador(),
              taipan(),
              ', ',
              cap('Mc'),
              ' ',
              cap('Henry'),
              ' from the ',
              cap('Hong'),
              ' ',
              cap('Kong'),
              br,
              cap('Shipyards'),
              ' has arrived! ',
              cap('He'),
              " says, 'I see",
              br,
              "ye've a wee bit of damage to yer ship.",
              br,
              cap('Will'),
              " ye be wanting repairs?' ",
              prompt
            )
          )
          state.allowedInput = [1, 1130, 'Y', 'N']
          fnKeyInput()
          break
        } else {
          state.nextLine = 1210
          state.delayTicks = 0
          break
        }
      case 1130:
        if (inputValue == 'N') {
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
        say(
          nodes(
            comprador(),
            cap('Och'),
            ", 'tis a pity to be ",
            Mf((state.damage / state.shipCapacity) * 100),
            '% damaged.',
            br,
            cap('We'),
            ' can fix yer whole ship for ',
            formatMoney(state.repairCost),
            br,
            'or make partial repairs if you wish.',
            br,
            cap('How'),
            ' much will ye spend? ',
            prompt
          )
        )
        state.allowedInput = [9, 1150, 'A', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9']
        fnKeyInput()
        break
      case 1150:
        if (inputValue == 'A') {
          amount = state.repairCost
          if (state.cash < amount) amount = state.cash
        } else amount = +inputValue
        if (state.cash < amount) {
          say(nodes(comprador(), taipan(), ', you do not have enough cash!!'))
          fnKeyInput()
          hideCursor()
          state.delayTicks = 6
          state.nextLine = 1145
          break
        }
        {
          const damageRepaired = Mf((state.damage * amount) / state.repairCost)
          state.damage = damageRepaired <= state.damage ? state.damage - damageRepaired : 0
        }
        state.cash -= amount
      case 1210:
      case 1300:
        if (state.location == 1) {
          say(
            nodes(
              comprador(),
              cap('Do'),
              ' you have business with ',
              cap('Elder'),
              ' ',
              cap('Brother'),
              br,
              cap('Wu'),
              ', the moneylender? ',
              prompt
            )
          )
          state.allowedInput = [1, 1310, 'Y', 'N']
          fnKeyInput()
          break
        } else {
          state.nextLine = 1500
          state.delayTicks = 0
          break
        }
      case 1310:
        if (inputValue == 'N') {
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
        say(nodes(comprador(), cap('How'), ' much do you wish to repay', br, 'him? ', prompt))
        state.allowedInput = [9, 1380, 'A', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9']
        fnKeyInput()
        break
      case 1380:
        amount = inputValue == 'A' ? state.cash : +inputValue
        if (state.cash >= amount) {
          state.cash -= amount
          state.debt -= amount
        } else {
          add(
            nodes(br, br, br, taipan(), ', you have only ', formatMoney(state.cash), br, 'in cash.')
          )
          fnKeyInput()
          state.nextLine = 1370
          state.delayTicks = 10
          break
        }
      case 1400:
        say(nodes(comprador(), cap('How'), ' much do you wish to', br, 'borrow? ', prompt))
        state.allowedInput = [9, 1420, '0', '1', '2', '3', '4', '5', '6', '7', '8', '9']
        fnKeyInput()
        break
      case 1420:
        i = +inputValue
        if (state.cash * 2 >= i) {
          state.cash += i
          state.debt += i
        } else {
          add(nodes(br, br, br, cap('He'), " won't loan you so much, ", taipan(), '!'))
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
          state.cargo[1][0] = 0
          state.cash -= i
          say(
            nodes(
              comprador(),
              'Bad Joss!!',
              br,
              'The local authorities have seized your',
              br,
              cap('Opium'),
              ' cargo and have also fined you',
              br,
              formatMoney(i),
              ', ',
              taipan(),
              '!'
            )
          )
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
          say(
            nodes(
              comprador(),
              cap('Li'),
              ' ',
              cap('Yuen'),
              ' has sent a lieutenant,',
              br,
              taipan(),
              '. ',
              cap('He'),
              ' says his admiral wishes',
              br,
              'to see you in ',
              cap('Hong'),
              ' ',
              cap('Kong'),
              ', posthaste!'
            )
          )
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
        say(nodes(priceTable, portMenu(state.portPrompt), ' ', prompt))
        fnKeyInput()
        break
      }
      case 'PORT3':
        if (inputValue == 'B') state.nextLine = 'B1'
        else if (inputValue == 'S') state.nextLine = 'S1'
        else if (inputValue == 'V') state.nextLine = 'V1'
        else if (inputValue == 'T') state.nextLine = 2620
        else if (inputValue == 'Q' && state.holdRoom < 0) state.nextLine = 'OVERLOAD'
        else if (inputValue == 'Q') state.nextLine = 'Q1'
        else if (inputValue == 'R') state.nextLine = 2695
        else state.nextLine = 'NOTYET'
        state.delayTicks = 0
        break
      case 'NEWSHIP1':
        state.allowedInput = [1, 'NEWSHIP2', 'Y', 'N']
        say(
          nodes(
            comprador(),
            cap('Do'),
            ' you wish to trade in your ',
            state.damage > 0
              ? { kind: 'inverse', children: [{ kind: 'text', text: 'damaged' }] }
              : 'fine',
            br,
            'ship for one with 50 more capacity by',
            br,
            'paying an additional ',
            formatMoney(state.offerPrice),
            ', ',
            taipan(),
            '? ',
            prompt
          )
        )
        fnKeyInput()
        break
      case 'NEWSHIP2':
        if (inputValue == 'Y') {
          state.cash -= state.offerPrice
          state.holdRoom += 50
          state.shipCapacity += 50
          state.damage = 0
        }
        state.nextLine = 'R-NEWSHIP'
        state.delayTicks = 2
        break
      case 'NEWGUN1':
        state.allowedInput = [1, 'NEWGUN2', 'Y', 'N']
        say(
          nodes(
            comprador(),
            cap('Do'),
            " you wish to buy a ship's gun",
            br,
            'for ',
            formatMoney(state.offerPrice),
            ', ',
            taipan(),
            '? ',
            prompt
          )
        )
        fnKeyInput()
        break
      case 'NEWGUN2':
        if (inputValue == 'Y' && state.holdRoom >= 10) {
          state.cash -= state.offerPrice
          state.guns += 1
          state.holdRoom -= 10
          state.delayTicks = 2
          state.nextLine = 'R-NEWGUN'
        } else if (inputValue == 'Y') {
          add(nodes(br, br, cap('Your'), ' ship would be overburdened, ', taipan(), '!'))
          fnKeyInput()
          hideCursor()
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
          say(
            nodes(
              comprador(),
              taipan(),
              '!!\u00a0 The price of ',
              good(i),
              ' has dropped to ',
              state.portPrices[i],
              '!!'
            )
          )
        } else {
          state.portPrices[i] *= fR(5) + 5
          say(
            nodes(
              comprador(),
              taipan(),
              '!!\u00a0 The price of ',
              good(i),
              ' has risen to ',
              state.portPrices[i],
              '!!'
            )
          )
        }
        fnKeyInput()
        state.delayTicks = 10
        state.nextLine = 'R-PRICE'
        break
      case 'ROBBED':
        i = Mf(state.cash / 1.4)
        say(
          nodes(
            comprador(),
            "You've been beaten up and robbed of ",
            formatMoney(i),
            ' in cash, ',
            taipan(),
            '!!'
          )
        )
        state.cash -= i
        fnKeyInput()
        state.delayTicks = 18
        state.nextLine = 'R-ROBBED'
        break
      case 'B1':
        state.allowedInput = [1, 'B2', 'O', 'S', 'A', 'G']
        say(nodes(priceTable, cap('What'), ' do you wish me to buy, ', taipan(), '? ', prompt))
        fnKeyInput()
        break
      case 'B2':
        state.allowedInput = [6, 'B3', 'A', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9']
        if (inputValue == 'O') state.selectedGood = 0
        else if (inputValue == 'S') state.selectedGood = 1
        else if (inputValue == 'A') state.selectedGood = 2
        else state.selectedGood = 3
        state.affordableUnits = Mf(state.cash / state.portPrices[state.selectedGood])
      case 'B2a':
        say(
          nodes(
            priceTable,
            cap('How'),
            ' much ',
            good(state.selectedGood),
            ' shall',
            br,
            cap('I'),
            ' buy, ',
            taipan(),
            '? ',
            prompt,
            afford(state.affordableUnits)
          )
        )
        fnKeyInput()
        break
      case 'B3':
        amount = inputValue == 'A' ? state.affordableUnits : +inputValue
        if (amount <= state.affordableUnits) {
          state.holdRoom -= amount
          state.cash -= state.portPrices[state.selectedGood] * amount
          state.cargo[1][state.selectedGood] += amount
          state.nextLine = 'PORT2'
        } else state.nextLine = 'B2a'
        state.delayTicks = 0
        break
      case 'S1':
        state.allowedInput = [1, 'S2', 'O', 'S', 'A', 'G']
        say(nodes(priceTable, cap('What'), ' do you wish me to sell, ', taipan(), '? ', prompt))
        fnKeyInput()
        break
      case 'S2':
        state.allowedInput = [6, 'S3', 'A', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9']
        if (inputValue == 'O') state.selectedGood = 0
        else if (inputValue == 'S') state.selectedGood = 1
        else if (inputValue == 'A') state.selectedGood = 2
        else state.selectedGood = 3
      case 'S2a':
        say(
          nodes(
            priceTable,
            cap('How'),
            ' much ',
            good(state.selectedGood),
            ' shall',
            br,
            cap('I'),
            ' sell, ',
            taipan(),
            '? ',
            prompt
          )
        )
        fnKeyInput()
        break
      case 'S3':
        amount = inputValue == 'A' ? state.cargo[1][state.selectedGood] : +inputValue
        if (amount <= state.cargo[1][state.selectedGood]) {
          state.holdRoom += amount
          state.cash += state.portPrices[state.selectedGood] * amount
          state.cargo[1][state.selectedGood] -= amount
          state.nextLine = 'PORT2'
        } else state.nextLine = 'S2a'
        state.delayTicks = 0
        break
      case 'OVERLOAD':
        say(nodes(comprador(), cap('Your'), ' ship is overloaded, ', taipan(), '!!'))
        state.delayTicks = 16
        state.nextLine = 'PORT2'
        fnKeyInput()
        break
      case 'V1':
        state.allowedInput = [9, 'V2', 'A', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9']
        say(nodes(comprador(), cap('How'), ' much will you deposit? ', prompt))
        fnKeyInput()
        break
      case 'V2':
        amount = inputValue == 'A' ? state.cash : +inputValue
        if (amount > state.cash) {
          add(nodes(br, br, taipan(), ', you have only ', formatMoney(state.cash), br, 'in cash.'))
          state.delayTicks = 24
          state.nextLine = 'V1'
          fnKeyInput()
          hideCursor()
          break
        } else {
          state.cash -= amount
          state.bank += amount
        }
      case 'V3':
        state.allowedInput = [9, 'V4', 'A', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9']
        say(nodes(comprador(), cap('How'), ' much will you withdraw? ', prompt))
        fnKeyInput()
        break
      case 'V4':
        amount = inputValue == 'A' ? state.bank : +inputValue
        if (amount > state.bank) {
          add(
            nodes(br, br, taipan(), ', you have only ', formatMoney(state.bank), br, 'in the bank.')
          )
          state.delayTicks = 24
          state.nextLine = 'V3'
          fnKeyInput()
          hideCursor()
          break
        } else {
          state.bank -= amount
          state.cash += amount
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
            say(nodes(priceTable, cap('You'), ' have no cargo, ', taipan(), '.'))
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
        say(
          nodes(
            comprador(),
            cap('How'),
            ' much ',
            good(state.transferGood),
            ' shall ',
            cap('I'),
            ' move',
            br,
            state.transferFrom == 0 ? 'aboard ship' : 'to the warehouse',
            ', ',
            taipan(),
            '? ',
            prompt
          )
        )
        state.allowedInput = [5, 2628, 'A', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9']
        fnKeyInput()
        break
      case 2628:
        amount =
          inputValue == 'A' ? state.cargo[state.transferFrom][state.transferGood] : +inputValue
        if (state.transferFrom == 1 && amount > 0 && state.warehouseFree == 0) {
          add(nodes(br, br, 'Your warehouse is full, ', taipan(), '!'))
          state.delayTicks = 10
          state.nextLine = 2626
          fnKeyInput()
          hideCursor()
          break
        }
        if (state.transferFrom == 1 && amount > state.warehouseFree) {
          add(
            nodes(
              br,
              br,
              'Your warehouse will only hold an',
              br,
              'additional ',
              formatMoney(state.warehouseFree),
              ', ',
              taipan(),
              '!'
            )
          )
          state.delayTicks = 10
          state.nextLine = 2626
          fnKeyInput()
          hideCursor()
          break
        }
        if (amount > state.cargo[state.transferFrom][state.transferGood]) {
          add(
            nodes(
              br,
              br,
              'You have only ',
              formatMoney(state.cargo[state.transferFrom][state.transferGood]),
              ', ',
              taipan(),
              '.'
            )
          )
          state.delayTicks = 10
          state.nextLine = 2626
          fnKeyInput()
          hideCursor()
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
        state.nextLine = 2624
        state.delayTicks = 0
        break
      case 2695:
        say(nodes(br, millionaire))
        fnKeyInput()
        state.delayTicks = 18
        state.nextLine = 20000
        break
      case 'NOTYET':
        say(nodes(comprador(), taipan(), ", that command hasn't yet been implemented!"))
        state.delayTicks = 6
        state.nextLine = 'PORT2'
        fnKeyInput()
        break
      case 'Q1':
        state.allowedInput = [1, 'Q2', '1', '2', '3', '4', '5', '6', '7']
        say(
          nodes(
            comprador(),
            taipan(),
            ', do you wish to go to:',
            br,
            br,
            '1) ',
            cityNodes(1),
            ', 2) ',
            cityNodes(2),
            ', 3) ',
            cityNodes(3),
            ',',
            br,
            '4) ',
            cityNodes(4),
            ', 5) ',
            cityNodes(5),
            ', 6) ',
            cityNodes(6),
            ', or',
            br,
            '7) ',
            cityNodes(7),
            ' ? ',
            prompt
          )
        )
        fnKeyInput()
        break
      case 'Q2':
        if (inputValue == state.location) {
          add(nodes(br, cap('You'), "'re already here, ", taipan(), '.'))
          fnKeyInput()
          hideCursor()
          state.delayTicks = 16
          state.nextLine = 'Q1'
          break
        }
      case 3030:
        say(captain())
        ensureView().atSea = true
        state.location = inputValue
        fnKeyInput()
        state.delayTicks = 2
        state.nextLine = 3100
        break
      case 3100:
        if (fR(state.pirateRarity) == 0) {
          state.enemyShips = fR(state.shipCapacity / 10 + state.guns) + 1
          state.attackerKind = 1
          say(
            nodes(
              captain(),
              state.enemyShips,
              ' hostile ship',
              state.enemyShips > 1 ? 's' : '',
              ' approaching, ',
              taipan(),
              '!!'
            )
          )
          fnKeyInput()
          state.delayTicks = 10
          state.nextLine = 5000
          break
        }
        if (fR(4 + 8 * state.liFavor) == 0) {
          say(nodes(captain(), cap('Li'), ' ', cap('Yuen'), "'s pirates, ", taipan(), '!!'))
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
          add(nodes(br, br, cap('Good'), ' joss!! ', cap('They'), ' let us be!!'))
          fnKeyInput()
          state.delayTicks = 6
          state.nextLine = 3300
          break
        } else {
          state.enemyShips = fR(state.shipCapacity / 5 + state.guns) + 5
          state.attackerKind = 2
          add(
            nodes(
              br,
              br,
              state.enemyShips,
              ' ship',
              state.enemyShips > 1 ? 's' : '',
              ' of ',
              cap('Li'),
              ' ',
              cap('Yuen'),
              "'s pirate",
              br,
              'fleet, ',
              taipan(),
              '!!'
            )
          )
          fnKeyInput()
          state.delayTicks = 6
          state.nextLine = 5000
          break
        }
      case 3300:
        if (fR(10) == 0) {
          say(nodes(captain(), cap('Storm'), ', ', taipan(), '!!'))
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
          add(nodes(br, br, '\u00a0 \u00a0', cap('I'), " think we're going down!!"))
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
          add(nodes(br, br, cap("We're"), ' going down, ', taipan(), '!!'))
          fnKeyInput()
          state.delayTicks = 4
          state.nextLine = 20000
          break
        }
      case 3330:
        add(nodes(br, br, '\u00a0 \u00a0 ', cap('We'), ' made it!!'))
        fnKeyInput()
        state.delayTicks = 4
        state.nextLine = 3340
        break
      case 3340:
        if (fR(3) == 0) {
          const previousLocation = Number(state.location)
          while (Number(state.location) == previousLocation) state.location = fR(7) + 1
          say(
            nodes(
              captain(),
              "We've been blown off course",
              br,
              'to ',
              cityNodes(Number(state.location))
            )
          )
          fnKeyInput()
          state.delayTicks = 4
          state.nextLine = 'ARR1'
          break
        }
      case 'ARR1':
        say(nodes(captain(), cap('Arriving'), ' at ', cityNodes(Number(state.location))))
        fnKeyInput()
        state.delayTicks = 8
        state.nextLine = 'ARR2'
        break
      case 'ARR2':
        say(comprador())
        ensureView().atSea = false
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
        resetShips()
        show('battle')
        setLine2(nodes(cap('Your'), ' orders are to: ', prompt))
      case 5060:
        setLine4(seaworthinessLine(state.damage, state.shipCapacity))
      case 5100:
        fnAddShips()
        state.allowedInput = false
        state.keyChoice = [1, 5160, 'F', 'R']
        state.delayTicks = state.battleOrder == 0 ? 12 : 4
        state.nextLine = 5190
        fnKeyInput()
        break
      case 5160:
        state.battleOrder = inputValue
        setLine2(
          nodes(
            cap('Your'),
            ' orders are to: ',
            state.battleOrder == 'F'
              ? cap('Fight')
              : state.battleOrder == 'R'
                ? cap('Run')
                : cap('Throw cargo')
          )
        )
      case 5190:
        if (state.battleOrder == 'R') state.nextLine = 5200
        else if (state.battleOrder == 'F') state.nextLine = 5300
        else if (state.battleOrder == 'T') state.nextLine = 5400
        else setLine4(nodes(taipan(), ', what shall we do?? (Fight, Run)'))
        state.delayTicks = 0
        break
      case 5200:
        state.keyChoice = false
        setLine4(nodes(cap('Aye'), ", we'll run, ", taipan(), '!'))
        fnKeyInput()
        state.delayTicks = 4
        state.nextLine = 5210
        break
      case 5210:
        state.escapeOdds += state.escapeStep++
        if (fR(state.escapeOdds) > fR(state.enemyShips)) {
          state.escapeOdds = 3
          setLine4(nodes(cap('We'), " got away from 'em, ", taipan(), '!!'))
          fnKeyInput()
          state.delayTicks = 4
          state.nextLine = 5900
          break
        }
      case 5220:
        setLine4(nodes(cap("Can't"), " lose 'em!!"))
        fnKeyInput()
        state.delayTicks = 4
        state.nextLine = 5230
        break
      case 5230:
        if (state.enemyShips > 2 && fR(5) == 0) {
          const escaped = Mf(fR(state.enemyShips / 2) + 1)
          state.enemyShips -= escaped
          if (state.shipsOnScreen > state.enemyShips) fnRemoveShips()
          setLine4(nodes(cap('But'), ' we escaped from ', escaped, " of 'em, ", taipan(), '!'))
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
          setLine4(nodes(cap('We'), ' have no guns, ', taipan(), '!!'))
          fnKeyInput()
          state.delayTicks = 4
          state.nextLine = 5500
          break
        }
        state.gunsFired = 0
        setLine4(nodes(cap('Aye'), ", we'll fight 'em, ", taipan(), '!'))
        fnKeyInput()
        state.delayTicks = 4
        state.nextLine = 5310
        break
      case 5310:
        state.shipsSunk = 0
        setLine4(nodes(cap("We're"), " firing on 'em, ", taipan(), '!'))
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
        fnFire(shot, true)
        later(() => fnFire(shot, false), 75)
        later(() => fnFire(shot, true), 150)
        later(() => fnFire(shot, false), 225)
        later(() => fnFire(shot, true), 300)
        later(() => fnFire(shot, false), 375)
        ensureView().ships[shot].damageFrame = fR(11)
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
          setLine4(nodes(cap('Sunk'), ' ', state.shipsSunk, ' of the buggers, ', taipan(), '!'))
        else setLine4(nodes(cap('Hit'), " 'em, but didn't sink 'em, ", taipan(), '!'))
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
          if (state.shipsOnScreen > state.enemyShips) fnRemoveShips()
          setLine4(nodes(escaped, ' ran away, ', taipan(), '!'))
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
          setLine4(nodes(cap('We'), " got 'em all, ", taipan(), '!!'))
          fnKeyInput()
          state.delayTicks = 4
          state.nextLine = 5900
          break
        }
        setLine4(nodes(cap("They're"), ' firing on us, ', taipan(), '!'))
        fnEnemyFire(true)
        later(() => fnEnemyFire(false), 75)
        later(() => fnEnemyFire(true), 150)
        later(() => fnEnemyFire(false), 225)
        later(() => fnEnemyFire(true), 300)
        later(() => fnEnemyFire(false), 375)
        later(() => fnEnemyFire(true), 450)
        later(() => fnEnemyFire(false), 525)
        fnKeyInput()
        state.delayTicks = 4
        state.nextLine = 5510
        break
      case 5510:
        setLine4(nodes(cap("We've"), ' been hit, ', taipan(), '!!'))
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
          setLine4(nodes(cap('The'), ' buggers hit a gun, ', taipan(), '!!'))
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
        state.delayTicks = 2
        state.nextLine = 5320
        break
      case 5900:
        if (state.battleOrder == 'F') {
          state.cash += state.booty
          say(
            nodes(
              br,
              br,
              cap("We've"),
              ' captured some booty.',
              br,
              "It's worth ",
              formatMoney(state.booty),
              '!'
            )
          )
        } else say(nodes(br, br, cap('We'), ' made it, ', taipan(), '!'))
        show('port')
        state.keyChoice = false
        fnKeyInput()
        state.delayTicks = 10
        state.nextLine = 3300
        break
      case 10000:
      case 10120:
        show('firm').inputSlot = 'firm'
        state.firmNameLimit = 22
        fnKeyInput()
        break
      case 10130:
        if (inputValue == '') {
          state.delayTicks = 0
          state.nextLine = 10120
          break
        }
        state.firmName = inputValue
        show('stake').inputSlot = 'stake'
      case 10140:
        state.allowedInput = [1, 10150, '1', '2']
        fnKeyInput()
        break
      case 10150:
        if (inputValue == '1') {
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
        show('port').inputSlot = 'none'
        break
      case 20000:
        state.yearsPlayed = Mf(state.monthsElapsed / 12)
        state.monthsPlayed = state.monthsElapsed - state.yearsPlayed * 12
        show('score').inputSlot = 'none'
        hideCursor()
        endGame = true
        break
    }
    touch(endGame)
  }
  /* eslint-enable no-fallthrough */

  function isUntouched(): boolean {
    return (
      !state.viewHtml &&
      state.nextLine === '' &&
      state.resumeLine === '' &&
      state.firmName === '' &&
      state.firmNameLimit === false &&
      state.allowedInput === false &&
      state.keyChoice === false &&
      state.inputText === '' &&
      !!state.view &&
      state.view.screen === 'firm' &&
      state.view.message.length === 0 &&
      state.view.inputSlot === 'none'
    )
  }

  document.addEventListener('keydown', onKeyDown)
  document.addEventListener('keypress', onKeyPress)
  window.addEventListener('beforeunload', onBeforeUnload)
  const intervalId = window.setInterval(fnTimer, 500)
  if (isUntouched()) fnMain(10000)

  return () => {
    window.clearInterval(intervalId)
    for (const id of pending) window.clearTimeout(id)
    pending.clear()
    document.removeEventListener('keydown', onKeyDown)
    document.removeEventListener('keypress', onKeyPress)
    window.removeEventListener('beforeunload', onBeforeUnload)
  }
}
