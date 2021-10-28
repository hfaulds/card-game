import { GetServerSideProps } from "next"
import type { Session } from "next-auth"
import { useSession, getSession } from "next-auth/react"
import Layout from "../components/layout"
import NewCampaignModal from "../components/new_campaign_modal"
import ManagePlayersModal from "../components/manage_players_modal"
import prisma from "/lib/prisma"
import { useState, useReducer } from "react"
import { ChevronDoubleRightIcon, PlusCircleIcon, TrashIcon } from '@heroicons/react/outline'
import { useRouter } from 'next/router'
import { CampaignActions, CampaignsReducer } from '/lib/reducers/campaigns'

export default function Page(props) {
  const { data: session } = useSession()
  if(!session) {
    return <Layout/>
  }
  const router = useRouter()
  const [showingNewCampaignModal, setShowingNewCampaignModal] = useState(false)
  const [managePlayersForCampaign, setManagePlayersForCampaign] = useState(undefined)
  const [campaigns, setCampaigns] = useReducer(CampaignsReducer, props.campaigns)

  const createCampaign = async (name, invites) => {
    const res = await fetch('api/campaigns', {
      body: JSON.stringify({ name, invites }),
      headers: {
        'Content-Type': 'application/json'
      },
      method: 'POST',
    })
    if(!res.ok) {
      return
    }
    const campaign = (await res.json()).campaign
    setCampaigns({ type: CampaignActions.CreateCampaign, value: campaign })
  }

  const addPlayer = async (campaign, email) => {
    const res = await fetch(`api/campaign/${campaign.id}`, {
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
    setCampaigns({ type: CampaignActions.AddPlayer, value: { invite, campaign: campaign } })
  }

  const removePlayer = async (campaign, invite) => {
    const res = await fetch(`api/campaign/${campaign.id}`, {
      body: JSON.stringify({ inviteId: invite.id }),
      headers: {
        'Content-Type': 'application/json'
      },
      method: 'DELETE',
    })
    if(!res.ok) {
      return
    }
    setCampaigns({ type: CampaignActions.RemovePlayer, value: { inviteId: invite.id, campaign: campaign} })
  }

  const deleteCampaign = async (id) => {
    const res = await fetch('api/campaigns', {
      body: JSON.stringify({ id }),
      headers: {
        'Content-Type': 'application/json'
      },
      method: 'DELETE'
    })
    if(!res.ok) {
      return
    }
    setCampaigns({ type: CampaignActions.DeleteCampaign, value: id })
  }

  const openCampaign = async (id) => {
    router.push(`/campaign/${id}`)
  }

  return (
    <Layout>
      <div className="pb-4">
        <h1 className="text-3xl">{ props.user.name }</h1>
      </div>
      <div className="pb-4">
        <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" onClick={() => { setShowingNewCampaignModal(true) && setManagePlayersForCampaign(undefined) }}> New Campaign </button>
      </div>
      <table className="table-fixed w-full">
        <tbody>
        {
          campaigns.map((campaign) =>
            <tr key={campaign.id}>
              <td className="pr-10">
                <button className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-2 mr-4 rounded" onClick={() => openCampaign(campaign.id)}>

                  <ChevronDoubleRightIcon className="h-4 w-4"/>
                </button>
                <span className="font-bold capitalize">{campaign.name}</span>
              </td>
              <td className="p-2">
                {
                  campaign.users.filter((campaignUser) => !!campaignUser.accepted).map(({user}) =>
                    <img key={campaign.id + user.id} src={user.image} className="w-8 h-8 rounded-full mr-2 inline-block"/>
                  )
                }
                <PlusCircleIcon className="inline-block w-8 h-8 stroke-1 text-gray-400 hover:text-black" onClick={() => setManagePlayersForCampaign(campaign.id)}/>
              </td>
              <td className="p-2">
                <button className="float-right bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded" onClick={() => deleteCampaign(campaign.id)}>
                  <TrashIcon className="h-4 w-4"/>
                </button>
              </td>
            </tr>
          )
        }
        </tbody>
      </table>
      { showingNewCampaignModal && <NewCampaignModal hide={() => setShowingNewCampaignModal(false)} complete={createCampaign} defaultName={`New Campaign${campaigns.length == 0 ? "" : " " + (campaigns.length + 1)}`}/> }
      {
        <ManagePlayersModal
          campaign={campaigns.find((g) => g.id == managePlayersForCampaign)}
          hide={() => setManagePlayersForCampaign(undefined)}
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
  const campaigns = await prisma.campaign.findMany({
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
      campaigns: campaigns,
    },
  }
}
