import { useState, useEffect, useRef } from "react"

export default function Hand(props) {
  const [cards, setCards] = useState(props.cards)
  const [hover, setHover] = useState(null)
  const [selected, setSelected] = useState<null | any>(null)
  const [width, setWidth] = useState(0)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    window.addEventListener("resize", () =>
      setWidth(ref?.current?.offsetWidth || 0)
    )
    setWidth(ref?.current?.offsetWidth || 0)
  })

  const select = (card, i) => {
    if (selected?.instanceId == card.instanceId) {
      setSelected(null)
      return
    }
    setHover(null)
    setSelected({ ...card, pos: i })
  }

  const getTransform = (pos) => {
    const unselectedCards = cards.length - (!!selected ? 1 : 0)
    // position relative to center adjusted for selected card
    const relpos =
      (pos > selected?.pos ? pos - 1 : pos) -
      Math.floor(unselectedCards / 2) +
      (1 - (unselectedCards % 2)) * 0.5
    // distribute evenly across x axis
    const x = relpos * (width / cards.length) * 0.8
    // find y position on curve
    // adjust x to raise curve
    const y = Math.pow(x * 0.8, 2) / width
    // rotate to align with normal of curve
    const rot = Math.atan(y / x) * (180 / Math.PI)
    return { x, y, rot }
  }

  return (
    <div ref={ref} className="w-8/12 mx-auto px-4 sm:px-6">
      {cards.map((card, i) => {
        const { x, y, rot } = getTransform(i)
        return (
          <div
            key={card.instanceId}
            className="absolute inline-block border-solid border-4 bg-white shadow w-40 h-52 hover:border-gray-300"
            style={{
              marginLeft: "-5rem",
              transformOrigin: "50%",
              transform: `translate(${x}px, ${y}px) rotate(${rot}deg)`,
              transition: "transform 200ms",
              ...(hover == card && {
                zIndex: 1,
                transform: `scale(1.1) translate(${x}px, ${
                  y - 1.5
                }px) rotate(${rot}deg)`,
              }),
              ...(selected?.instanceId == card.instanceId && {
                zIndex: 2,
                transform: "scale(1.2) translate(0rem, -5rem)",
              }),
            }}
            onClick={() => select(card, i)}
            onMouseOver={() => setHover(card)}
            onMouseOut={() => setHover(null)}
          >
            <p className="font-bold">{card.name}</p>
            <p> adfasdfasdfasdf </p>
            <p> adfasdfasdfasdf </p>
            <p> adfasdfasdfasdf </p>
            <p> adfasdfasdfasdf </p>
          </div>
        )
      })}
    </div>
  )
}
