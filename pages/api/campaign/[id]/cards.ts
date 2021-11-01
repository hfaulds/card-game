import { getSession } from "next-auth/react"
import type { NextApiRequest, NextApiResponse } from "next"

import prisma from "lib/prisma"

export default async function protectedHandler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getSession({ req })
  if (!session) {
    return res.send({
      error: "You must be sign in to view the protected content on this page.",
    })
  }
  const email = session?.user?.email as string
  const {
    method,
    query: { id },
    body: { cardId, quantity},
  } = req
  const currentUserCampaign = await prisma.campaignsOnUsers.findFirst({
    where: {
      campaignId: id as string,
      userEmail: email,
    },
  })
  if (!currentUserCampaign?.admin) {
    res.status(403).send("")
    return
  }
  switch (method) {
    case "PUT":
      if (typeof cardId !== "string" || typeof quantity !== "number") {
        res.status(422).send("")
        return
      }
      if (!currentUserCampaign?.admin) {
        res.status(403).send("")
        return
      }
      await prisma.$executeRawUnsafe(`UPDATE Campaign
        SET state = JSON_MERGE_PATCH(state, '{"users":{"${currentUserCampaign?.id}":{"cards":{"${cardId}":${quantity}}}}}')
        WHERE id = ?;`,
        currentUserCampaign?.campaignId,
      )
      res.statusCode = 200
      res.send("")
      break
    default:
      res.setHeader("Allow", ["PUT"])
      res.status(405).end(`Method ${method} Not Allowed`)
  }
}
