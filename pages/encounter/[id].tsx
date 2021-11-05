import { GetServerSideProps } from "next"
import type { Session } from "next-auth"
import { useSession, getSession } from "next-auth/react"
import Layout from "components/layout"
import prisma from "lib/prisma"
import { useRouter } from "next/router"
import { useState, useRef } from "react"
import Hand from "components/campaign/hand"
import Modal from "components/modal"
import ColorPicker from "components/color_picker"
import { Cards } from "lib/cards"
import { GameState } from "lib/game_state"
import { v4 as uuidv4 } from "uuid"
import { CogIcon, LocationMarkerIcon } from "@heroicons/react/outline"

interface VisualState {
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

  const currentUserCampaign = props.campaign.users.find(
    (userCampaign) => userCampaign.userEmail == session?.user?.email
  )
  const endTurn = () => {}
  const playCard = () => {}

  const mouseMove = (e) => {
    if (visualState.mode == "PLACING" && visualState.cursor) {
      const rect = ref!.current!.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      setVisualState({
        ...visualState,
        cursor: {
          ...visualState.cursor,
          pos: {
            x: x - (x % 21),
            y: y - (y % 21),
          },
        },
      })
    }
  }

  const onClick = () => {
    if (visualState.mode == "PLACING") {
      if (visualState.userCampaignId) {
        updateToken(visualState.userCampaignId, {
          ...gameState.tokens[visualState.userCampaignId],
          pos: visualState.cursor?.pos,
          color: visualState.cursor?.color,
        })
        setVisualState({ mode: "DEFAULT" })
      }
    }
  }

  const selectPlayerTokenColor = (userCampaignId, color) => {
    updateToken(userCampaignId, {
      ...gameState.tokens[userCampaignId],
      color,
    })
  }

  const startPlacing = (userCampaignId) => {
    const token = gameState.tokens[userCampaignId]
    setVisualState({
      mode: "PLACING",
      userCampaignId: userCampaignId,
      lastCursor: token?.pos && {
        pos: token.pos,
        color: token.color,
      },
      cursor: {
        color: token.color,
      },
    })
    setGameState({
      ...gameState,
      tokens: {
        ...gameState.tokens,
        [userCampaignId]: {
          ...token,
          pos: undefined,
        },
      },
    })
  }

  const updateToken = async (userCampaignId, token) => {
    const res = await fetch(`/api/encounter/${props.campaign.id}`, {
      body: JSON.stringify({
        userCampaignId,
        encounterId: props.encounter.id,
        token,
      }),
      headers: {
        "Content-Type": "application/json",
      },
      method: "PUT",
    })
    setGameState({
      ...gameState,
      tokens: {
        ...gameState.tokens,
        [userCampaignId]: token,
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
            {visualState.mode == "PLACING" && visualState?.cursor?.pos && (
              <div
                style={{
                  position: "absolute",
                  width: "21px",
                  height: "21px",
                  backgroundColor: "grey",
                  transform: `translate(${visualState.cursor.pos.x}px, ${visualState.cursor.pos.y}px)`,
                }}
              />
            )}
            {gameState.characters.map(({ id }) => {
              const token = gameState.tokens[id]
              if (!token.pos) {
                return <></>
              }
              return (
                <div
                  className={`bg-${token.color}`}
                  key={id}
                  onClick={() => startPlacing(id)}
                  style={{
                    position: "absolute",
                    width: "21px",
                    height: "21px",
                    transform: `translate(${token.pos?.x}px, ${token.pos?.y}px)`,
                  }}
                />
              )
            })}
            {visualState.lastCursor && (
              <div
                className={`bg-${visualState.lastCursor.color}`}
                style={{
                  position: "absolute",
                  width: "21px",
                  height: "21px",
                  opacity: "50%",
                  transform: `translate(${visualState.lastCursor.pos.x}px, ${visualState.lastCursor.pos.y}px)`,
                }}
              />
            )}
          </div>
          <div className="flex-none w-30">
            <div className="border-solid border-4 bg-white p-2">
              <p className="font-bold mb-2"> Order </p>
              {gameState.characters.map((character, i) => (
                <div key={character.id} className="mb-2">
                  <span> {character.name} </span>
                  {(character.id == currentUserCampaign.id ||
                    currentUserCampaign.admin) && (
                    <>
                      <button
                        className="inline-block bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded"
                        onClick={() => startPlacing(character.id)}
                      >
                        <LocationMarkerIcon className="w-4 h-4" />
                      </button>
                      <button className="inline-block bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded">
                        <CogIcon className="w-4 h-4" />
                      </button>
                    </>
                  )}
                  <ColorPicker
                    onSelect={(color) =>
                      selectPlayerTokenColor(character.id, color)
                    }
                    value={gameState.tokens[character.id]?.color}
                  />
                </div>
              ))}
              {currentUserCampaign.admin && (
                <>
                  <button className="inline-block bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded">
                    <span className="font-small" onClick={endTurn}>
                      Add Character
                    </span>
                  </button>
                  <button className="inline-block bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded">
                    <span className="font-small" onClick={endTurn}>
                      Skip Turn
                    </span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {manageCharacterModal && (
          <Modal hide={() => setManageCharacterModal(false)}>Hi</Modal>
        )}
      </Layout>
      <div className="fixed bottom-0 h-60 w-full text-center">
        <Hand
          cards={gameState.cards[currentUserCampaign.id].hand}
          playCard={playCard}
        />
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
