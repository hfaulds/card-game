import { GetServerSideProps } from "next"
import type { Session } from "next-auth"
import { useSession, getSession } from "next-auth/react"
import Layout from "components/layout"
import prisma from "lib/prisma"
import { useRouter } from 'next/router'
import { useState } from "react"
import Hand from "components/campaign/hand"
import Modal from "components/modal"

export default function Page(props) {
  const { data: session } = useSession()
  const [manageCharacterModal, setManageCharacterModal] = useState(false)

  if(!session) {
    return <Layout>
      Encounter not found
    </Layout>
  }
  if(!props.encounter) {
    return <Layout>
      Encounter not found
    </Layout>
  }

  const currentCampaignUser = props.campaign.users.find((campaignUser) => campaignUser.userEmail == session?.user?.email)
  const endTurn = () => {
  }
  const playCard = () => {
  }

  const cards = [{id: "0"},{id: "1"},{id: "2"},{id: "3"},{id: "4"},{id: "5"}]
  return (
    <Layout fullscreen={true} breadcrumbs={[
      { text: (props.campaign.name as string), url: `/campaign/${props.campaign.id}` },
      { text: (props.encounter.name as string) }]}>
      <div className="pb-4">
        <h1 className="inline-block text-3xl mr-4">{ props.campaign.name }</h1>
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
              props.campaign.users.filter((campaignUser) => !!campaignUser.accepted).map(({user}) =>
                <p key={user.id} > {user.name} </p>
              )
            }
          </div>
          {
            currentCampaignUser.admin && (
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
          <Modal hide={() => setManageCharacterModal(false)}>
            Hi
          </Modal>
        )
      }
    </Layout>
  )
}

export const getServerSideProps = async (context) => {
  const session = await getSession(context)
  if (!session) {
    return {props: {}}
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
        }
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
