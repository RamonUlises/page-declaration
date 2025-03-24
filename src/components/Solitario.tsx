import { useState, useEffect, useRef } from "react"
import { DndProvider } from "react-dnd"
import { HTML5Backend } from "react-dnd-html5-backend"
import { type Card as CardType, Rank, createDeck, shuffleDeck } from "../lib/cards";
import { modal } from "../App";

// Componentes simplificados
const Card = ({ card, onClick, onDragStart, isDraggable }: {
  card: CardType
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void
  onDragStart?: (e: React.DragEvent<HTMLDivElement>) => void
  isDraggable?: boolean
}) => {
  const cardRef = useRef(null)

  if (!card.faceUp) {
    return <div className="w-20 h-28 rounded-md bg-blue-900 border-2 border-blue-700 shadow-md" />
  }

  const getSuitColor = () => {
    return card.suit === "♥" || card.suit === "♦" ? "text-red-600" : "text-black"
  }

  const getRankDisplay = () => {
    switch (card.rank as unknown as number) {
      case 1:
        return "A"
      case 11:
        return "J"
      case 12:
        return "Q"
      case 13:
        return "K"
      default:
        return card.rank.toString()
    }
  }

  return (
    <div
      ref={cardRef}
      className={`w-20 h-28 rounded-md bg-white border border-gray-300 shadow-md flex flex-col justify-between p-1
                 ${isDraggable ? "cursor-grab hover:shadow-lg hover:border-blue-400" : ""}`}
      onClick={onClick}
      draggable={isDraggable}
      onDragStart={(e) => {
        if (onDragStart) {
          // Crear una imagen de la carta para el arrastre
          const img = new Image()
          img.src = `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="80" height="112" viewBox="0 0 80 112"><rect width="80" height="112" rx="8" fill="white" stroke="gray"/><text x="10" y="20" fontSize="16" fill="${getSuitColor() === "text-red-600" ? "red" : "black"}">${getRankDisplay()}${card.suit}</text><text x="40" y="60" fontSize="24" fill="${getSuitColor() === "text-red-600" ? "red" : "black"}">${card.suit}</text></svg>`
          e.dataTransfer.setDragImage(img, 40, 56)
          onDragStart(e)
        }
      }}
    >
      <div className={`text-sm font-bold ${getSuitColor()}`}>
        {getRankDisplay()}
        <span className="ml-1">{card.suit}</span>
      </div>
      <div className={`text-center text-2xl ${getSuitColor()}`}>{card.suit}</div>
      <div className={`text-sm font-bold self-end ${getSuitColor()}`}>
        {getRankDisplay()}
        <span className="ml-1">{card.suit}</span>
      </div>
    </div>
  )
}

