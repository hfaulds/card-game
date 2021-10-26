import { GetServerSideProps } from "next"
import type { Session } from "next-auth"
import { useSession, getSession } from "next-auth/react"
import Layout from "../components/layout"
import NewGameModal from "../components/new_game_modal"
import ManagePlayersModal from "../components/manage_players_modal"
import prisma from "/lib/prisma"
import { useState, useReducer } from "react"
import { ChevronDoubleRightIcon, PlusCircleIcon, TrashIcon } from '@heroicons/react/outline'
import { useRouter } from 'next/router'
import { GameActions, GamesReducer } from '/lib/reducers/games'

export default function Page(props) {
  const { data: session } = useSession()
  if(!session) {
    return <Layout/>
  }
  const router = useRouter()
  const [showingNewGameModal, setShowingNewGameModal] = useState(false)
  const [managePlayersForGame, setManagePlayersForGame] = useState(undefined)
  const [games, setGames] = useReducer(GamesReducer, props.games)

  const createGame = async (name, invites) => {
    const res = await fetch('api/games', {
      body: JSON.stringify({ name, invites }),
      headers: {
        'Content-Type': 'application/json'
      },
      method: 'POST',
    })
    if(!res.ok) {
      return
    }
    const game = (await res.json()).game
    setGames({ type: GameActions.CreateGame, value: game })
  }

  const addPlayer = async (game, email) => {
    const res = await fetch(`api/game/${game.id}`, {
      body: JSON.stringify({ email }),
      headers: {
        'Content-Type': 'application/json'
      },
      method: 'POST',
    })
    if(!res.ok) {
      return
    }
    const invite = (await res.json()).invite
    setGames({ type: GameActions.AddPlayer, value: { invite, game: game } })
  }

  const removePlayer = async (game, invite) => {
    const res = await fetch(`api/game/${game.id}`, {
      body: JSON.stringify({ inviteId: invite.id }),
      headers: {
        'Content-Type': 'application/json'
      },
      method: 'DELETE',
    })
    if(!res.ok) {
      return
    }
    setGames({ type: GameActions.RemovePlayer, value: { inviteId: invite.id, game: game} })
  }

  const deleteGame = async (id) => {
    const res = await fetch('api/games', {
      body: JSON.stringify({ id }),
      headers: {
        'Content-Type': 'application/json'
      },
      method: 'DELETE'
    })
    if(!res.ok) {
      return
    }
    setGames({ type: GameActions.DeleteGame, value: id })
  }

  const openGame = async (id) => {
    router.push(`/game/${id}`)
  }

  return (
    <Layout>
      <div className="pb-4">
        <h1 className="text-3xl">{ props.user.name }</h1>
      </div>
      <div className="pb-4">
        <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" onClick={() => { setShowingNewGameModal(true) && setManagePlayersForGame(undefined) }}> New Game </button>
      </div>
      <table className="table-fixed w-full">
        <tbody>
        {
          games.map((game) =>
            <tr key={game.id}>
              <td className="pr-10">
                <button className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-2 mr-4 rounded" onClick={() => openGame(game.id)}>

                  <ChevronDoubleRightIcon className="h-4 w-4"/>
                </button>
                <span className="font-bold capitalize">{game.name}</span>
              </td>
              <td className="p-2">
                {
                  game.users.filter((gameUser) => !!gameUser.accepted).map(({user}) =>
                    <img key={game.id + user.id} src={user.image} className="w-8 h-8 rounded-full mr-2 inline-block"/>
                  )
                }
                <PlusCircleIcon className="inline-block w-8 h-8 stroke-1 text-gray-400 hover:text-black" onClick={() => setManagePlayersForGame(game.id)}/>
              </td>
              <td className="p-2">
                <button className="float-right bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded" onClick={() => deleteGame(game.id)}>
                  <TrashIcon className="h-4 w-4"/>
                </button>
              </td>
            </tr>
          )
        }
        </tbody>
      </table>
      { showingNewGameModal && <NewGameModal hide={() => setShowingNewGameModal(false)} complete={createGame} defaultName={`New Game${games.length == 0 ? "" : " " + (games.length + 1)}`}/> }
      {
        <ManagePlayersModal
          game={games.find((g) => g.id == managePlayersForGame)}
          hide={() => setManagePlayersForGame(undefined)}
          addPlayer={addPlayer}
          removePlayer={removePlayer}/>
      }
    </Layout>
  )
}

export const getServerSideProps: GetServerSideProps<{
  session: Session | null
}> = async (context) => {
  const session = await getSession(context)
  if (!session) {
    return {props: {}}
  }
  const user = await prisma.user.findUnique({
    where: {
      email: session.user.email,
    },
  })
  const games = await prisma.game.findMany({
    where: {
      users: {
        some: {
          userEmail: user.email,
        },
      },
    },
    include: {
      users: {
        include: {
          user: true,
        },
      },
    },
  })
  return {
    props: {
      session: session,
      user: user,
      games: games,
    },
  }
}
