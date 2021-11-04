import { GetServerSideProps } from "next"
import type { Session } from "next-auth"
import { useSession, getSession } from "next-auth/react"
import Layout from "components/layout"
import prisma from "lib/prisma"
import { useRouter } from "next/router"
import { useState, useRef } from "react"
import Hand from "components/campaign/hand"
import Modal from "components/modal"
import { Cards } from "lib/cards"
import { v4 as uuidv4 } from "uuid"

interface GameState {
  users: {
    [key: string]: {
      cards: {
        [key: string]: number
      }
      token?: {
        x: number
        y: number
      }
    }
  }
}

interface VisualState {
  mode: string
  cursor?: { x: number; y: number }
  userCampaignId?: string
}

export default function Page(props) {
  const { data: session } = useSession()
  const [manageCharacterModal, setManageCharacterModal] = useState(false)
  const [gameState, setGameState] = useState<GameState>(props.encounter.state)
  const [visualState, setVisualState] = useState<VisualState>({
    mode: "DEFAULT",
  })
  const ref = useRef<HTMLInputElement>(null)

  if (!session) {
    return <Layout>Encounter not found</Layout>
  }
  if (!props.encounter) {
    return <Layout>Encounter not found</Layout>
  }

  const currentCampaignUser = props.campaign.users.find(
    (userCampaign) => userCampaign.userEmail == session?.user?.email
  )
  const endTurn = () => {}
  const playCard = () => {}

  const cards = Object.entries(
    gameState.users[currentCampaignUser.id].cards
  ).flatMap(([id, quantity]) => {
    let c: any[] = []
    let card = Cards.find((card) => card.id == id)
    for (let i = 0; i < quantity; i++) {
      c.push({
        instanceId: uuidv4(),
        ...card,
      })
    }
    return c
  })

  const mouseMove = (e) => {
    if (visualState.mode == "PLACING") {
      const rect = ref!.current!.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      setVisualState({
        ...visualState,
        cursor: {
          x: x - (x % 21),
          y: y - (y % 21),
        },
      })
    }
  }

  const onClick = () => {
    if (visualState.mode == "PLACING") {
      if (visualState.userCampaignId) {
        placePlayer(visualState.userCampaignId, visualState.cursor)
        setVisualState({ mode: "DEFAULT" })
      }
    }
  }

  const startPlacing = (userCampaignId) => {
    setVisualState({ mode: "PLACING", userCampaignId: userCampaignId })
    setGameState({
      ...gameState,
      ...{
        users: {
          ...gameState.users,
          [userCampaignId]: {
            ...gameState.users[userCampaignId],
            token: undefined,
          },
        },
      },
    })
  }

  const placePlayer = (userCampaignId, pos) => {
    setGameState({
      ...gameState,
      ...{
        users: {
          ...gameState.users,
          [userCampaignId]: {
            ...gameState.users[userCampaignId],
            token: pos,
          },
        },
      },
    })
  }

  return (
    <>
      <Layout
        fullscreen={true}
        breadcrumbs={[
          {
            text: props.campaign.name as string,
            url: `/campaign/${props.campaign.id}`,
          },
          { text: props.encounter.name as string },
        ]}
      >
        <div className="pb-4">
          <h1 className="inline-block text-3xl mr-4">{props.encounter.name}</h1>
          {props.encounter.visibility == "DRAFT" && (
            <span className="text-2xl mr-4"> (Draft) </span>
          )}
          <button className="inline-block bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-2 rounded">
            <span
              className="font-small"
              onClick={() => setManageCharacterModal(true)}
            >
              {" "}
              Manage Character{" "}
            </span>
          </button>
        </div>
        <div
          ref={ref}
          className="h-4/6 w-full bg-blue-100 flex"
          style={{
            backgroundImage:
              "repeating-linear-gradient(#ccc 0 1px, transparent 1px 100%), repeating-linear-gradient(90deg, #ccc 0 1px, transparent 1px 100%)",
            backgroundSize: "21px 21px",
          }}
          onMouseMove={mouseMove}
          onClick={onClick}
        >
          <div className="flex-none w-30"></div>
          <div className="flex-grow">
            {visualState.mode == "PLACING" && visualState.cursor && (
              <div
                style={{
                  width: "21px",
                  height: "21px",
                  backgroundColor: "blue",
                  transform: `translate(${visualState.cursor.x}px, ${visualState.cursor.y}px)`,
                }}
              />
            )}
            {Object.entries(gameState.users)
              .filter(([id, user]) => !!user.token)
              .map(([id, user]) => (
                <div
                  key={id}
                  onClick={() => startPlacing(id)}
                  style={{
                    width: "21px",
                    height: "21px",
                    backgroundColor: "green",
                    transform: `translate(${user.token?.x}px, ${user.token?.y}px)`,
                  }}
                />
              ))}
          </div>
          <div className="flex-none w-30">
            <div className="border-solid border-4 bg-white p-2">
              <p className="font-bold mb-2"> Order </p>
              {props.campaign.users
                .filter((userCampaign) => !!userCampaign.accepted)
                .map((userCampaign) => (
                  <div key={userCampaign.user.id}>
                    <span> {userCampaign.user.name} </span>
                    <button
                      className="inline-block bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded"
                      onClick={() => startPlacing(userCampaign.id)}
                    >
                      <span>Place</span>
                    </button>
                  </div>
                ))}
            </div>
            {currentCampaignUser.admin && (
              <button className="inline-block bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-2 rounded">
                <span className="font-small" onClick={endTurn}>
                  {" "}
                  Skip Turn{" "}
                </span>
              </button>
            )}
          </div>
        </div>

        {manageCharacterModal && (
          <Modal hide={() => setManageCharacterModal(false)}>Hi</Modal>
        )}
      </Layout>
      <div className="fixed bottom-0 h-60 w-full text-center">
        <Hand cards={cards} playCard={playCard} />
      </div>
    </>
  )
}

export const getServerSideProps = async (context) => {
  const session = await getSession(context)
  if (!session) {
    return { props: {} }
  }
  const encounter = await prisma.encounter.findFirst({
    where: {
      id: context.params.id as string,
      campaign: {
        users: {
          some: {
            userEmail: session?.user?.email as string,
            accepted: {
              not: null,
            },
          },
        },
      },
    },
    include: {
      campaign: {
        include: {
          users: {
            include: {
              user: true,
            },
          },
        },
      },
    },
  })
  return {
    props: {
      session: session,
      encounter: encounter,
      campaign: encounter?.campaign,
    },
  }
}
