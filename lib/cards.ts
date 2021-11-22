import {
  CardInstance,
  Character,
  GameState,
  PlayCardEvent,
  Pos,
} from "lib/game_state"

export interface Card {
  id: string
  name: string
  validTargets?: (state: GameState) => Pos[]
  play?: (state: GameState, event: PlayCardEvent, card: CardInstance) => any
}

export const PlayCard = (state: GameState, event: PlayCardEvent) => {
  const cards = state.cards[event.player]
  if (!cards) {
    return
  }
  const cardInstance = cards.hand.find(
    ({ instanceId }) => instanceId == event.card
  )
  if (!cardInstance) {
    return
  }
  const card = Cards.find(({ id }) => id == cardInstance.id)
  if (!card || !card.validTargets || !card.play) {
    return
  }
  const validTargets = card.validTargets(state)
  if (
    !validTargets.some(({ x, y }) => event.target.x == x && event.target.y == y)
  ) {
    return
  }
  return card.play(state, event, cardInstance)
}

const findCharacter = (state: GameState, pos: Pos) => {
  const entry = Object.entries(state.tokens).find(
    ([id, token]) => token.pos && token.pos.x == pos.x && token.pos.y == pos.y
  )
  if (!entry) {
    return
  }
  const [target] = entry
  if (!state.characters[target]) {
    return
  }
  return target
}

const nearbyCells = (pos: Pos, distance: number): Pos[] => {
  let cells: Pos[] = []
  for (let x = -distance; x <= distance; x++) {
    for (let y = -distance; y <= distance; y++) {
      if (!(x == 0 && y == 0)) {
        cells.push({ x: pos.x + x, y: pos.y + y })
      }
    }
  }
  return cells
}

export const Cards: Card[] = [
  {
    id: "0",
    name: "melee",
    validTargets: (state: GameState) => {
      const pos = state.tokens[state.turn]?.pos
      if (!pos) {
        return []
      }
      return nearbyCells(pos, 1)
    },
    play: (state, event, card) => {
      const target = findCharacter(state, event.target)
      if (!target) {
        return {}
      }
      return {
        characters: {
          [target]: {
            health: state.characters[target].health - 10,
          },
        },
        cards: {
          [event.player]: {
            hand: state.cards[event.player].hand.filter((c) => c !== card),
            discard: state.cards[event.player].discard.concat(card),
          },
        },
      }
    },
  },
  {
    id: "1",
    name: "heal",
    validTargets: (state: GameState) => {
      const pos = state.tokens[state.turn]?.pos
      if (!pos) {
        return []
      }
      return nearbyCells(pos, 3)
    },
    play: (state, event, card) => {
      const target = findCharacter(state, event.target)
      if (!target) {
        return {}
      }
      return {
        characters: {
          [target]: {
            health: state.characters[target].health + 5,
          },
        },
        cards: {
          [event.player]: {
            hand: state.cards[event.player].hand.filter((c) => c !== card),
            discard: state.cards[event.player].discard.concat(card),
          },
        },
      }
    },
  },
  {
    id: "2",
    name: "projectile",
    validTargets: (state: GameState) => {
      const pos = state.tokens[state.turn]?.pos
      if (!pos) {
        return []
      }
      return nearbyCells(pos, 3)
    },
    play: (state, event, card) => {
      const target = findCharacter(state, event.target)
      if (!target) {
        return {}
      }
      return {
        characters: {
          [target]: {
            health: state.characters[target].health - 5,
          },
        },
        cards: {
          [event.player]: {
            hand: state.cards[event.player].hand.filter((c) => c !== card),
            discard: state.cards[event.player].discard.concat(card),
          },
        },
      }
    },
  },
  {
    id: "3",
    name: "move",
    validTargets: (state: GameState) => {
      const pos = state.tokens[state.turn]?.pos
      if (!pos) {
        return []
      }
      return nearbyCells(pos, 2)
    },
    play: (state, event, card) => {
      const pos = state.tokens[event.player]?.pos
      if (!pos) {
        return
      }
      return {
        tokens: {
          [event.player]: {
            ...state.tokens[event.player],
            pos: event.target,
          },
        },
        cards: {
          [event.player]: {
            hand: state.cards[event.player].hand.filter((c) => c !== card),
            discard: state.cards[event.player].discard.concat(card),
          },
        },
      }
    },
  },
  { id: "4", name: "consectetur" },
  { id: "5", name: "adipiscing" },
  { id: "6", name: "elit" },
  { id: "7", name: "eiusmod" },
  { id: "8", name: "tempor" },
  { id: "9", name: "incididunt" },
  { id: "10", name: "labore" },
  { id: "11", name: "dolore" },
  { id: "12", name: "magna" },
  { id: "13", name: "aliqua" },
  { id: "14", name: "enim" },
  { id: "15", name: "minim" },
  { id: "16", name: "veniam" },
  { id: "17", name: "quis" },
  { id: "18", name: "nostrud" },
  { id: "19", name: "exercitation" },
  { id: "20", name: "ullamco" },
  { id: "21", name: "laboris" },
  { id: "22", name: "nisi" },
  { id: "23", name: "aliquip" },
  { id: "24", name: "commodo" },
  { id: "25", name: "consequat" },
  { id: "26", name: "duis" },
  { id: "27", name: "aute" },
  { id: "28", name: "irure" },
  { id: "29", name: "reprehenderit" },
  { id: "30", name: "voluptate" },
  { id: "31", name: "velit" },
  { id: "32", name: "esse" },
  { id: "33", name: "cillum" },
  { id: "34", name: "fugiat" },
  { id: "35", name: "nulla" },
  { id: "36", name: "pariatur" },
  { id: "37", name: "excepteur" },
  { id: "38", name: "sint" },
  { id: "39", name: "occaecat" },
  { id: "40", name: "cupidatat" },
  { id: "41", name: "proident" },
  { id: "42", name: "sunt" },
  { id: "43", name: "culpa" },
  { id: "44", name: "officia" },
  { id: "45", name: "deserunt" },
  { id: "46", name: "mollit" },
  { id: "47", name: "anim" },
  { id: "48", name: "laborum" },
]
