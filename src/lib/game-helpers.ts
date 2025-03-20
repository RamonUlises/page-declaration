import { BOARD_WIDTH } from "./constants"

export interface Piece {
  position: { x: number; y: number }
  shape: number[][]
}

export function createBoard(width: number, height: number): number[][] {
  return Array(height)
    .fill(null)
    .map(() => Array(width).fill(0))
}

export function checkCollision(piece: Piece, board: number[][]): boolean {
  return piece.shape.some((row, y) => {
    return row.some((value, x) => {
      const boardX = x + piece.position.x
      const boardY = y + piece.position.y

      // Check if we're outside the board boundaries
      if (boardY < 0 || boardY >= board.length || boardX < 0 || boardX >= board[0].length) {
        return value !== 0
      }

      // Check if we're colliding with a non-empty cell
      return value !== 0 && board[boardY][boardX] !== 0
    })
  })
}

export function removeRows(board: number[][]): number {
  let rowsCleared = 0

  for (let y = board.length - 1; y >= 0; y--) {
    if (board[y].every((value) => value === 1)) {
      // Remove the row
      board.splice(y, 1)
      // Add a new empty row at the top
      board.unshift(Array(BOARD_WIDTH).fill(0))
      rowsCleared++
      // Since we removed a row, we need to check the same y index again
      y++
    }
  }

  return rowsCleared
}

