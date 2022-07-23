import { useState, useEffect } from 'react';
import './Deck.css';

const starter = {
	spades: [],
	clubs: [],
	hearts: [],
	diamonds: [],
};

function Cards(props) {
	const cardsSorted = props.cards.sort((a, b) => a.value - b.value);
	return (
		<div>
		<p>{props.suit}</p>
		{cardsSorted.map((card, index) => {
			return (
				<CardImage image={card.image} key={card.value} />
			)
		})}
		</div>
	)
}

function CardImage(props) {
	return <img className="card-image" src={props.image} alt={props.image} />
}

function QueenTracker(props) {
	if (props.queenCount < 4) {
		return <button className="draw-btn" onClick={props.drawCards}>Draw Cards</button>
	} else {
		return <p>Yay, you have found all your queens!</p>
	}
}

function sortCardValue(card1, card2) {
	if (card1.value < card2.value) {
	  return -1;
	}
	if (card1.value > card2.value) {
	  return 1;
	}
	return 0;
}

function Deck() {
	const [deckInfo, updateDeckInfo] = useState({});
	const [deck, updateDeck] = useState(starter);
	const [queenCount, updateQueenCount] = useState(0);

	useEffect(() => {
		async function getDeck() {
			const url = 'http://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=1';
			const response = await fetch(url);
			const data = await response.json();
			updateDeckInfo(data);
		}

		getDeck();
	}, [])

	const drawCards = async () => {
		const url = `http://deckofcardsapi.com/api/deck/${deckInfo.deck_id}/draw/?count=2`;
		const response = await fetch(url);
		const data = await response.json();

		updateDeckInfo({
			...deckInfo,
			remaining: data.remaining, 
		})

		if (data.cards) {
			data.cards.forEach((card) => {
				const property = card.suit.toLowerCase();

				if (card.value === 'QUEEN' || data.remaining === 0) {
					updateQueenCount(queenCount+1);
				}

				updateDeck(prevValues => {
					const obj = {
						value: card.value,
						image: card.image,
					}
					const values = [...prevValues[property], obj].sort(sortCardValue);
					return { ...prevValues, [property]: values }
				});
			})
		} 
	};

	const resetCards = async () => {
		const returnUrl = `http://deckofcardsapi.com/api/deck/${deckInfo.deck_id}/return/`;
		const returnResponse = await fetch(returnUrl);
		const data = await returnResponse.json();

		const shuffleUrl = `http://deckofcardsapi.com/api/deck/${deckInfo.deck_id}/shuffle/`
		const shuffleResponse = await fetch(shuffleUrl);

		if (returnResponse.ok && shuffleResponse.ok) {
			updateDeckInfo(data);
			updateDeck(starter);
			updateQueenCount(0);
		}
	}

	return (
		<div className="Deck">
			<div className="controllers">
				<QueenTracker drawCards={drawCards} queenCount={queenCount} />
				<button onClick={resetCards}>Reset</button>
			</div>
			{Object.keys(deck).map((key, index) => {
				return (
					<Cards suit={key} cards={deck[key]} key={key} />
				)
			})}
		</div>
	);
}

export default Deck;