import Modal from "./modal"
import { useState } from "react"
import { ChevronDoubleRightIcon, TrashIcon } from '@heroicons/react/outline'

export default function ManagePlayersModal(props) {
  const { game } = props
  if (!game) {
    return <></>
  }

  const [newPlayerEmail, setNewPlayerEmail] = useState("")

  const addPlayer = async (email) => {
    if (email.length <= 0) {
      return
    }
    if (game.users.map((invite) => invite.userEmail).includes(email)) {
      return
    }
    await props.addPlayer(game, email)
  }

  const removePlayer = async (invite) => {
    await props.removePlayer(game, invite)
  }

  return (
    <Modal hide={props.hide}>
      <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
        <div className="sm:flex sm:items-start">
          <div className="w-full mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-3" id="modal-title">
              Manage Players
            </h3>
            <div className="mb-3">
              <label className="block text-gray-700 text-sm font-bold mb-3">
                New Player
              </label>
              <input
                className="inline-block shadow appearance-none border rounded w-10/12 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mr-2 mb-3"
                id="player"
                type="text" placeholder="test@example.com" value={newPlayerEmail} onChange={(e) => setNewPlayerEmail(e.target.value)}/>
              <button className="inline-block bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-2 rounded mb-3" onClick={() => addPlayer(newPlayerEmail)}>
                <ChevronDoubleRightIcon className="h-4 w-4"/>
              </button>
              {
                game.users.filter((invite) => !!invite.accepted).map((invite) => (
                  <div key={invite.id} className="mb-3">
                    <div className="inline-block w-10/12 mr-2">
                      <span>
                        { invite.userEmail }
                      </span>
                      { invite.admin && <span className="font-bold"> (admin)</span> }
                    </div>
                    <button className="inline-block bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-2 rounded" onClick={() => removePlayer(invite)}>
                      <TrashIcon className="h-3 w-3"/>
                    </button>
                  </div>
                ))
              }
              <div className="block text-gray-700 text-sm font-bold mb-3">
                Invites
              </div>
              {
                game.users.filter((invite) => !invite.accepted).map((invite) => (
                  <div key={invite.id} className="mt-2">
                    <div className="inline-block w-10/12 mr-2">
                      <span>
                        { invite.userEmail }
                      </span>
                    </div>
                    <button className="inline-block bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-2 rounded" onClick={() => removePlayer(invite)}>
                      <TrashIcon className="h-3 w-3"/>
                    </button>
                  </div>
                ))
              }
            </div>
          </div>
        </div>
      </div>
      <div className="mt-4 bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
        <button className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded ml-2" onClick={props.hide}> Done </button>
      </div>
    </Modal>
  )
}
