import { useState } from "react"
import { Cards } from "lib/cards"

function Card({ title, transform, zIndex, onHover, onSelect }) {
  return (
    <div
      className="select-none absolute inline-block border-solid border-4 bg-white shadow w-40 h-52 hover:border-gray-300"
      style={{
        marginLeft: "-5rem",
        transformOrigin: "50%",
        transform: transform,
        transition: "transform 200ms",
        zIndex: zIndex,
      }}
      onClick={() => onSelect && onSelect()}
      onMouseOver={() => onHover && onHover(true)}
      onMouseOut={() => onHover && onHover(false)}
    >
      <p className="font-bold">{title}</p>
      <p> adfasdfasdfasdf </p>
      <p> adfasdfasdfasdf </p>
      <p> adfasdfasdfasdf </p>
      <p> adfasdfasdfasdf </p>
    </div>
  )
}

export default function Hand(props) {
  const [hovered, setHover] = useState<any>(null)

  const hover = (card, i) => {
    setHover({ ...card, pos: i })
  }

  const getHandTransform = (card, pos) => {
    if (props.selected == card.instanceId) {
      return "scale(1.2) translate(0px, -300px)"
    }
    const { x, y, rot } = getUnselectedHandTransform(pos)
    if (hovered?.instanceId == card.instanceId) {
      return `scale(1.1) translate(${x}px, ${y}px) rotate(${rot}deg) translate(0, -50px)`
    }
    return `translate(${x}px, ${y}px) rotate(${rot}deg)`
  }

  const selectedCardPos = props.hand.findIndex(
    (c) => c.instanceId == props.selected
  )

  const getUnselectedHandTransform = (pos) => {
    const unselectedCards = props.hand.length - (!!props.selected ? 1 : 0)
    // position relative to center adjusted for selected card
    const relpos =
      (props.selected && pos > selectedCardPos ? pos - 1 : pos) -
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
      return { x, y: y - 250, rot: 0 }
    }
    const rot = Math.atan(y / x) * (180 / Math.PI)
    return { x, y: y - 250, rot }
  }

  return (
    <div className="w-8/12 mx-auto px-4 sm:px-6">
      {props.hand.map((card, pos) => (
        <Card
          key={card.instanceId}
          title={card.name}
          transform={getHandTransform(card, pos)}
          zIndex={
            props.selected == card.instanceId
              ? 2
              : hovered?.instanceId == card.instanceId
              ? 1
              : null
          }
          onHover={(t) => (t ? hover(card, pos) : setHover(null))}
          onSelect={() => {
            props.deselect()
            if (card.instanceId != props.selected) {
              props.select(card)
            }
          }}
        />
      ))}
      {props.discard.map((card, i) => (
        <Card
          key={card.instanceId}
          title={card.name}
          transform={`translate(${300 + i * 5}px, ${i * 5 - 250}px)`}
          zIndex={0}
          onHover={undefined}
          onSelect={undefined}
        />
      ))}
    </div>
  )
}
