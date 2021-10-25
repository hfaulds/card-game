import Modal from "./modal"
import { useState } from "react"
import { ChevronDoubleRightIcon, TrashIcon } from '@heroicons/react/outline'

export default function NewGameModal(props) {
  const [name, setName] = useState(props.defaultName)
  const [newPlayer, setNewPlayer] = useState("")
  const [players, setPlayers] = useState([])

  const addPlayer = () => {
    if (newPlayer.length <= 0) {
      return
    }
    if (players.includes(newPlayer)) {
      return
    }
    setPlayers(players.concat(newPlayer))
    setNewPlayer("")
  }

  const deletePlayer = (d) => {
    setPlayers(players.filter((p) => p != d))
  }

  return (
    <Modal hide={props.hide}>
      <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
        <div className="sm:flex sm:items-start">
          <div className="w-full mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-3" id="modal-title">
              New Game
            </h3>
            <div className="mb-2">
              <label className="block text-gray-700 text-sm font-bold mb-3">
                Name
              </label>
              <input
                className={`shadow appearance-none border ${name.length == 0 ? "border-red-500" : ""} rounded w-10/12 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline`}
                id="name"
                type="text" placeholder={props.defaultName} value={name} onChange={(e) => setName(e.target.value)}/>
              { name.length == 0 && (<p className="text-red-500 text-xs italic">Please choose a name.</p>) }
            </div>
            <div className="mb-3">
              <label className="block text-gray-700 text-sm font-bold mb-3">
                Players
              </label>
              <input
                className={`inline-block shadow appearance-none border ${name.length == 0 ? "border-red-500" : ""} rounded w-10/12 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mr-2`}
                id="player"
                type="text" placeholder="test@example.com" value={newPlayer }onChange={(e) => setNewPlayer(e.target.value)}/>
              <button className="inline-block bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-2 rounded" onClick={() => addPlayer()}>
                <ChevronDoubleRightIcon className="h-4 w-4"/>
              </button>
              {
                players.map((p, i) => (
                  <div key={i} className="mt-2">
                    <div className="inline-block italic w-10/12 mr-2"> { p } </div>
                    <button className="inline-block bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-2 rounded" onClick={() => deletePlayer(p)}>
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
        <button className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded ml-2" onClick={props.hide}> Cancel </button>
        <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" onClick={() => { props.complete(name, players) && props.hide() }}> New Game </button>
      </div>
    </Modal>
  )
}