export function Solitario({ visible, setVisible }: {
  visible: modal,
  setVisible: React.Dispatch<React.SetStateAction<modal>>
}) {
  const [stock, setStock] = useState<CardType[]>([])
  const [waste, setWaste] = useState<CardType[]>([])
  const [foundations, setFoundations] = useState<CardType[][]>([[], [], [], []])
  const [tableaus, setTableaus] = useState<CardType[][]>([[], [], [], [], [], [], []])
  const [moves, setMoves] = useState(0)
  const [gameStarted, setGameStarted] = useState(false)
  const [draggedCard, setDraggedCard] = useState<{
    card: CardType
    source: string
    index: number
    cardIndex?: number
    stack?: CardType[]
  } | null>(null)

  // Initialize game
  useEffect(() => {
    if (!gameStarted) {
      startNewGame()
    }
  }, [gameStarted])

  const startNewGame = () => {
    const newDeck = shuffleDeck(createDeck())

    // Deal cards to tableaus
    const newTableaus: CardType[][] = [[], [], [], [], [], [], []]

    for (let i = 0; i < 7; i++) {
      for (let j = 0; j <= i; j++) {
        const card = newDeck.pop()
        if (card) {
          // Only the top card is face up
          card.faceUp = j === i
          newTableaus[i].push(card)
        }
      }
    }

    setTableaus(newTableaus)
    setStock(newDeck)
    setWaste([])
    setFoundations([[], [], [], []])
    setMoves(0)
    setGameStarted(true)
  }

  const drawCard = () => {
    if (stock.length === 0) {
      // Reset stock from waste
      setStock([...waste].reverse().map((card) => ({ ...card, faceUp: false })))
      setWaste([])
      return
    }

    const newStock = [...stock]
    const card = newStock.pop()

    if (card) {
      card.faceUp = true
      setWaste([...waste, card])
      setStock(newStock)
      setMoves(moves + 1)
    }
  }

  // Verifica si una secuencia de cartas es válida (orden descendente y colores alternos)
  const isValidSequence = (cards: CardType[]) => {
    if (cards.length <= 1) return true

    for (let i = 0; i < cards.length - 1; i++) {
      const currentCard = cards[i]
      const nextCard = cards[i + 1]

      if (!currentCard.faceUp || !nextCard.faceUp) return false
      if (currentCard.color === nextCard.color) return false
      if (currentCard.rank !== nextCard.rank + 1) return false
    }

    return true
  }

  const getFoundationIndex = (card: CardType) => {
    return foundations.findIndex((pile) => {
      if (pile.length === 0) {
        return card.rank as unknown as number === 1
      }
      const topCard = pile[pile.length - 1]
      return topCard.suit === card.suit && (topCard.rank as unknown as number) === card.rank as unknown as number - 1
    })
  }

  const canMoveToTableau = (card: CardType, targetIndex: number) => {
    const targetPile = tableaus[targetIndex]

    if (targetPile.length === 0) {
      return card.rank === Rank.King
    }

    const topCard = targetPile[targetPile.length - 1]
    return topCard.faceUp && topCard.color !== card.color && topCard.rank === card.rank + 1
  }

  const moveCardToFoundation = (card: CardType, source: string, sourceIndex: number) => {
    // Find the correct foundation pile
    const foundationIndex = getFoundationIndex(card)

    if (foundationIndex === -1) {
      return false
    }

    // Create new state
    const newFoundations = [...foundations]
    newFoundations[foundationIndex] = [...newFoundations[foundationIndex], { ...card }]

    // Remove from source
    if (source === "waste") {
      const newWaste = [...waste]
      newWaste.pop()
      setWaste(newWaste)
    } else if (source === "tableau") {
      const newTableaus = [...tableaus]
      newTableaus[sourceIndex] = [...newTableaus[sourceIndex]]
      newTableaus[sourceIndex].pop()

      // Flip the new top card if needed
      if (newTableaus[sourceIndex].length > 0) {
        const newTopCard = { ...newTableaus[sourceIndex][newTableaus[sourceIndex].length - 1] }
        if (!newTopCard.faceUp) {
          newTopCard.faceUp = true
          newTableaus[sourceIndex][newTableaus[sourceIndex].length - 1] = newTopCard
        }
      }

      setTableaus(newTableaus)
    }

    setFoundations(newFoundations)
    setMoves(moves + 1)
    return true
  }

  const moveStackToTableau = (
    stack: CardType[],
    source: string,
    sourceIndex: number,
    sourceCardIndex: number,
    targetIndex: number,
  ) => {
    if (stack.length === 0) return false

    const firstCard = stack[0]

    if (!canMoveToTableau(firstCard, targetIndex)) {
      return false
    }

    // Create new state
    const newTableaus = [...tableaus]

    // Add stack to target
    newTableaus[targetIndex] = [...newTableaus[targetIndex], ...stack.map((card) => ({ ...card }))]

    // Remove stack from source tableau
    if (source === "tableau") {
      newTableaus[sourceIndex] = [...newTableaus[sourceIndex]]
      newTableaus[sourceIndex] = newTableaus[sourceIndex].slice(0, sourceCardIndex)

      // Flip the new top card if needed
      if (newTableaus[sourceIndex].length > 0) {
        const newTopCard = { ...newTableaus[sourceIndex][newTableaus[sourceIndex].length - 1] }
        if (!newTopCard.faceUp) {
          newTopCard.faceUp = true
          newTableaus[sourceIndex][newTableaus[sourceIndex].length - 1] = newTopCard
        }
      }
    }

    setTableaus(newTableaus)
    setMoves(moves + 1)
    return true
  }

  const moveCardToTableau = (card: CardType, source: string, sourceIndex: number, targetIndex: number) => {
    if (!canMoveToTableau(card, targetIndex)) {
      return false
    }

    // Create new state
    const newTableaus = [...tableaus]

    // Add to target
    newTableaus[targetIndex] = [...newTableaus[targetIndex], { ...card }]

    // Remove from source
    if (source === "waste") {
      const newWaste = [...waste]
      newWaste.pop()
      setWaste(newWaste)
    } else if (source === "foundation") {
      const newFoundations = [...foundations]
      newFoundations[sourceIndex] = [...newFoundations[sourceIndex]]
      newFoundations[sourceIndex].pop()
      setFoundations(newFoundations)
    } else if (source === "tableau") {
      newTableaus[sourceIndex] = [...newTableaus[sourceIndex]]
      newTableaus[sourceIndex].pop()

      // Flip the new top card if needed
      if (newTableaus[sourceIndex].length > 0) {
        const newTopCard = { ...newTableaus[sourceIndex][newTableaus[sourceIndex].length - 1] }
        if (!newTopCard.faceUp) {
          newTopCard.faceUp = true
          newTableaus[sourceIndex][newTableaus[sourceIndex].length - 1] = newTopCard
        }
      }
    }

    setTableaus(newTableaus)
    setMoves(moves + 1)
    return true
  }

  const handleDoubleClick = (card: CardType, source: string, index: number) => {
    // Try to move to foundation first
    if (moveCardToFoundation(card, source, index)) {
      return
    }

    // If that fails, try to find a valid tableau to move to
    for (let i = 0; i < tableaus.length; i++) {
      if ((source === "tableau" && i === index) || !canMoveToTableau(card, i)) {
        continue
      }

      if (moveCardToTableau(card, source, index, i)) {
        return
      }
    }
  }

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, card: CardType, source: string, index: number, cardIndex?: number) => {
    // Si estamos arrastrando desde una columna, verificar si hay una secuencia válida
    if (source === "tableau" && cardIndex !== undefined) {
      const pile = tableaus[index];
      const stack = pile.slice(cardIndex);

      // Solo permitir arrastrar secuencias válidas
      if (isValidSequence(stack)) {
        setDraggedCard({ card, source, index, cardIndex, stack });

        if (stack.length > 1) {
          // Crear una imagen fantasma para el arrastre que muestre la pila
          const ghostElement = document.createElement("div");
          ghostElement.className = "relative";
          ghostElement.style.width = "80px";
          ghostElement.style.height = `${112 + (stack.length - 1) * 20}px`;

          stack.forEach((stackCard, i) => {
            const cardElement = document.createElement("div");
            cardElement.className = "absolute w-20 h-28 bg-white border border-gray-300 rounded-md shadow-md";
            cardElement.style.top = `${i * 20}px`;

            // Añadir contenido a la carta
            const color = stackCard.suit === "♥" || stackCard.suit === "♦" ? "red" : "black";
            const rank =
              (stackCard.rank as unknown as number) === 1
                ? "A"
                : (stackCard.rank as unknown as number)  === 11
                ? "J"
                : (stackCard.rank as unknown as number) === 12
                ? "Q"
                : (stackCard.rank as unknown as number) === 13
                ? "K"
                : stackCard.rank.toString();

            cardElement.innerHTML = `
              <div style="display: flex; flex-direction: column; justify-content: space-between; height: 100%; padding: 4px;">
                <div style="color: ${color}; font-weight: bold;">${rank}${stackCard.suit}</div>
                <div style="text-align: center; font-size: 24px; color: ${color};">${stackCard.suit}</div>
                <div style="color: ${color}; font-weight: bold; align-self: flex-end;">${rank}${stackCard.suit}</div>
              </div>
            `;

            ghostElement.appendChild(cardElement);
          });

          document.body.appendChild(ghostElement);
          e.dataTransfer.setDragImage(ghostElement, 40, 20);

          // Limpiar el elemento fantasma después
          setTimeout(() => {
            document.body.removeChild(ghostElement);
          }, 0);
        }
      } else {
        e.preventDefault();
        return false;
      }
    } else {
      setDraggedCard({ card, source, index });
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>, targetType: string, targetIndex: number) => {
    e.preventDefault()

    if (!draggedCard) return

    const { card, stack, source, index } = draggedCard

    // No permitir arrastrar a la misma columna
    if (targetType === "tableau" && source === "tableau" && targetIndex === index) {
      e.dataTransfer.dropEffect = "none"
      return
    }

    if (targetType === "foundation") {
      // Solo permitir mover cartas individuales a las fundaciones
      if (stack && stack.length > 1) {
        e.dataTransfer.dropEffect = "none"
        return
      }

      // Verificar si la carta puede ir a la fundación
      const foundationIndex = getFoundationIndex(card)
      if (foundationIndex !== -1) {
        e.dataTransfer.dropEffect = "move"
      } else {
        e.dataTransfer.dropEffect = "none"
      }
    } else if (targetType === "tableau") {
      const cardToCheck = stack ? stack[0] : card
      if (canMoveToTableau(cardToCheck, targetIndex)) {
        e.dataTransfer.dropEffect = "move"
      } else {
        e.dataTransfer.dropEffect = "none"
      }
    } else {
      e.dataTransfer.dropEffect = "none"
    }
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, targetType: string, targetIndex: number) => {
    e.preventDefault()

    if (!draggedCard) return

    const { card, source, index, cardIndex, stack } = draggedCard

    if (targetType === "foundation") {
      // Solo permitir mover cartas individuales a las fundaciones
      if (!stack || stack.length === 1) {
        moveCardToFoundation(card, source, index)
      }
    } else if (targetType === "tableau") {
      if (stack && cardIndex !== undefined) {
        moveStackToTableau(stack, source, index, cardIndex, targetIndex)
      } else {
        moveCardToTableau(card, source, index, targetIndex)
      }
    }

    setDraggedCard(null)
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className={`${visible !== "Solitario" && "hidden"} flex flex-col gap-8 fixed top-0 left-0 w-screen h-screen bg-green-800 justify-center`}>
        <button className="absolute top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-md" onClick={() => setVisible(null)}>
          Salir
        </button>
        <div className="flex justify-between w-full max-w-[900px] mx-auto">
          <div className="flex gap-4">
            {/* Stock */}
            <div
              className={`w-20 h-28 rounded-md ${stock.length > 0 ? "bg-blue-900 border-2 border-blue-700 cursor-pointer" : "border-2 border-dashed border-gray-400"}`}
              onClick={drawCard}
            >
              {stock.length === 0 ? (
                <div className="h-full flex items-center justify-center text-gray-400">↻</div>
              ) : (
                <div className="h-full flex items-center justify-center text-blue-700">
                  <div
                    className="absolute w-20 h-28 bg-blue-900 border-2 border-blue-700 rounded-md"
                    style={{ transform: "rotate(2deg)" }}
                  />
                  <div
                    className="absolute w-20 h-28 bg-blue-900 border-2 border-blue-700 rounded-md"
                    style={{ transform: "rotate(-2deg)" }}
                  />
                </div>
              )}
            </div>

            {/* Waste */}
            <div className="w-20 h-28 relative">
              {waste.length > 0 ? (
                <Card
                  card={waste[waste.length - 1]}
                  onClick={(e: React.MouseEvent<HTMLDivElement>) => {
                    if (e.detail === 2) {
                      // Double click
                      handleDoubleClick(waste[waste.length - 1], "waste", 0)
                    }
                  }}
                  onDragStart={(e: React.DragEvent<HTMLDivElement>) => {
                    handleDragStart(e, waste[waste.length - 1], "waste", 0)
                  }}
                  isDraggable={true}
                />
              ) : (
                <div className="w-20 h-28 border-2 border-dashed border-gray-400 rounded-md" />
              )}
            </div>
          </div>

          {/* Foundations */}
          <div className="flex gap-4">
            {foundations.map((pile, index) => (
              <div
                key={index}
                className={`w-20 h-28 ${pile.length === 0 ? "border-2 border-dashed border-gray-400 rounded-md flex items-center justify-center text-gray-400" : ""} 
                           ${draggedCard && !draggedCard.stack && getFoundationIndex(draggedCard.card) === index ? "bg-green-200/30 border-2 border-green-500" : ""}`}
                onDragOver={(e) => handleDragOver(e, "foundation", index)}
                onDrop={(e) => handleDrop(e, "foundation", index)}
              >
                {pile.length === 0 ? (
                  <div>♠♥♦♣</div>
                ) : (
                  <Card
                    card={pile[pile.length - 1]}
                    onClick={() => {}}
                    onDragStart={(e: React.DragEvent<HTMLDivElement>) => {
                      handleDragStart(e, pile[pile.length - 1], "foundation", index)
                    }}
                    isDraggable={true}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Tableaus */}
        <div className="flex gap-4 mt-6 w-full max-w-[900px] mx-auto">
          {tableaus.map((pile, tableauIndex) => (
            <div
              key={tableauIndex}
              className={`w-20 min-h-[10rem] relative ${pile.length === 0 ? "border-2 border-dashed border-gray-400 rounded-md" : ""} 
                         ${
                           draggedCard &&
                           (
                             (draggedCard.stack && canMoveToTableau(draggedCard.stack[0], tableauIndex)) ||
                               (!draggedCard.stack && canMoveToTableau(draggedCard.card, tableauIndex))
                           )
                             ? "bg-green-200/30 border-2 border-green-500"
                             : ""
                         }`}
              style={{ minHeight: pile.length > 0 ? 112 + (pile.length - 1) * 20 : 160 }}
              onDragOver={(e) => handleDragOver(e, "tableau", tableauIndex)}
              onDrop={(e) => handleDrop(e, "tableau", tableauIndex)}
            >
              {pile.map((card, cardIndex) => {
                const isLast = cardIndex === pile.length - 1

                return (
                  <div
                    key={`${card.suit}-${card.rank}-${cardIndex}`}
                    className="absolute"
                    style={{ top: `${cardIndex * 20}px` }}
                  >
                    <Card
                      card={card}
                      onClick={(e: React.MouseEvent<HTMLDivElement>) => {
                        if (e.detail === 2 && card.faceUp) {
                          // Double click
                          if (isLast) {
                            handleDoubleClick(card, "tableau", tableauIndex)
                          }
                        }
                      }}
                      onDragStart={(e: React.DragEvent<HTMLDivElement>) => {
                        if (card.faceUp) {
                          handleDragStart(e, card, "tableau", tableauIndex, cardIndex)
                        }
                      }}
                      isDraggable={card.faceUp}
                    />
                  </div>
                )
              })}
            </div>
          ))}
        </div>

        <div className="flex justify-between items-center mt-4 w-full max-w-[900px] mx-auto">
          <div className="text-white">Moves: {moves}</div>
          <button className="bg-yellow-500 text-white px-4 py-2 rounded-md" onClick={startNewGame}>New Game</button>
        </div>
      </div>
    </DndProvider>
  )
}

