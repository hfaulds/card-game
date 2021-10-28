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
  const { method, query: { id } } = req
  const invite = await prisma.campaignsOnUsers.findUnique({
    where: {
      id: id,
    },
  })
  if (!invite || invite.userEmail != session.user.email) {
    res.status(404).end("")
    return
  }

  switch (method) {
    case 'PUT':
      const invite = await prisma.campaignsOnUsers.update({
	where: { id },
        data: {
	  accepted: new Date(),
        },
      })
      res.statusCode = 200
      res.json({ invite })
      return
    case 'DELETE':
      await prisma.campaignsOnUsers.delete({ where: { id } })
      res.status(200).send("")
      return
    default:
      res.setHeader('Allow', ['PUT', 'DELETE'])
      res.status(405).end(`Method ${method} Not Allowed`)
  }
}
