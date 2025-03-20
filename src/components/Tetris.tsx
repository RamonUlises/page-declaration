import { useEffect, useRef, useState } from "react";
import {
  BLOCK_SIZE,
  BOARD_WIDTH,
  BOARD_HEIGHT,
  PIECES,
} from "../lib/constants";
import { createBoard, checkCollision, removeRows } from "../lib/game-helpers";
import { modal } from "../App";

export function Tetris({
  visible,
  setVisible,
}: {
  visible: modal;
  setVisible: React.Dispatch<React.SetStateAction<modal>>;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [gameActive, setGameActive] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);

  // Game state is managed in refs to avoid re-renders during game loop
  const boardRef = useRef(createBoard(BOARD_WIDTH, BOARD_HEIGHT));
  const pieceRef = useRef({
    position: { x: Math.floor(BOARD_WIDTH / 2) - 1, y: 0 },
    shape: PIECES[Math.floor(Math.random() * PIECES.length)],
  });

  const requestRef = useRef<number | null>(null);
  const lastTimeRef = useRef(0);
  const dropCounterRef = useRef(0);

  const draw = (context: CanvasRenderingContext2D) => {
    // Clear canvas
    context.fillStyle = "#000";
    context.fillRect(0, 0, BOARD_WIDTH, BOARD_HEIGHT);

    // Draw board
    boardRef.current.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value === 1) {
          context.fillStyle = "yellow";
          context.fillRect(x, y, 1, 1);
        }
      });
    });

    // Draw current piece
    if (gameActive) {
      const piece = pieceRef.current;
      piece.shape.forEach((row, y) => {
        row.forEach((value, x) => {
          if (value) {
            context.fillStyle = "red";
            context.fillRect(x + piece.position.x, y + piece.position.y, 1, 1);
          }
        });
      });
    }
  };

  const solidify = () => {
    const piece = pieceRef.current;
    const board = boardRef.current;

    piece.shape.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value === 1) {
          board[y + piece.position.y][x + piece.position.x] = 1;
        }
      });
    });

    // Reset position
    piece.position.x = Math.floor(BOARD_WIDTH / 2) - 1;
    piece.position.y = 0;
    piece.shape = PIECES[Math.floor(Math.random() * PIECES.length)];

    if (checkCollision(piece, board)) {
      setGameActive(false);
      setGameOver(true);
    }

    // Check for completed rows
    const rowsCleared = removeRows(board);
    if (rowsCleared > 0) {
      setScore((prevScore) => prevScore + rowsCleared * 10);
    }
  };

  const gameLoop = (time: number) => {
    if (!gameActive) return;

    const deltaTime = time - lastTimeRef.current;
    lastTimeRef.current = time;
    dropCounterRef.current += deltaTime;

    if (dropCounterRef.current > 500) {
      // Slower drop rate for better playability
      const piece = pieceRef.current;
      piece.position.y++;

      if (checkCollision(piece, boardRef.current)) {
        piece.position.y--;
        solidify();
      }

      dropCounterRef.current = 0;
    }

    const canvas = canvasRef.current;
    if (canvas) {
      const context = canvas.getContext("2d");
      if (context) {
        draw(context);
      }
    }

    requestRef.current = requestAnimationFrame(gameLoop);
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    if (!gameActive) return;

    const piece = pieceRef.current;

    switch (event.key) {
      case "ArrowLeft":
        piece.position.x--;
        if (checkCollision(piece, boardRef.current)) {
          piece.position.x++;
        }
        break;
      case "ArrowRight":
        piece.position.x++;
        if (checkCollision(piece, boardRef.current)) {
          piece.position.x--;
        }
        break;
      case "ArrowDown":
        piece.position.y++;
        if (checkCollision(piece, boardRef.current)) {
          piece.position.y--;
          solidify();
        }
        break;
      case "ArrowUp":
        // eslint-disable-next-line no-case-declarations
        const rotated: number[][] = [];

        for (let i = 0; i < piece.shape[0].length; i++) {
          const row: number[] = [];
          for (let j = piece.shape.length - 1; j >= 0; j--) {
            row.push(piece.shape[j][i]);
          }
          rotated.push(row);
        }

        // eslint-disable-next-line no-case-declarations
        const previousShape = piece.shape;
        piece.shape = rotated;

        if (checkCollision(piece, boardRef.current)) {
          piece.shape = previousShape;
        }
        break;
    }
  };

  const startGame = () => {
    resetGame();
    setGameActive(true);
    setGameStarted(true);
    lastTimeRef.current = 0;
    dropCounterRef.current = 0;

    // Force an immediate draw to show the initial state
    const canvas = canvasRef.current;
    if (canvas) {
      const context = canvas.getContext("2d");
      if (context) {
        draw(context);
      }
    }
  };

  const resetGame = () => {
    boardRef.current = createBoard(BOARD_WIDTH, BOARD_HEIGHT);
    pieceRef.current = {
      position: { x: Math.floor(BOARD_WIDTH / 2) - 1, y: 0 },
      shape: PIECES[Math.floor(Math.random() * PIECES.length)],
    };
    setScore(0);
    setGameOver(false);
    lastTimeRef.current = 0;
    dropCounterRef.current = 0;
  };

  const exitGame = () => {
    setGameActive(false);
    setGameStarted(false);
    setGameOver(false);
    resetGame();

    // Draw empty board
    const canvas = canvasRef.current;
    if (canvas) {
      const context = canvas.getContext("2d");
      if (context) {
        context.fillStyle = "#000";
        context.fillRect(0, 0, BOARD_WIDTH, BOARD_HEIGHT);
      }
    }

    if (requestRef.current) {
      cancelAnimationFrame(requestRef.current);
    }
  };

  // Initialize canvas only once
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const context = canvas.getContext("2d");
      if (context) {
        // Clear any previous scaling
        context.setTransform(1, 0, 0, 1, 0, 0);
        // Set the scale
        context.scale(BLOCK_SIZE, BLOCK_SIZE);
        // Initial empty board draw
        context.fillStyle = "#000";
        context.fillRect(0, 0, BOARD_WIDTH, BOARD_HEIGHT);
      }
    }
  }, []);

  // Handle game state changes and keyboard events
  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);

    // Start game loop if game is active
    if (gameActive) {
      requestRef.current = requestAnimationFrame(gameLoop);
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameActive]);

  // Effect to update the canvas when game state changes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const context = canvas.getContext("2d");
      if (context) {
        draw(context);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameActive, gameOver]);

  return (
    <div className={`flex-col items-center justify-center ${visible === "tetris" ? "flex" : "hidden"} fixed top-0 left-0 w-screen h-screen bg-black z-[90]`}>
      <div className="mb-4 text-white">
        Score: <span className="font-bold">{score}</span>
      </div>
      <canvas
        ref={canvasRef}
        width={BLOCK_SIZE * BOARD_WIDTH}
        height={BLOCK_SIZE * BOARD_HEIGHT}
        className="border-2 border-gray-700"
      />

      <div className="mt-4 flex gap-4">
        {!gameStarted ? (
          <button
            onClick={startGame}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md"
          >
            Start Game
          </button>
        ) : (
          <>
            <button onClick={exitGame} className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-md">
              Reinciar
            </button>
          </>
        )}
      </div>

      {gameOver && (
        <div className="mt-4">
          <div className="font-bold text-xl mb-2 text-white px-2">Game Over!</div>
        </div>
      )}
      <button onClick={() => {
        exitGame();
        setVisible(null)
      }} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md mt-4 absolute right-0 top-0 m-4">
        Salir
      </button>
    </div>
  );
}
