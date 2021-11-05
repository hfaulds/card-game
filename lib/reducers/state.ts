export const VisualActions = {
  MoveMouse: "MoveMouse",
  MouseUp: "MouseUp",
  MouseDown: "MouseDown",
}

export interface VisualState {
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
  tokenId?: string
}

export function VisualStateReducer(state: VisualState, event): VisualState {
  switch (event.action) {
    case VisualActions.MoveMouse:
      if (!(state.mode == "PLACING" && state.cursor)) {
        return state
      }
      const { x, y } = event.value
      return {
        ...state,
        cursor: {
          ...state.cursor,
          pos: {
            x: x - (x % 21),
            y: y - (y % 21),
          },
        },
      }
    case VisualActions.MouseUp:
      if (!(state.mode == "PLACING" && state.tokenId)) {
        return state
      }
      return { mode: "DEFAULT" }
    case VisualActions.MouseDown:
      const { tokenId, token } = event.value
      return {
        mode: "PLACING",
        tokenId: tokenId,
        lastCursor: token?.pos && {
          pos: token.pos,
          color: token.color,
        },
        cursor: {
          color: token.color,
        },
      }
  }
  return { mode: "DEFAULT" }
}
