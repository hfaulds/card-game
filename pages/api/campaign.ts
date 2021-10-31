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
  const user = await prisma.user.findUnique({
    where: {
      email: session?.user?.email as string,
    },
  })
  if (!user) {
    return res.status(403).end(`Access Denied`)
  }
  const { method } = req
  switch (method) {
    case "POST":
      const {
        body: { name, invites },
      } = req
      const users = invites
        .map((email) => {
          return {
            admin: false,
            userEmail: email,
          }
        })
        .concat({
          admin: true,
          accepted: new Date(),
          userEmail: user.email as string,
        })
      const newCampaign = await prisma.campaign.create({
        data: {
          name: name,
          state: {},
          users: {
            create: users,
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
      res.statusCode = 201
      res.json({ campaign: newCampaign })
      break
    case "DELETE":
      const {
        body: { id },
      } = req
      const campaignToDelete = await prisma.campaign.findMany({
        where: {
          id: id,
          users: {
            some: {
              admin: true,
              userEmail: user.email as string,
            },
          },
        },
        select: {
          id: true,
        },
      })
      if (campaignToDelete.length != 1) {
        return res.status(403).end(`Access Denied`)
      }
      await prisma.campaign.delete({
        where: {
          id: campaignToDelete[0].id,
        },
      })
      res.statusCode = 200
      res.json({ campaign: { id } })
      break
    default:
      res.setHeader("Allow", ["GET", "PUT"])
      res.status(405).end(`Method ${method} Not Allowed`)
  }
}
