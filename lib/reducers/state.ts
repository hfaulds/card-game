import { ApplyEvent, EventAction, GameState, Pos } from "lib/game_state"
import { Cards } from "lib/cards"

export const Actions = {
  MoveMouse: "MoveMouse",
  FinishPlacing: "FinishPlacing",
  StartPlacing: "StartPlacing",
  UpdateTokenColor: "UpdateTokenColor",
  Synced: "Synced",
  AddCharacter: "AddCharacter",
  RenameCharacter: "RenameCharacter",
  NextTurn: "NextTurn",
  SelectCard: "SelectCard",
  DeselectCard: "DeselectCard",
  PlayCard: "PlayCard",
}

export interface State {
  gameState: GameState
  visualState: {
    mode: string
    cursor?: {
      pos?: {
        x: number
        y: number
      }
      color: string
    }
    placingTokenId?: string
    selectedCard?: {
      cardInstanceId: string
      validTargets: Pos[]
    }
    renamingCharacterId?: string
    syncing: number
  }
}

export function StateReducer(state: State, event): State {
  const { gameState, visualState } = state
  switch (event.action) {
    case Actions.MoveMouse:
      if (!(visualState.mode == "PLACING" && visualState.cursor)) {
        return state
      }
      const { x, y } = event.value
      return {
        gameState,
        visualState: {
          ...visualState,
          cursor: {
            ...visualState.cursor,
            pos: {
              x: x - (x % 21),
              y: y - (y % 21),
            },
          },
        },
      }
    case Actions.FinishPlacing:
      if (
        !(
          visualState.mode == "PLACING" &&
          visualState.placingTokenId &&
          visualState.cursor?.pos
        )
      ) {
        return state
      }
      return {
        gameState: ApplyEvent(gameState, {
          action: EventAction.UpdateTokenPos,
          id: visualState.placingTokenId,
          pos: visualState.cursor.pos,
        }),
        visualState: {
          syncing: visualState.syncing + 1,
          mode: "DEFAULT",
        },
      }
    case Actions.StartPlacing:
      const token = gameState.tokens[event.value.id]
      return {
        gameState,
        visualState: {
          ...visualState,
          mode: "PLACING",
          placingTokenId: event.value.id,
          cursor: {
            color: token.color,
          },
        },
      }
    case Actions.UpdateTokenColor:
      return {
        gameState: ApplyEvent(gameState, {
          action: EventAction.UpdateTokenColor,
          id: event.value.id,
          color: event.value.color,
        }),
        visualState: {
          ...visualState,
          syncing: visualState.syncing + 1,
        },
      }
    case Actions.Synced:
      return {
        gameState,
        visualState: {
          ...visualState,
          syncing: visualState.syncing - 1,
        },
      }
    case Actions.AddCharacter:
      return {
        gameState: ApplyEvent(gameState, {
          action: EventAction.AddCharacter,
          id: event.value.id,
          name: event.value.name,
        }),
        visualState,
      }
    case Actions.RenameCharacter:
      return {
        gameState: ApplyEvent(gameState, {
          action: EventAction.UpdateCharacterName,
          id: event.value.id,
          name: event.value.name,
        }),
        visualState,
      }
    case Actions.NextTurn:
      return {
        gameState: ApplyEvent(gameState, {
          action: EventAction.NextTurn,
          turn: event.value.turn,
          cards: event.value.cards,
        }),
        visualState,
      }
    case Actions.SelectCard:
      const card = Cards.find(({ id }) => id == event.value.selected.id)
      if (!card?.validTargets) {
        return { gameState, visualState }
      }
      return {
        gameState,
        visualState: {
          ...visualState,
          selectedCard: {
            validTargets: card.validTargets(gameState),
            cardInstanceId: event.value.selected.instanceId,
          },
        },
      }
    case Actions.DeselectCard:
      return {
        gameState,
        visualState: {
          ...visualState,
          selectedCard: undefined,
        },
      }
    case Actions.PlayCard:
      return {
        gameState: ApplyEvent(gameState, {
          action: EventAction.PlayCard,
          target: event.value.target,
          player: event.value.player,
          card: event.value.card,
        }),
        visualState: {
          ...visualState,
          selectedCard: undefined,
        },
      }
  }
  return state
}
