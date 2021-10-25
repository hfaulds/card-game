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
  const game = await prisma.game.findMany({
    where: {
      id: id,
      users: {
        some: {
          admin: true,
          userEmail: currentUser.id,
        },
      },
    },
    select: {
      id: true,
    }
  })
  if (!game) {
    res.status(404)
    return
  }

  switch (method) {
    case 'POST':
      if (req.body.email == currentUser.email) {
        res.statusCode = 422
        return
      }
      const invite = await prisma.gamesOnUsers.create({
        data: {
          gameId: id,
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
      await prisma.gamesOnUsers.delete({
        where: {
          id: req.body.inviteId,
        },
      })
      res.statusCode = 200
      res.json({ userId: req.body.playerId })
      break;
    default:
      res.setHeader('Allow', ['GET', 'PUT'])
      res.status(405).end(`Method ${method} Not Allowed`)
  }
}
