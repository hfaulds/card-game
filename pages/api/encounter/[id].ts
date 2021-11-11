import { getSession } from "next-auth/react"
import type { NextApiRequest, NextApiResponse } from "next"
import { NewGameState, GameState, Decks, PatchForEvent } from "lib/game_state"

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
    case "POST":
      const state = NewGameState(
        campaign.users,
        campaign.state && campaign.state["decks"]
      )
      const encounter = await prisma.encounter.create({
        data: {
          campaignId: campaign.id,
          name: req.body.name,
          state: state as any,
        },
      })
      res.statusCode = 200
      res.json({ encounter })
      break
    case "PATCH":
      await prisma.$transaction(async (prisma) => {
        await prisma.$executeRawUnsafe(
          `UPDATE Encounter
          SET state = JSON_SET(state, '$.version', JSON_EXTRACT(state, '$.version') + 1)
          WHERE id = ?;`,
          req.body.encounterId
        )
        const encounter = await prisma.encounter.findUnique({
          where: {
            id: req.body.encounterId,
          },
        })
        if (!encounter) {
          res.status(404).send("")
          return
        }
        const patch = PatchForEvent(
          encounter.state as unknown as GameState,
          req.body.patch
        )
        if (!patch) {
          res.status(422).send("")
          return
        }
        await prisma.$executeRawUnsafe(
          `UPDATE Encounter
          SET state = JSON_MERGE_PATCH(state, '${JSON.stringify(patch)}')
          WHERE id = ?;`,
          req.body.encounterId
        )
        res.statusCode = 200
        res.json({ patch })
        return
      })
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
      res.setHeader("Allow", ["GET", "PUT", "DELETE"])
      res.status(405).end(`Method ${method} Not Allowed`)
  }
}
