import Modal from "./modal"
import { useState } from "react"

export default function NewGameModal(props) {
  const [name, setName] = useState(props.defaultName)
  return (
    <Modal hide={props.hide}>
      <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
        <div className="sm:flex sm:items-start">
          <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-3" id="modal-title">
              New Game
            </h3>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-3">
                Name
              </label>
              <input
                className={`shadow appearance-none border ${name.length == 0 ? "border-red-500" : ""} rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-3`}
                id="name"
                type="text" placeholder={props.defaultName} value={name} onChange={(e) => setName(e.target.value)}/>
              { name.length == 0 && (<p className="text-red-500 text-xs italic">Please choose a name.</p>) }
            </div>
            <div className="mt-2">
              <p className="text-sm text-gray-500">
                Create a new game and play with your friends.
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
        <button className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded ml-2" onClick={props.hide}> Cancel </button>
        <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" onClick={() => { props.complete(name) && props.hide() }}> New Game </button>
      </div>
    </Modal>
  )
}
