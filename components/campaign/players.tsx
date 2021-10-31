import { useState } from "react"
import { PlusCircleIcon } from "@heroicons/react/outline"

export default function Players(props) {
  const [state, setState] = useState({
    users: [],
    ...props.campaign.state,
  })

  const addCard = (userCampaign, card) => {
    const oldCards = state.users[userCampaign.id]?.cards || []
    setState({
      ...state,
      ...{
        users: {
          ...state.users,
          [userCampaign.id]: {
            cards: oldCards.concat(card),
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
        <div key={userCampaign.id} className="flex space-x-5">
          <div className="">{user.name}</div>

          {userCards.map((card, i) => (
            <div
              key={i}
              className="flex justify-center inline-block border-solid border-2 shadow w-10 h-12 bg-white border-gray-400 text-gray-400"
            >
              {card.name}
            </div>
          ))}

          <div
            onClick={() => addCard(userCampaign, { name: "Test" })}
            className="flex justify-center inline-block border-solid border-2 shadow w-10 h-12 pt-1 bg-white hover:bg-gray-200 border-gray-400 hover:border-gray-600 text-gray-400 hover:text-gray-600"
          >
            <PlusCircleIcon className="block w-8 h-8 stroke-1" />
          </div>
        </div>
      )
    })
}
