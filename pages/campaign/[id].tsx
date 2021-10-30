import { GetServerSideProps } from "next"
import type { Session } from "next-auth"
import { useSession, getSession } from "next-auth/react"
import Layout from "components/layout"
import prisma from "lib/prisma"
import { useState } from "react"
import Encounters from "components/campaign/encounters"
import Players from "components/campaign/players"

export default function Page(props) {
  const { data: session } = useSession()
  const [campaign, setCampaign] = useState(props.campaign)
  const [tab, setTab] = useState("encounters")

  if (!session) {
    return <Layout>Campaign not found</Layout>
  }
  if (!props.campaign) {
    return <Layout>Campaign not found</Layout>
  }

  return (
    <Layout breadcrumbs={[{ text: campaign.name }]}>
      <div className="border-b-2 border-gray-100 pb-6 mb-8">
        <h1 className="inline-block text-3xl mr-10">{campaign.name}</h1>
        <span
          onClick={() => setTab("encounters")}
          className={`mr-10 font-medium ${
            tab != "encounters" && "text-gray-500 hover:text-gray-900"
          }`}
        >
          Encounters
        </span>
        <span
          onClick={() => setTab("players")}
          className={`font-medium ${
            tab != "players" && "text-gray-500 hover:text-gray-900"
          }`}
        >
          Players
        </span>
      </div>
      {tab == "encounters" && (
        <Encounters
          userCampaign={props.userCampaign}
          encounters={props.encounters}
          campaign={props.campaign}
        />
      )}

      {tab == "players" && (
        <Players
          campaign={props.campaign}
          userCampaign={props.userCampaign}
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
      ...(!userCampaign?.admin && {
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
