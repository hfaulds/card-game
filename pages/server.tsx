import { GetServerSideProps } from "next"
import type { Session } from "next-auth"
import { useSession, getSession } from "next-auth/react"
import Layout from "../components/layout"
import prisma from "/lib/prisma"

export default function Page({user, games}) {
  // As this page uses Server Side Rendering, the `session` will be already
  // populated on render without needing to go through a loading stage.
  // This is possible because of the shared context configured in `_app.js` that
  // is used by `useSession()`.
  const { data: session } = useSession()
  if(!session) {
    return <Layout/>
  }

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
  }

  return (
    <Layout>
      <h1>{ user.name }</h1>
      <button onClick={newGame}> New Game </button>
      <table>
        {
          games.map((game) =>
            <tr>
              <td>
                <h3>{game.name}</h3>
              </td>
              <td>
                {
                  game.users.map((user) =>
                    user.name
                  )
                }
              </td>
            </tr>
          )
        }
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
