export const GameActions = {
  CreateGame:   'CreateGame',
  DeleteGame:   'DeleteGame',
  AddPlayer:    'AddPlayer',
  RemovePlayer: 'RemovePlaer',
}

export function GamesReducer(games, action){
  switch (action.type) {
    case GameActions.CreateGame:
      return games.concat([action.value])
    case GameActions.DeleteGame:
      return games.filter((g) => g.id != action.value)
    case GameActions.AddPlayer:
      let { game, invite } = action.value
      let newGame = {
        id: game.id,
        users: game.users.concat(invite),
      }
      return games.map((g) => g.id == game.id ? newGame : g)
    case GameActions.RemovePlayer:
      game = action.value.game
      let { inviteId } = action.value
      newGame = {
        id: game.id,
        users: game.users.filter((u) => u.id != inviteId),
      }
      return games.map((g) => g.id == action.value.game.id ? newGame : g)
  }
}
