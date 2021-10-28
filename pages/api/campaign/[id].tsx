import { getSession } from "next-auth/react"
import type { NextApiRequest, NextApiResponse } from "next"

import prisma from "/lib/prisma"

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
      email: session.user.email,
    },
  })
  const { method, query: { id } } = req
  const campaign = await prisma.campaign.findFirst({
    where: {
      id: id,
      users: {
        some: {
          admin: true,
          userEmail: currentUser.email,
          accepted: {
            not: null,
          },
        },
      },
    },
    select: {
      id: true,
    }
  })
  console.log(campaign)
  if (!campaign) {
    res.status(404).send("")
    return
  }

  switch (method) {
    case 'POST':
      if (req.body.email == currentUser.email) {
        res.statusCode = 422
        return
      }
      const invite = await prisma.campaignsOnUsers.create({
        data: {
          campaignId: id,
          admin: false,
          userEmail: req.body.email,
        },
      })
      res.statusCode = 200
      res.json({ invite })
      break;
    case 'DELETE':
      if (req.body.email == currentUser.id) {
        res.statusCode = 422
        break;
      }
      await prisma.campaignsOnUsers.delete({
        where: {
          id: req.body.inviteId,
        },
      })
      res.status(200).send("")
      break;
    default:
      res.setHeader('Allow', ['GET', 'PUT'])
      res.status(405).end(`Method ${method} Not Allowed`)
  }
}
