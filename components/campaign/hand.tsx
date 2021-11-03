import { useState } from "react"

export default function Hand(props) {
  const [cards, setCards] = useState(props.cards)
  const [hovered, setHover] = useState<any>(null)
  const [selected, setSelected] = useState<null | any>(null)

  const hover = (card, i) => {
    setHover({ ...card, pos: i })
  }

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
    // when hovered push nearby cards apart
    const x =
      relpos * 75 -
      Math.pow(relpos, 3) * 0.75 +
      (hovered && hovered?.pos != pos && Math.pow(pos - hovered?.pos, -3) * 20)
    // find y position on curve
    // adjust x to raise curve
    const y = Math.pow(x * 0.8, 2) / 1000
    // rotate to align with normal of curve
    if (x === 0) {
      return { x, y, rot: 0 }
    }
    const rot = Math.atan(y / x) * (180 / Math.PI)
    return { x, y, rot }
  }

  return (
    <div className="w-8/12 mx-auto px-4 sm:px-6">
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
              ...(hovered?.instanceId == card?.instanceId && {
                zIndex: 1,
                transform: `scale(1.1) translate(${x}px, ${y}px) rotate(${rot}deg) translate(0, -50px)`,
              }),
              ...(selected?.instanceId == card.instanceId && {
                zIndex: 2,
                transform: "scale(1.2) translate(0rem, -5rem)",
              }),
            }}
            onClick={() => select(card, i)}
            onMouseOver={() => hover(card, i)}
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
