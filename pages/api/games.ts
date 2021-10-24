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
  const { body: { name }, method } = req
  switch (method) {
    case 'POST':
      const user = await prisma.user.findUnique({
        where: {
          email: session.user.email,
        },
      })
      await prisma.game.create({
        data: {
          name: name,
          users: {
            connect: { id: user.id }
          },
          state: {},
        },
      })
      res.statusCode = 201
      res.json({ name })
      break
    default:
      res.setHeader('Allow', ['GET', 'PUT'])
      res.status(405).end(`Method ${method} Not Allowed`)
  }
}
