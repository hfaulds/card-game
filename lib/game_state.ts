import { Card, Cards } from "lib/cards"
import { v4 as uuidv4 } from "uuid"

export interface GameState {
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
    characters: characters,
    tokens: tokens,
    cards: cards,
    turn: userCampaigns[0].id,
  }
}

export function DrawHand(cards: CardPiles): CardPiles {
  var draw, hand, discard
  if (cards.draw.length >= handSize) {
    draw = cards.draw.slice(handSize)
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
