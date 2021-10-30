import { useRouter } from 'next/router'
import { useState } from "react"
import { TrashIcon } from '@heroicons/react/outline'
import { Transition } from 'react-transition-group';

export default function Encounters(props) {
  const router = useRouter()
  const [encounters, setEncounters] = useState(props.encounters)

  const openEncounter = async (id) => {
    router.push(`/encounter/${id}`)
  }

  const addEncounter = async () => {
    const encounterName = `Encounter ${encounters.length + 1}`
    const res = await fetch(`/api/encounter/${props.campaign.id}`, {
      body: JSON.stringify({
        name: encounterName,
      }),
      headers: {
        'Content-Type': 'application/json'
      },
      method: 'POST',
    })
    if(!res.ok) {
      return
    }
    const encounter = (await res.json()).encounter
    setEncounters(encounters.concat({
      created: true,
      ...encounter,
    }))
  }

  const removeEncounter = async (encounter) => {
    const res = await fetch(`/api/encounter/${props.campaign.id}`, {
      body: JSON.stringify({
        encounterId: encounter.id,
      }),
      headers: {
        'Content-Type': 'application/json'
      },
      method: 'DELETE',
    })
    if(!res.ok) {
      return
    }
    setEncounters(encounters.map((e) => {
      if (e.id == encounter.id) {
        return { deleted: true, ...e }
      }
      return e
    }))
  }

  return (
    <div className="flex flex-col-reverse">
      {
        encounters.map((encounter, i) =>
          <Transition key={encounter.id} in={!encounter.deleted} appear={!!encounter.created} timeout={{exit: 500}}>
            { state => (
              <div key={0} className="flex-col" style={{
                transition: `all 500ms ease-in-out`,
                ...(state == "entering" && { opacity: 0 }),
                ...(state == "entered" && { opacity: 100 }),
                ...(state == "exiting" && { opacity: 0 }),
                ...(state == "exited" && { opacity: 0, display: "none" }),
              }}>
                <div className="flex w-full">
                  <div className="flex-grow"/>
                  <div className="flex-none bg-gray-100 w-0.5 h-10 m-2">
                  </div>
                  <div className="flex-grow"/>
                </div>
                <div className="flex w-full">
                  <div className="flex-grow"/>
                  <div className="flex-none border-solid border-2 font-bold p-4 rounded text-center">
                    <div className="mb-2">
                      <span className="inline-block"> { encounter.name } </span>
                      { props.userCampaign.admin && (
                        <TrashIcon className="text-gray-300 hover:text-gray-600 inline-block h-4 w-4" onClick={() => removeEncounter(encounter)}/>
                      )}
                    </div>
                    { encounter.visibility != "CLOSED" && (
                      <button className="bg-green-500 hover:bg-green-700 text-white font-bold px-2 py-1 rounded" onClick={() => openEncounter(encounter.id)}>
                        {
                          encounter.visibility == "DRAFT" ?  "Edit" : "Open"
                        }
                      </button>
                    )}
                  </div>
                  <div className="flex-grow"/>
                </div>
              </div>
            )}
          </Transition>
        )
      }
      {
        props.userCampaign.admin && (
          <div className="flex w-full">
            <div className="flex-grow"/>
            <button className="flex-none border-solid border-2 font-bold py-2 px-4 rounded hover:bg-gray-100" onClick={addEncounter}>
              New Encounter
            </button>
            <div className="flex-grow"/>
          </div>
        )
      }
    </div>
  )
}
