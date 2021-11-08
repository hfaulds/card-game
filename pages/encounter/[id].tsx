import { GetServerSideProps } from "next"
import type { Session } from "next-auth"
import { useSession, getSession } from "next-auth/react"
import Layout from "components/layout"
import prisma from "lib/prisma"
import { useRouter } from "next/router"
import { useState, useRef, useReducer } from "react"
import Hand from "components/campaign/hand"
import Modal from "components/modal"
import { Cards } from "lib/cards"
import { RefreshIcon } from "@heroicons/react/outline"
import { Actions, StateReducer, State } from "lib/reducers/state"
import TurnOrder from "components/turn_order"

export default function Page(props) {
  const { data: session } = useSession()
  const [manageCharacterModal, setManageCharacterModal] = useState(false)
  const [{ gameState, visualState }, setState] = useReducer(StateReducer, {
    gameState: props.encounter.state,
    visualState: {
      syncing: 0,
      mode: "DEFAULT",
    },
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
  const playCard = () => {}

  const mouseMove = (e) => {
    const rect = ref!.current!.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    setState({ action: Actions.MoveMouse, value: { x, y } })
  }

  const updateToken = async (tokenId, token) => {
    const res = await fetch(`/api/encounter/${props.campaign.id}/token`, {
      body: JSON.stringify({
        encounterId: props.encounter.id,
        token,
        tokenId,
      }),
      headers: {
        "Content-Type": "application/json",
      },
      method: "PUT",
    })
    if (res.ok) {
      setState({ action: Actions.Synced })
    }
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
          {visualState.syncing > 0 && (
            <RefreshIcon className="inline-block animate-spin h-6 w-6" />
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
          onMouseUp={() => {
            if (
              visualState.mode == "PLACING" &&
              visualState.placingTokenId &&
              visualState.cursor?.pos
            ) {
              setState({ action: Actions.FinishPlacing })
              updateToken(visualState.placingTokenId, visualState.cursor)
            }
          }}
        >
          <div className="flex-none w-30"></div>
          <div className="flex-grow">
            {visualState.mode == "PLACING" && visualState?.cursor?.pos && (
              <div
                className="cursor-move"
                style={{
                  position: "absolute",
                  width: "21px",
                  height: "21px",
                  backgroundColor: "grey",
                  transform: `translate(${visualState.cursor.pos.x}px, ${visualState.cursor.pos.y}px)`,
                }}
              />
            )}
            {Object.keys(gameState.characters)
              .map((id) => ({ tokenId: id, token: gameState.tokens[id] }))
              .filter(({ token }) => token?.pos)
              .map(({ tokenId, token }) => (
                <div
                  className={`bg-${token.color} cursor-move`}
                  key={tokenId}
                  onMouseDown={() =>
                    setState({
                      action: Actions.StartPlacing,
                      value: { tokenId },
                    })
                  }
                  style={{
                    position: "absolute",
                    width: "21px",
                    height: "21px",
                    transform: `translate(${token.pos?.x}px, ${token.pos?.y}px)`,
                  }}
                />
              ))}
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
            <TurnOrder
              encounter={props.encounter}
              gameState={gameState}
              currentUserCampaign={currentUserCampaign}
              setState={setState}
              updateToken={updateToken}
            />
          </div>
        </div>

        {manageCharacterModal && (
          <Modal hide={() => setManageCharacterModal(false)}>Hi</Modal>
        )}
      </Layout>
      <div className="fixed bottom-0 h-0 w-full text-center">
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
            where: {
              accepted: {
                not: null,
              },
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
