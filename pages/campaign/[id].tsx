import { GetServerSideProps } from "nextcard"
import type { Session } from "next-auth"
import { useSession, getSession } from "next-auth/react"
import Layout from "/components/layout"
import prisma from "/lib/prisma"
import { useRouter } from 'next/router'
import { useState, useReducer } from "react"
import Hand from "/components/campaign/hand"
import ManagePlayersModal from "/components/manage_players_modal"
import { CogIcon, TrashIcon } from '@heroicons/react/outline'
import { Transition } from 'react-transition-group';

export default function Page(props) {
  const { data: session } = useSession()
  if(!session) {
    return <Layout>
      Campaign not found
    </Layout>
  }
  if(!props.campaign) {
    return <Layout>
      Campaign not found
    </Layout>
  }
  const router = useRouter()
  const [campaign, setCampaign] = useState(props.campaign)
  const [managePlayersModal , setManagePlayersModal] = useState(false)

  const addPlayer = async (campaign, invite) => {
    setCampaign({
      ...campaign,
      ... {
        users: campaign.users.concat(invite),
      }
    })
  }

  const removePlayer = async (campaign, invite) => {
    setCampaign({
      ...campaign,
      ... {
        users: campaign.users.filter((u) => u.id != invite.id)
      }
    })
  }

  const addEncounter = async () => {
    const encounterName = `Encounter ${campaign.encounters.length + 1}`
    const res = await fetch(`/api/encounter/${campaign.id}`, {
      body: JSON.stringify({
        name: encounterName,
      }),
      headers: {
        'Content-Type': 'application/json'
      },
      method: 'POST',
    })
    if(!res.ok) {
      return
    }
    const encounter = (await res.json()).encounter
    setCampaign({
      ...campaign,
      ...{
        encounters: campaign.encounters.concat({
          created: true,
          ...encounter,
        }),
      },
    })
  }

  const removeEncounter = async (encounter) => {
    const res = await fetch(`/api/encounter/${campaign.id}`, {
      body: JSON.stringify({
        encounterId: encounter.id,
      }),
      headers: {
        'Content-Type': 'application/json'
      },
      method: 'DELETE',
    })
    if(!res.ok) {
      return
    }
    setCampaign({
      ...campaign,
      ...{
        encounters: campaign.encounters.map((e) => {
          if (e.id == encounter.id) {
            return { deleted: true, ...e }
          }
          return e
        })
      },
    })
  }

  const openEncounter = async (id) => {
    router.push(`/encounter/${id}`)
  }

  return (
    <Layout breadcrumbs={[{ text: campaign.name }]}>
      <div className="pb-4">
        <h1 className="inline-block text-3xl mr-4">{ campaign.name }</h1>
        <CogIcon className="inline-block w-8 h-8 stroke-1 text-gray-400 hover:text-black" onClick={() => setManagePlayersModal(true)}/>
      </div>
      <div className="flex flex-col-reverse">
        {
          campaign.encounters.map((encounter, i) =>
            <Transition key={encounter.id} in={!encounter.deleted} appear={!!encounter.created} timeout={{exit: 500}}>
              { state => (
                <div key={0} className="flex-col" style={{
                  transition: `all 500ms ease-in-out`,
                  ...(state == "entering" && { opacity: 0 }),
                  ...(state == "entered" && { opacity: 100 }),
                  ...(state == "exiting" && { opacity: 0 }),
                  ...(state == "exited" && { opacity: 0, display: "none" }),
                }}>
                  <div className="flex w-full">
                    <div className="flex-grow"/>
                    <div className="flex-none bg-gray-100 w-0.5 h-10 m-2">
                    </div>
                    <div className="flex-grow"/>
                  </div>
                  <div className="flex w-full">
                    <div className="flex-grow"/>
                    <div className="flex-none border-solid border-2 font-bold p-4 rounded text-center">
                      <div className="mb-2">
                        <span className="inline-block"> { encounter.name } </span>
                        { props.userCampaign.admin && (
                          <TrashIcon className="text-gray-300 hover:text-gray-600 inline-block h-4 w-4" onClick={() => removeEncounter(encounter)}/>
                        )}
                      </div>
                      <button className="bg-green-500 hover:bg-green-700 text-white font-bold p-1 rounded" onClick={() => openEncounter(encounter.id)}>
                        Open
                      </button>
                    </div>
                    <div className="flex-grow"/>
                  </div>
                </div>
              )}
            </Transition>
          )
        }
        {
          props.userCampaign.admin && (
            <div className="flex w-full">
              <div className="flex-grow"/>
              <button className="flex-none border-solid border-2 font-bold py-2 px-4 rounded hover:bg-gray-100" onClick={addEncounter}>
                New Encounter
              </button>
              <div className="flex-grow"/>
            </div>
          )
        }
      </div>
      {
      managePlayersModal && <ManagePlayersModal
          campaign={campaign}
          hide={() => setManagePlayersModal(undefined)}
          addPlayer={addPlayer}
          removePlayer={removePlayer}/>
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
  const campaign = await prisma.campaign.findFirst({
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
      encounters: true,
    },
  })
  const userCampaign = campaign.users.find((u) => u.userEmail == session.user.email)
  return {
    props: {
      session: session,
      campaign: campaign,
      userCampaign: userCampaign,
    },
  }
}
