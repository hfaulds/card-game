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
  const currentUser = await prisma.user.findUnique({
    where: {
      email: <string>session?.user?.email,
    },
  })
  if (!currentUser) {
    res.status(403).end("")
    return
  }
  const {
    method,
    query: { id },
  } = req
  const campaign = await prisma.campaign.findFirst({
    where: {
      id: <string>id,
      users: {
        some: {
          admin: true,
          userEmail: <string>currentUser.email,
          accepted: {
            not: null,
          },
        },
      },
    },
    select: {
      id: true,
    },
  })
  if (!campaign) {
    res.status(404).end("")
    return
  }

  switch (method) {
    case "POST":
      const encounter = await prisma.encounter.create({
        data: {
          campaignId: campaign.id,
          name: req.body.name,
          state: {},
        },
      })
      res.statusCode = 200
      res.json({ encounter })
      break
    case "DELETE":
      await prisma.encounter.delete({
        where: {
          id: req.body.encounterId,
        },
      })
      res.status(200).send("")
      break
    default:
      res.setHeader("Allow", ["GET", "PUT"])
      res.status(405).end(`Method ${method} Not Allowed`)
  }
}
