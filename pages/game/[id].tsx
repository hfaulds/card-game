import { GetServerSideProps } from "nextcard"
import type { Session } from "next-auth"
import { useSession, getSession } from "next-auth/react"
import Layout from "/components/layout"
import prisma from "/lib/prisma"
import { useRouter } from 'next/router'
import { useState } from "react"
import Hand from "/components/game/hand"
import Modal from "/components/modal"

export default function Page(props) {
  const { data: session } = useSession()
  if(!session) {
    return <Layout>
      Game not found
    </Layout>
  }
  if(!props.game) {
    return <Layout>
      Game not found
    </Layout>
  }

  const [manageCharacterModal, setManageCharacterModal] = useState(false)

  const currentGameUser = props.game.users.find((gameUser) => gameUser.userEmail == session.user.email)
  const endTurn = () => {
  }
  const playCard = () => {
  }

  const cards = [{id: "0"},{id: "1"},{id: "2"},{id: "3"},{id: "4"},{id: "5"}]
  return (
    <Layout fullscreen="true">
      <div className="pb-4">
        <h1 className="inline-block text-3xl mr-4">{ props.game.name }</h1>
        <button className="inline-block bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-2 rounded">
          <span className="font-small" onClick={() => setManageCharacterModal(true)}> Manage Character </span>
        </button>
      </div>

      <div className="h-4/6 w-full text-center bg-blue-100 flex"
        style={{
          backgroundImage: "repeating-linear-gradient(#ccc 0 1px, transparent 1px 100%), repeating-linear-gradient(90deg, #ccc 0 1px, transparent 1px 100%)",
          backgroundSize: "21px 21px",
        }}>
        <div className="flex-none w-30">
        </div>
        <div className="flex-grow">
        </div>
        <div className="flex-none w-30">
          <div className="border-solid border-4 bg-white p-2">
            <p className="font-bold mb-2"> Order </p>
            {
              props.game.users.filter((gameUser) => !!gameUser.accepted).map(({user}) =>
                <p key={user.id} > {user.name} </p>
              )
            }
          </div>
          {
            currentGameUser.admin && (
              <button className="inline-block bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-2 rounded">
                <span className="font-small" onClick={endTurn}> Skip Turn </span>
              </button>
            )
          }
        </div>
      </div>

      <div className="fixed bottom-0 h-60 w-8/12 text-center">
        <Hand cards={cards} playCard={playCard}/>
      </div>

      {
        manageCharacterModal && (
          <Modal hide={() => setManageCharacterModal(null)}>
            Hi
          </Modal>
        )
      }
    </Layout>
  )
}

export const getServerSideProps: GetServerSideProps<{
  session: Session | null
  params: { id: string },
}> = async (context) => {
  const session = await getSession(context)
  if (!session) {
    return {props: {}}
  }
  const game = await prisma.game.findFirst({
    where: {
      id: context.params.id,
      users: {
        some: {
          userEmail: session.user.email,
          accepted: {
            not: null,
          },
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
      game: game,
    },
  }
}
