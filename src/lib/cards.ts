export enum Suit {
  Hearts = "♥",
  Diamonds = "♦",
  Clubs = "♣",
  Spades = "♠",
}

export enum Rank {
  Ace = "A",
  Two = "2",
  Three = "3",
  Four = "4",
  Five = "5",
  Six = "6",
  Seven = "7",
  Eight = "8",
  Nine = "9",
  Ten = "10",
  Jack = "J",
  Queen = "Q",
  King = "K",
}

export interface Card {
  suit: Suit;
  rank: Rank;
  faceUp: boolean;
  color: "red" | "black";
}

export function createDeck(): Card[]{
  const deck: Card[] = []; 

  Object.values(Suit).forEach((suit) => {
    for(let rank = 1; rank <= 13; rank++){
      deck.push({
        suit,
        rank: rank as unknown as Rank,
        faceUp: false,
        color: suit === Suit.Hearts || suit === Suit.Diamonds ? "red" : "black",
      })
    }
  })

  return deck;
}

export function shuffleDeck(deck: Card[]): Card[] {
  const newDeck = [...deck];

  for(let i = newDeck.length - 1; i > 0; i--){
    const j = Math.floor(Math.random() * (i + 1));
    [newDeck[i], newDeck[j]] = [newDeck[j], newDeck[i]];
  }

  return newDeck;
}