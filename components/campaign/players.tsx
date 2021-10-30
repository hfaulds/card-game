import { useState } from "react"
import { PlusCircleIcon } from "@heroicons/react/outline"

export default function Players(props) {
  const [cards, setCards] = useState(props.campaign.state?.cards || {})

  const addCard = (userCampaign, card) => {
    setCards({
      ...cards,
      ...{
        [userCampaign.id]: (cards[userCampaign.id] || []).concat(card),
      }
    })
  }
  return props.campaign.users
          .filter((campaignUser) => !!campaignUser.accepted)
          .map((userCampaign) => {
            const user = userCampaign.user
            const userCards = cards[userCampaign.id] || []
            return <div className="flex space-x-5">
              <div className="">
                {user.name}
              </div>

              {
                userCards.map((card) => (
                  <div className="flex justify-center inline-block border-solid border-2 shadow w-10 h-12 bg-white border-gray-400 text-gray-400">
                    {card.name}
                  </div>
                ))
              }

              <div className="flex justify-center inline-block border-solid border-2 shadow w-10 h-12 pt-1 bg-white hover:bg-gray-200 border-gray-400 hover:border-gray-600 text-gray-400 hover:text-gray-600">
                <PlusCircleIcon
                  className="block w-8 h-8 stroke-1"
                  onClick={() => addCard(userCampaign, { name: "Test" })}
                />
              </div>
            </div>
          })
}
