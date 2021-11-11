import { Card, Cards } from "lib/cards"
import { v4 as uuidv4 } from "uuid"
import { escape as escapeSQL } from "sqlstring"
import merge from "ts-deepmerge"

export interface GameState {
  version: number
  characters: Characters
  cards: { [key: string]: CardPiles }
  tokens: Tokens
  turn: string
}
export interface Characters {
  [key: string]: Character
}

export interface Character {
  name: string
  health: number
  npc: boolean
}

export interface CardInstance {
  instanceId: string
  id: string
  name: string
}

export interface CardPiles {
  draw: CardInstance[]
  discard: CardInstance[]
  hand: CardInstance[]
}

export interface Decks {
  [key: string]: {
    [key: string]: number
  }
}

export interface Tokens {
  [key: string]: Token
}

export interface Token {
  color: string
  pos?: {
    x: number
    y: number
  }
}

const handSize = 10

export function NewGameState(userCampaigns, decks: Decks): GameState {
  const characters = userCampaigns.reduce((t, u) => {
    return {
      ...t,
      [u.id]: {
        name: u.user.name,
        health: 100,
        npc: false,
      },
    }
  }, {})
  const tokens = Object.keys(characters).reduce((t, uid) => {
    return {
      ...t,
      [uid]: {
        color: "blue-500",
      },
    }
  }, {})
  const cards = Object.keys(characters).reduce((d, uid) => {
    let draw: any[] = []
    Object.entries(decks[uid]).forEach(([cid, quantity]) => {
      let card = Cards.find((card) => card.id == cid)
      for (let i = 0; i < quantity; i++) {
        draw.push({
          instanceId: uuidv4(),
          ...card,
        })
      }
    })
    return {
      [uid]: DrawHand({
        draw: shuffle(draw),
        discard: [],
        hand: [],
      }),
    }
  }, {})
  return {
    version: 0,
    characters: characters,
    tokens: tokens,
    cards: cards,
    turn: userCampaigns[0].id,
  }
}

export function DrawHand(cards: CardPiles): CardPiles {
  var draw, hand, discard
  if (cards.draw.length >= handSize) {
    draw = shuffle(cards.draw.slice(handSize))
    hand = cards.draw.slice(0, handSize - 1)
    discard = cards.hand.concat(cards.discard)
  } else {
    const newDraw = shuffle(cards.hand.concat(cards.discard))
    draw = newDraw.slice(handSize - cards.draw.length)
    hand = newDraw.slice(0, handSize - cards.draw.length - 1).concat(cards.draw)
    discard = []
  }
  return {
    draw: draw,
    discard: discard,
    hand: hand,
  }
}

function shuffle(array) {
  let currentIndex = array.length,
    randomIndex

  while (currentIndex != 0) {
    randomIndex = Math.floor(Math.random() * currentIndex)
    currentIndex--
    ;[array[currentIndex], array[randomIndex]] = [
      array[randomIndex],
      array[currentIndex],
    ]
  }

  return array
}

export function ApplyEvent(state: GameState, event: Event): GameState {
  const patch = PatchForEvent(state, event)
  const newState = merge.withOptions({ mergeArrays: false }, state, patch.patch)
  return newState
}

export type Event =
  | UpdateTokenPosEvent
  | UpdateTokenColorEvent
  | AddCharacterEvent
  | UpdateCharacterNameEvent
  | NextTurnEvent

export enum EventAction {
  UpdateTokenPos = "UpdateTokenPos",
  UpdateTokenColor = "UpdateTokenColor",
  AddCharacter = "AddCharacter",
  UpdateCharacterName = "UpdateCharacterName",
  NextTurn = "NextTurn",
}

interface UpdateTokenPosEvent {
  action: EventAction.UpdateTokenPos
  id: string
  pos: { x: number; y: number }
}

interface UpdateTokenColorEvent {
  action: EventAction.UpdateTokenColor
  id: string
  color: string
}

interface AddCharacterEvent {
  action: EventAction.AddCharacter
  id: string
  name: string
}

interface UpdateCharacterNameEvent {
  action: EventAction.UpdateCharacterName
  id: string
  name: string
}

interface NextTurnEvent {
  action: EventAction.NextTurn
  turn?: string
  cards?: CardPiles
}

interface Patch {
  permission: ({ id: string, admin: boolean }) => boolean
  patch: any
  result?: any
}

export function PatchForEvent(state: GameState, event: Event): Patch {
  switch (event.action) {
    case EventAction.UpdateTokenPos:
      return {
        patch: {
          tokens: {
            [event.id]: {
              pos: event.pos,
            },
          },
        },
        permission: (u) => u.id == event.id || u.admin,
      }
    case EventAction.UpdateTokenColor:
      return {
        patch: {
          tokens: {
            [event.id]: {
              color: event.color,
            },
          },
        },
        permission: (u) => u.id == event.id || u.admin,
      }
    case EventAction.AddCharacter:
      const id = event.id || uuidv4()
      return {
        patch: {
          characters: {
            [id]: {
              name: event.name,
              health: 100,
              npc: true,
            },
          },
          tokens: {
            [id]: {
              color: "blue-500",
            },
          },
          decks: {
            [id]: {},
          },
          cards: {
            [id]: {
              draw: [],
              discard: [],
              hand: [],
            },
          },
        },
        permission: (u) => u.admin,
        result: { id },
      }
    case EventAction.UpdateCharacterName:
      return {
        patch: {
          characters: {
            [event.id]: {
              name: event.name,
            },
          },
        },
        permission: (u) => u.id == event.id || u.admin,
      }
    case EventAction.NextTurn:
      const ids = Object.keys(state.characters)
      const turn = event.turn || ids[(ids.indexOf(state.turn) + 1) % ids.length]
      const cards = event.cards || DrawHand(state.cards[turn])
      return {
        patch: {
          turn: turn,
          cards: {
            [turn]: cards,
          },
        },
        permission: (u) => u.id == turn || u.admin,
        result: {
          turn,
          cards,
        },
      }
  }
}
