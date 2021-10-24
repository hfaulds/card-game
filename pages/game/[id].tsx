import { GetServerSideProps } from "next"
import type { Session } from "next-auth"
import { useSession, getSession } from "next-auth/react"
import Layout from "/components/layout"
import prisma from "/lib/prisma"
import { useRouter } from 'next/router'

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
  return (
    <Layout>
      <div className="pb-4">
        <h1 className="text-3xl">{ props.game.name }</h1>
      </div>
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
  const user = await prisma.user.findUnique({
    where: {
      email: session.user.email,
    },
  })
  const game = await prisma.game.findFirst({
    where: {
      id: context.params.id,
      users: {
        every: {
          id: user.id,
        },
      },
    },
  })
  return {
    props: {
      session: session,
      user: user,
      game: game,
    },
  }
}
