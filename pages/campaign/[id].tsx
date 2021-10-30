import { GetServerSideProps } from "next"
import type { Session } from "next-auth"
import { useSession, getSession } from "next-auth/react"
import Layout from "components/layout"
import prisma from "lib/prisma"
import { useState } from "react"
import ManagePlayersModal from "components/manage_players_modal"
import Encounters from "components/campaign/encounters"
import { CogIcon } from "@heroicons/react/outline"

export default function Page(props) {
  const { data: session } = useSession()
  const [campaign, setCampaign] = useState(props.campaign)
  const [managePlayersModal, setManagePlayersModal] = useState(false)

  if (!session) {
    return <Layout>Campaign not found</Layout>
  }
  if (!props.campaign) {
    return <Layout>Campaign not found</Layout>
  }

  const addPlayer = async (campaign, invite) => {
    setCampaign({
      ...campaign,
      ...{
        users: campaign.users.concat(invite),
      },
    })
  }

  const removePlayer = async (campaign, invite) => {
    setCampaign({
      ...campaign,
      ...{
        users: campaign.users.filter((u) => u.id != invite.id),
      },
    })
  }

  return (
    <Layout breadcrumbs={[{ text: campaign.name }]}>
      <div className="pb-4">
        <h1 className="inline-block text-3xl mr-4">{campaign.name}</h1>
        <CogIcon
          className="inline-block w-8 h-8 stroke-1 text-gray-400 hover:text-black"
          onClick={() => setManagePlayersModal(true)}
        />
      </div>
      <Encounters
        userCampaign={props.userCampaign}
        encounters={props.encounters}
        campaign={props.campaign}
      />
      {managePlayersModal && (
        <ManagePlayersModal
          campaign={campaign}
          hide={() => setManagePlayersModal(false)}
          addPlayer={addPlayer}
          removePlayer={removePlayer}
        />
      )}
    </Layout>
  )
}

export const getServerSideProps = async (context) => {
  const session = await getSession(context)
  if (!session) {
    return { props: {} }
  }
  const campaign = await prisma.campaign.findFirst({
    where: {
      id: context.params.id,
      users: {
        some: {
          userEmail: session?.user?.email as string,
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
  if (!campaign) {
    return { props: { session } }
  }
  const userCampaign =
    campaign && campaign.users.find((u) => u.userEmail == session?.user?.email)
  const encounters = await prisma.encounter.findMany({
    where: {
      campaignId: campaign.id,
      ...(!userCampaign.admin && {
        NOT: {
          visibility: "DRAFT",
        },
      }),
    },
  })
  return {
    props: {
      session: session,
      campaign: campaign,
      encounters: encounters,
      userCampaign: userCampaign,
    },
  }
}
