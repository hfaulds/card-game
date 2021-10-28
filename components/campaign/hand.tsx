import { useState, useEffect } from "react"

export default function Hand(props) {
  const [cards, setCards] = useState(props.cards);
  const [hover, setHover] = useState(null)
  const [selected, setSelected] = useState(null);

  const select = (card) => {
    setCards(cards.filter((c) => c != card))
    setSelected(card)
  }

  const deselect = (card) => {
    setCards(cards.concat([card]).sort((a,b) => a.id.localeCompare(b.id)))
    setSelected(null)
  }

  return <>
    { selected && (
	<div
	  className="absolute inline-block border-solid border-4 bg-white shadow w-40 h-52 border-gray-300"
	  style={{
	    transform: "scale(1.2) translate(-5rem, -5rem)",
	    zIndex: "2",
	  }}
	  onClick={() => deselect(selected)}
	>
	  <p className="font-bold"> Card { selected.id }</p>
	</div>
    )}
    {
      cards.map((card, i) => {
	const ri = i - Math.floor(cards.length/2) + ((1 - (cards.length % 2)) * 0.5)
	const x = (ri-1) * 5
	const y = Math.abs(1 * ri)
	const rot = 10 * ri
	return <div
	  key={card.id}
	  className="absolute inline-block border-solid border-4 bg-white shadow w-40 h-52 hover:border-gray-300"
	  style={{
	    transform: `translate(${x}rem, ${y}rem) rotate(${rot}deg)`,
	      transition: "transform 50ms",
	      ... (hover == card ? {
		zIndex: "1",
		transform: `scale(1.1) translate(${x}rem, ${y - 1.5}rem) rotate(${rot}deg)`,
	      } : {})
	  }}
	  onClick={() => select(card) }
	  onMouseOver={()=> !selected && setHover(card) }
	  onMouseOut={()=> !selected && setHover(null) }
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
