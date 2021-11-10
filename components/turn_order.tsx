import { Actions } from "lib/reducers/state"
import { Characters, EventAction } from "lib/game_state"
import ColorPicker from "components/color_picker"
import { CogIcon, LocationMarkerIcon } from "@heroicons/react/outline"
import { useState } from "react"

export default function TurnOrder({
  encounter,
  gameState,
  currentUserCampaign,
  setState,
  updateToken,
}) {
  const [renamingId, setRenamingId] = useState<string | undefined>()
  const [newName, setNewName] = useState("")

  const renameCharacter = async (id, name) => {}

  const endTurn = () => {}

  return (
    <div className="border-solid border-4 bg-white p-2">
      <p className="font-bold mb-2"> Order </p>
      {Object.entries(gameState.characters as Characters).map(
        ([id, character]) => (
          <div key={id} className="mb-2">
            {renamingId == id ? (
              <input
                type="text"
                className="w-32"
                value={newName}
                autoFocus
                onChange={(e) => setNewName(e.target.value)}
                onBlur={async () => {
                  setState({
                    action: Actions.RenameCharacter,
                    value: { id, name: newName },
                  })
                  await updateToken({
                    action: EventAction.UpdateCharacterName,
                    id,
                    name: newName,
                  })
                  setRenamingId(undefined)
                }}
              />
            ) : (
              <div
                className={`${
                  id == currentUserCampaign.id && "font-bold"
                } inline-block w-32 truncate`}
                onClick={() => {
                  setRenamingId(id)
                  setNewName(character.name)
                }}
              >
                {character.name}
              </div>
            )}
            {(id == currentUserCampaign.id || currentUserCampaign.admin) && (
              <>
                <button
                  className="inline-block bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded"
                  onClick={() => {
                    setState({
                      action: Actions.StartPlacing,
                      value: { id },
                    })
                  }}
                >
                  <LocationMarkerIcon className="w-4 h-4" />
                </button>
                <button className="inline-block bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded">
                  <CogIcon className="w-4 h-4" />
                </button>
              </>
            )}
            <ColorPicker
              onSelect={(color) => {
                setState({
                  action: Actions.UpdateTokenColor,
                  value: { id, color },
                })
                updateToken({
                  action: EventAction.UpdateTokenColor,
                  id,
                  color,
                })
              }}
              value={gameState.tokens[id]?.color}
            />
          </div>
        )
      )}
      {currentUserCampaign.admin && (
        <>
          <button className="inline-block bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded">
            <span
              className="font-small"
              onClick={async () => {
                const resp = await updateToken({
                  action: EventAction.AddCharacter,
                  name: "New Character",
                })
                if (resp) {
                  const [id, { name }] = Object.entries(
                    resp.patch.characters as Characters
                  )[0]
                  setState({
                    action: Actions.AddCharacter,
                    value: { id, name },
                  })
                }
              }}
            >
              Add Character
            </span>
          </button>
          <button className="inline-block bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded">
            <span className="font-small" onClick={endTurn}>
              Skip
            </span>
          </button>
        </>
      )}
    </div>
  )
}
