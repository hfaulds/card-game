import { getSession } from "next-auth/react"
import type { NextApiRequest, NextApiResponse } from "next"
import { NewGameState, GameState, Decks } from "lib/game_state"

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
    },
  })
  if (!currentUserCampaign) {
    res.status(403).end("")
    return
  }
  const campaign = await prisma.campaign.findFirst({
    where: {
      id: id as string,
      users: {
        some: {
          admin: true,
          userEmail: currentUserCampaign.userEmail,
          accepted: {
            not: null,
          },
        },
      },
    },
    select: {
      id: true,
      state: true,
      users: {
        where: {
          accepted: {
            not: null,
          },
        },
        select: {
          id: true,
          user: {
            select: {
              name: true,
            },
          },
        },
      },
    },
  })
  if (!campaign) {
    res.status(404).end("")
    return
  }

  switch (method) {
    case "PUT":
      const { token, tokenId, encounterId } = req.body
      if (
        !(
          tokenId &&
          encounterId &&
          token.color &&
          (!token?.pos ||
            (typeof token?.pos?.x == "number" &&
              typeof token?.pos?.y == "number"))
        )
      ) {
        console.log(tokenId, encounterId, token)
        res.status(422).send("")
        return
      }
      if (!(currentUserCampaign?.admin || currentUserCampaign.id == tokenId)) {
        res.status(403).send("")
        return
      }
      let pos = ""
      if (token.pos) {
        pos = `,"pos":{"x":${token.pos.x},"y":${token.pos.y}}`
      }
      await prisma.$executeRawUnsafe(
        `UPDATE Encounter
        SET state = JSON_MERGE_PATCH(state, '{"tokens":{"${tokenId}":{"color":"${token.color}"${pos}}}}')
        WHERE id = ?;`,
        encounterId
      )
      res.statusCode = 200
      res.send("")
      break
    default:
      res.setHeader("Allow", ["PUT"])
      res.status(405).end(`Method ${method} Not Allowed`)
  }
}