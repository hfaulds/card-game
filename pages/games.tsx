import { GetServerSideProps } from "next"
import type { Session } from "next-auth"
import { useSession, getSession } from "next-auth/react"
import Layout from "../components/layout"
import prisma from "/lib/prisma"
import { useState } from "react"

export default function Page(props) {
  const { data: session } = useSession()
  if(!session) {
    return <Layout/>
  }

  const [games, setGames] = useState(props.games)

  const newGame = async () => {
    const res = await fetch('api/games', {
      body: JSON.stringify({
        name: "test",
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

  return (
    <Layout>
      <div className="pb-2">
        <h1 className="text-3xl">{ props.user.name }</h1>
      </div>
      <div className="pb-2">
        <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" onClick={newGame}> New Game </button>
      </div>
      <table className="table-fixed w-full">
        <tbody>
        {
          games.map((game) =>
            <tr key={game.id}>
              <td className="border p-2">
                <h3>{game.name}</h3>
              </td>
              <td className="border p-2">
                {
                  game.users.map((user) =>
                    user.name
                  )
                }
              </td>
              <td className="border p-2">
                <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" onClick={() => deleteGame(game.id)}> Delete </button>
              </td>
            </tr>
          )
        }
        </tbody>
      </table>
    </Layout>
  )
}

// Export the `session` prop to use sessions with Server Side Rendering
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
          id: user.id,
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
