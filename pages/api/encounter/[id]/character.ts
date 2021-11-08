import { getSession } from "next-auth/react"
import type { NextApiRequest, NextApiResponse } from "next"
import { NewGameState, GameState, Decks } from "lib/game_state"
import { v4 as uuidv4 } from "uuid"

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
  const {
    method,
    query: { id },
  } = req
  const currentUserCampaign = await prisma.campaignsOnUsers.findFirst({
    where: {
      campaignId: id as string,
      userEmail: session?.user?.email as string,
      admin: true,
    },
  })
  if (!currentUserCampaign?.admin) {
    res.status(403).end("")
    return
  }
  const { name, encounterId } = req.body
  switch (method) {
    case "POST":
      if (!name) {
        res.status(422).send("")
        return
      }
      const charId = uuidv4()
      const tokenColor = "blue-500"
      await prisma.$executeRawUnsafe(
        `UPDATE Encounter
        SET state = JSON_MERGE_PATCH(state, '{"characters":{"${charId}":{"name":"${name}","health":100,"npc":true}},"tokens":{"${charId}":{"color":"${tokenColor}"}}}')
        WHERE id = ?;`,
        encounterId
      )
      res.statusCode = 200
      res.json({ character: { id: charId, name, tokenColor } })
      break
    default:
      res.setHeader("Allow", ["PUT"])
      res.status(405).end(`Method ${method} Not Allowed`)
  }
}
