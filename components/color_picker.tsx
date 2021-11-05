import { ColorSwatchIcon } from "@heroicons/react/outline"
import { useState } from "react"

export default function Picker(props) {
  const [open, setOpen] = useState(false)

  const [color, variant] = props.value.split("-")

  const colors = ["gray", "red", "yellow", "green", "blue", "purple", "pink"]
  const variants = [300, 400, 500, 600, 700, 800]
  return (
    <div className="inline-block relative">
      <button
        className={`inline-block bg-${color}-${variant} hover:bg-${color}-${
          Number(variant) + 100
        } font-bold py-1 px-2 rounded text-white`}
        onClick={() => setOpen(!open)}
      >
        <ColorSwatchIcon className="h-4 w-4" />
      </button>
      {open && (
        <div
          className="origin-top-right absolute right-0 mt-1 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none"
          role="menu"
        >
          {colors.map((c) => (
            <div key={c}>
              {variants.map((v) => (
                <button
                  key={v}
                  onClick={() => {
                    setOpen(false)
                    props.onSelect(`${c}-${v}`)
                  }}
                  className={`w-6 h-6 m-1 rounded-full bg-${c}-${v}`}
                />
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
