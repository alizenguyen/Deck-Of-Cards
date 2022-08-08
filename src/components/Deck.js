import { useState, useEffect, useRef, useCallback } from 'react';
import './Deck.css';

const starter = {
	spades: [],
	clubs: [],
	hearts: [],
	diamonds: [],
};

const Cards = (props) => {
	return (
		<div>
			<p>{props.suit}</p>
			{props.cards.map((card, index) => {
				return (
					<CardImage image={card.image} key={card.value} />
				)
			})}
		</div>
	)
}

const CardImage = (props) => {
	return <img className="card-image" src={props.image} alt={props.image} />
}

const QueenResultsDisplay = (props) => {
	if (props.queenCount < 4) {
		if (props.manual) {
			return <button className="draw-btn" onClick={props.drawCards}>Draw Cards</button>
		}
	} else {
		return <p>Yay, you have found all your queens!</p>
	}
}

const sortCardValue = (card1, card2) => {
	let cardOrder = ['ACE', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'JACK', 'QUEEN', 'KING'];

	if (cardOrder.indexOf(card1.value) < cardOrder.indexOf(card2.value)) {
	  return -1;
	}
	if (cardOrder.indexOf(card1.value) > cardOrder.indexOf(card2.value)) {
	  return 1;
	}
	return 0;
}

function f(x) {
    switch (x) {
    case 1:
    case 2:
    case3:
            return true;
    default:
            return false;
    }
}

const Deck = () => {
	const [deckInfo, updateDeckInfo] = useState();
	const [deck, updateDeck] = useState(starter);
	const [queenCount, updateQueenCount] = useState(0);
	const [manual, switchToManualPull] = useState(false);
	const timer = useRef(null);

	const drawCards = useCallback(async () => {
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
	}, [deckInfo, queenCount]);

	const resetCards = async () => {
		stopTimer();
		
		const returnUrl = `http://deckofcardsapi.com/api/deck/${deckInfo.deck_id}/return/`;
		const returnResponse = await fetch(returnUrl);
		const data = await returnResponse.json();

		const shuffleUrl = `http://deckofcardsapi.com/api/deck/${deckInfo.deck_id}/shuffle/`;
		const shuffleResponse = await fetch(shuffleUrl);

		if (returnResponse.ok && shuffleResponse.ok) {
			switchToManualPull(false);
			updateDeckInfo(data);
			updateDeck(starter);
			updateQueenCount(0);
		}
	};

	const switchToManual = () => {
		switchToManualPull(true);
	};

	const stopTimer = () => {
		clearInterval(timer.current);
	};

	useEffect(() => {
		async function getDeck() {
			const url = 'http://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=1';
			const response = await fetch(url);
			const data = await response.json();
			updateDeckInfo(data);
		}

		getDeck();

		return () => clearInterval(timer.current);
	}, []);

	useEffect(() => {
		if (!manual) {
			timer.current = setInterval(() => {
				drawCards();
			}, 1000);
		}

		return () => clearInterval(timer.current);
	}, [deckInfo, manual, drawCards]);

	useEffect(() => {
		if (queenCount === 4 || manual) {
			stopTimer();
		}
	}, [queenCount, manual]);

	return (
		<div className="Deck">
			<div className="controllers">
				<QueenResultsDisplay drawCards={drawCards} queenCount={queenCount} manual={manual} />
				{!manual && (<button className="manual-btn" onClick={switchToManual}>Manual Draw</button>)}
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