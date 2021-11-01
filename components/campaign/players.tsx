import { useState } from "react"
import { PlusCircleIcon, MinusCircleIcon } from "@heroicons/react/outline"
import { Cards } from "lib/cards"

export default function Players(props) {
  const [state, setState] = useState({
    users: [],
    ...props.campaign.state,
  })

  const addCard = async (userCampaign, card, quantity) => {
    const oldCards = state.users[userCampaign.id]?.cards || {}
    const newCount = (oldCards[card.id] || 0) + quantity
    if (newCount < 0) {
      return
    }
    const res = await fetch(`/api/campaign/${props.campaign.id}/cards`, {
      body: JSON.stringify({
        cardId: card.id,
        quantity: newCount,
      }),
      headers: {
        "Content-Type": "application/json",
      },
      method: "PUT",
    })
    if (!res.ok) {
      return
    }
    setState({
      ...state,
      ...{
        users: {
          ...state.users,
          [userCampaign.id]: {
            cards: {
              ...oldCards,
              [card.id]: newCount,
            },
          },
        },
      },
    })
  }

  return props.campaign.users
    .filter((userCampaign) => !!userCampaign.accepted)
    .map((userCampaign) => {
      const user = userCampaign.user
      const userCards = state.users[userCampaign.id]?.cards || []
      return (
        <div key={userCampaign.id} className="flex flex-wrap space-x-5">
          <div className="">{user.name}</div>
          {Cards.map((card) => (
            <div
              key={card.id}
              className="flex flex-col border-solid border-2 mb-2 shadow w-28 h-40 bg-white border-gray-400 text-gray-400 p-2"
            >
              <div className="flex-none">{card.name}</div>
              <div className="flex-grow">{userCards[card.id] || 0}</div>

              {
                (props.currentUserCampaign.admin || props.currentUserCampaign == userCampaign) && (
                  <div className="flex flex-none justify-center">
                    <PlusCircleIcon
                    onClick={() => addCard(userCampaign, card, 1)}
                    className="inline-block text-gray-400 hover:text-gray-600 w-6 h-6" />
                    <MinusCircleIcon
                    onClick={() => addCard(userCampaign, card, -1)}
                    className="inline-block text-gray-400 hover:text-gray-600 w-6 h-6" />
                  </div>
                )
              }
            </div>
          ))}
        </div>
      )
    })
}
