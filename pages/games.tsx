import { GetServerSideProps } from "next"
import type { Session } from "next-auth"
import { useSession, getSession } from "next-auth/react"
import Layout from "../components/layout"
import NewGameModal from "../components/new_game_modal"
import prisma from "/lib/prisma"
import { useState } from "react"
import { ChevronDoubleRightIcon, PlusCircleIcon, TrashIcon } from '@heroicons/react/outline'
import { useRouter } from 'next/router'

export default function Page(props) {
  const { data: session } = useSession()
  if(!session) {
    return <Layout/>
  }
  const router = useRouter()
  const [games, setGames] = useState(props.games)
  const [showingNewGameModal, setShowingNewGameModal] = useState(false)

  const newGame = async (name, players) => {
    const res = await fetch('api/games', {
      body: JSON.stringify({
        name: name,
        players: players,
      }),
      headers: {
        'Content-Type': 'application/json'
      },
      method: 'POST'
    })
    if(!res.ok) {
      return
    }
    const game = (await res.json()).game
    setGames(games.concat([game]))
  }

  const addUserToGame = async (gameId, userId) => {
  }

  const deleteGame = async (id) => {
    const res = await fetch('api/games', {
      body: JSON.stringify({
        id: id,
      }),
      headers: {
        'Content-Type': 'application/json'
      },
      method: 'DELETE'
    })
    if(!res.ok) {
      return
    }
    const removed = (await res.json()).game
    setGames(games.filter((g) => g.id != removed.id))
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
        <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" onClick={() => { setShowingNewGameModal(true) }}> New Game </button>
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
                  game.users.map((user) =>
                    <img key={game.id + user.id} src={session.user.image} className="w-8 h-8 rounded-full mr-2 inline-block"/>
                  )
                }
                <PlusCircleIcon className="inline-block w-8 h-8 stroke-1 text-gray-400 hover:text-black" onClick={() => addUserToGame(game.id)}/>
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
      { showingNewGameModal && <NewGameModal hide={() => setShowingNewGameModal(false)} complete={newGame} defaultName={`New Game${games.length == 0 ? "" : " " + (games.length + 1)}`}/> }
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
        every: {
          userId: user.id,
        },
      },
    },
    include: {
      users: true,
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
