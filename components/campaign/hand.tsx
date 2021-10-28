import { useState, useEffect } from "react"

export default function Hand(props) {
  const [cards, setCards] = useState(props.cards);
  const [hover, setHover] = useState(null)
  const [selected, setSelected] = useState(null);

  const select = (card) => {
    if (selected == card) {
      setSelected(null)
      return
    }
    setHover(null)
    setSelected(card)
  }

  return <>
    {
      cards.map((card, i) => {
        const unselectedCards = cards.length - (!!selected ? 1 : 0)
        const pos = card.id.localeCompare(selected?.id) < 0 ? i : i - 1
        // position relative to center
        const relpos = pos - Math.floor(unselectedCards/2) + ((1 - (unselectedCards % 2)) * 0.5)
        // move by 5 rem on x axis per position
        const x = (relpos-1) * 5
        // move by 1 rem in an arc on y axis, so that the middle card is highest
        const y = Math.abs(1 * relpos)
        // rotate by 10
        const rot = 10 * relpos
        return <div
          key={card.id}
          className="absolute inline-block border-solid border-4 bg-white shadow w-40 h-52 hover:border-gray-300"
          style={{
            transform: `translate(${x}rem, ${y}rem) rotate(${rot}deg)`,
            transition: "transform 200ms",
            ... (hover == card && {
              zIndex: "1",
              transform: `scale(1.1) translate(${x}rem, ${y - 1.5}rem) rotate(${rot}deg)`,
            }),
            ... (selected == card && {
              zIndex: "2",
              transform: "scale(1.2) translate(-5rem, -5rem)",
            })
          }}
          onClick={() => select(card) }
          onMouseOver={()=> setHover(card) }
          onMouseOut={()=> setHover(null) }
        >
          <p className="font-bold"> Card { card.id }</p>
          <p> adfasdfasdfasdf </p>
          <p> adfasdfasdfasdf </p>
          <p> adfasdfasdfasdf </p>
          <p> adfasdfasdfasdf </p>
        </div>
      })
    }
  </>
}
