import { useState } from "react"
import { PlusCircleIcon } from "@heroicons/react/outline"
import { Cards } from "lib/cards"

export default function Players(props) {
  const [state, setState] = useState({
    users: [],
    ...props.campaign.state,
  })

  const addCard = (userCampaign, card) => {
    const oldCards = state.users[userCampaign.id]?.cards || {}
    setState({
      ...state,
      ...{
        users: {
          ...state.users,
          [userCampaign.id]: {
            cards: {
              ...oldCards,
              [card.id]: (oldCards[card.id] || 0) + 1,
            },
          },
        },
      },
    })
  }

  return props.campaign.users
    .filter((campaignUser) => !!campaignUser.accepted)
    .map((userCampaign) => {
      const user = userCampaign.user
      const userCards = state.users[userCampaign.id]?.cards || []
      return (
        <div key={userCampaign.id} className="flex flex-wrap space-x-5">
          <div className="">{user.name}</div>
          {Cards.map((card) => (
            <div
              key={card.id}
              className="border-solid border-2 mb-2 shadow w-28 h-40 bg-white border-gray-400 text-gray-400"
            >
              <div>{card.name}</div>
              <div>{userCards[card.id] || 0}</div>

              <div
                onClick={() => addCard(userCampaign, card)}
                className="text-gray-400 hover:text-gray-600"
              >
                <PlusCircleIcon className="block w-6 h-6 stroke-1" />
              </div>
            </div>
          ))}
        </div>
      )
    })
}
