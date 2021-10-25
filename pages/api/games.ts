// This is an example of to protect an API route
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
  const user = await prisma.user.findUnique({
    where: {
      email: session.user.email,
    },
  })
  const { method } = req
  switch (method) {
    case 'POST':
      const { body: { name } } = req
      const newGame = await prisma.game.create({
        data: {
          name: name,
          users: {
            create: [
              {
                admin: true,
                accepted: new Date(),
                user: {
                  connect: {
                    id: user.id,
                  },
                },
              },
            ],
          },
          state: {},
        },
        include: {
          users: true,
        },
      })
      res.statusCode = 201
      res.json({ game: newGame })
      break
    case 'DELETE':
      const { body: { id } } = req
      const gameToDelete = await prisma.game.findMany({
        where: {
          id: id,
          users: {
            every: {
              userId: user.id,
            },
          },
        },
        select: {
          id: true,
        }
      })
      if (gameToDelete.length != 1) {
        res.status(403).end(`Access Denied`)
      }
      await prisma.game.delete({
        where: {
          id: gameToDelete[0].id,
        },
      })
      res.statusCode = 200
      res.json({ game: { id } })
      break;
    default:
      res.setHeader('Allow', ['GET', 'PUT'])
      res.status(405).end(`Method ${method} Not Allowed`)
  }
}
