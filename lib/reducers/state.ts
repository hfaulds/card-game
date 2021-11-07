import { GameState } from "lib/game_state"

export const Actions = {
  MoveMouse: "MoveMouse",
  FinishPlacing: "FinishPlacing",
  StartPlacing: "StartPlacing",
  UpdateTokenColor: "UpdateTokenColor",
  Synced: "Synced",
  AddCharacter: "AddCharacter",
  RenameCharacter: "RenameCharacter",
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
    lastCursor?: {
      pos: {
        x: number
        y: number
      }
      color: string
    }
    placingTokenId?: string
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
        gameState: {
          ...gameState,
          tokens: {
            ...gameState.tokens,
            [visualState.placingTokenId]: {
              pos: visualState.cursor.pos,
              color: visualState.cursor.color,
            },
          },
        },
        visualState: {
          syncing: visualState.syncing + 1,
          mode: "DEFAULT",
        },
      }
    case Actions.StartPlacing:
      const token = gameState.tokens[event.value.tokenId]
      return {
        gameState: {
          ...gameState,
          tokens: {
            ...gameState.tokens,
            [event.value.tokenId]: {
              ...token,
              pos: undefined,
            },
          },
        },
        visualState: {
          ...visualState,
          mode: "PLACING",
          placingTokenId: event.value.tokenId,
          lastCursor: token?.pos && {
            pos: token.pos,
            color: token.color,
          },
          cursor: {
            color: token.color,
          },
        },
      }
    case Actions.UpdateTokenColor:
      return {
        gameState: {
          ...gameState,
          tokens: {
            ...gameState.tokens,
            [event.value.tokenId]: {
              ...gameState.tokens[event.value.tokenId],
              color: event.value.color,
            },
          },
        },
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
        gameState: {
          ...gameState,
          characters: gameState.characters.concat({
            id: event.value.id,
            name: event.value.name,
            health: 100,
            npc: true,
          }),
          tokens: {
            ...gameState.tokens,
            [event.value.id]: {
              color: event.value.tokenColor,
            },
          },
        },
        visualState,
      }
    case Actions.RenameCharacter:
      return {
        gameState: {
          ...gameState,
          characters: gameState.characters.map((c) => {
            if (event.value.id == c.id) {
              return {
                ...c,
                name: event.value.name,
              }
            }
            return c
          }),
        },
        visualState,
      }
  }
  return state
}
