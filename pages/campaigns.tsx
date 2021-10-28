import { GetServerSideProps } from "next"
import type { Session } from "next-auth"
import { useSession, getSession } from "next-auth/react"
import Layout from "../components/layout"
import NewCampaignModal from "../components/new_campaign_modal"
import ManagePlayersModal from "../components/manage_players_modal"
import prisma from "/lib/prisma"
import { useState, useReducer } from "react"
import { CheckCircleIcon, ChevronDoubleRightIcon, LogoutIcon, PlusCircleIcon, TrashIcon, XCircleIcon } from '@heroicons/react/outline'
import { useRouter } from 'next/router'
import { CampaignActions, UserCampaignsReducer } from '/lib/reducers/user_campaigns'

export default function Page(props) {
  const { data: session } = useSession()
  if(!session) {
    return <Layout/>
  }
  const router = useRouter()
  const [showingNewCampaignModal, setShowingNewCampaignModal] = useState(false)
  const [managePlayersForCampaign, setManagePlayersForCampaign] = useState(undefined)
  const [userCampaigns, setUserCampaigns] = useReducer(UserCampaignsReducer,
    props.userCampaigns.filter((uc) => uc.accepted),
  )
  const [invites, setInvites] = useState(
    props.userCampaigns.filter((uc) => !uc.accepted),
  )

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
    setUserCampaigns({ type: CampaignActions.CreateCampaign, value: campaign })
  }

  const addPlayer = async (campaign, invite) => {
    setUserCampaigns({ type: CampaignActions.AddPlayer, value: { invite, campaign: campaign } })
  }

  const removePlayer = async (campaign, invite) => {
    setUserCampaigns({ type: CampaignActions.RemovePlayer, value: { inviteId: invite.id, campaign: campaign} })
  }

  const acceptInvite = async (invite) => {
    const res = await fetch(`/api/invite/${invite.id}`, {
      method: 'PUT',
    })
    if(!res.ok) {
      return
    }
    setInvites(
      invites.filter((i) => i.id != invite.id),
    )
    setUserCampaigns({ type: CampaignActions.CreateCampaign, value: invite.campaign })
  }

  const rejectInvite = async (invite) => {
    const res = await fetch(`/api/invite/${invite.id}`, {
      method: 'DELETE',
    })
    if(!res.ok) {
      return
    }
    setInvites(
      invites.filter((i) => i.id != invite.id),
    )
  }

  const deleteCampaign = async ({id}) => {
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
    setUserCampaigns({ type: CampaignActions.DeleteCampaign, value: id })
  }

  const openCampaign = async ({id}) => {
    router.push(`/campaign/${id}`)
  }

  return (
    <Layout>
      <div className="pb-4 mb-5">
        <h1 className="text-3xl">{ props.user.name }</h1>
      </div>
      <div className="pb-4 mb-5">
        <h1 className="inline-block text-2xl mr-2">Campaigns</h1>
        <button className="inline-block bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" onClick={() => { setShowingNewCampaignModal(true) && setManagePlayersForCampaign(undefined) }}> New Campaign </button>
      </div>
      <table className="table-fixed w-full mb-10">
        <tbody>
        {
          userCampaigns.map(({id, admin, campaign}) => {
            return <tr key={id}>
              <td className="pr-10">
                <button className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-2 mr-4 rounded" onClick={() => openCampaign(campaign)}>
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
                {
                  admin && <PlusCircleIcon className="inline-block w-8 h-8 stroke-1 text-gray-400 hover:text-black" onClick={() => setManagePlayersForCampaign(campaign.id)}/>
                }
              </td>
              <td className="p-2">
                {
                  admin ? (
                    <button className="float-right bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded" onClick={() => deleteCampaign(campaign)}>
                      <TrashIcon className="h-4 w-4"/>
                    </button>
                  ) : (
                    <button className="float-right bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">
                      <LogoutIcon className="h-4 w-4"/>
                    </button>
                  )
                }
              </td>
            </tr>
          })
        }
        </tbody>
      </table>
      <div className="pb-4">
        <h1 className="inline-block text-2xl mr-2">Invites</h1>
      </div>
      <table className="table-fixed w-full">
        <tbody>
        {
          invites.map((invite) => {
            return <tr key={invite.id}>
              <td className="pr-10">
                <span className="font-bold capitalize">{invite.campaign.name}</span>
              </td>
              <td className="p-2">
                {
                  invite.campaign.users.filter((campaignUser) => !!campaignUser.accepted).map(({user}) =>
                    <img key={invite.campaign.id + user.id} src={user.image} className="w-8 h-8 rounded-full mr-2 inline-block"/>
                  )
                }
              </td>
              <td className="p-2">
                <button className="float-right bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded" onClick={() => rejectInvite(invite)}>
                  <XCircleIcon className="h-4 w-4"/>
                </button>
                <button className="float-right bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mr-2" >
                  <CheckCircleIcon className="h-4 w-4" onClick={() => acceptInvite(invite)}/>
                </button>
              </td>
            </tr>
          })
        }
        </tbody>
      </table>
      { showingNewCampaignModal && <NewCampaignModal hide={() => setShowingNewCampaignModal(false)} complete={createCampaign} defaultName={`New Campaign${userCampaigns.length == 0 ? "" : " " + (userCampaigns.length + 1)}`}/> }
      {
        <ManagePlayersModal
          campaign={ !!managePlayersForCampaign && userCampaigns.map((u) => u.campaign).find((c) => c.id == managePlayersForCampaign) }
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
  const userCampaigns = await prisma.campaignsOnUsers.findMany({
    where: {
      userEmail: user.email,
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
      user: user,
      userCampaigns: userCampaigns,
    },
  }
}
