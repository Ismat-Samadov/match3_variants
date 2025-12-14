import { Board, Gem, GemType, Position, Match } from '@/types/game';

const GEM_TYPES: GemType[] = ['red', 'blue', 'green', 'yellow', 'purple', 'orange'];

// Generate a random gem
export function generateGem(): Gem {
  const type = GEM_TYPES[Math.floor(Math.random() * GEM_TYPES.length)];
  return {
    type,
    id: `${type}-${Date.now()}-${Math.random()}`,
  };
}

// Create initial board
export function createBoard(size: number): Board {
  const gems: (Gem | null)[][] = [];

  // Generate board ensuring no initial matches
  for (let row = 0; row < size; row++) {
    gems[row] = [];
    for (let col = 0; col < size; col++) {
      let gem: Gem;
      let attempts = 0;

      do {
        gem = generateGem();
        attempts++;

        // Safety check to prevent infinite loop
        if (attempts > 50) {
          break;
        }
      } while (wouldCreateMatch(gems, row, col, gem.type, size));

      gems[row][col] = gem;
    }
  }

  return { gems, size };
}

// Check if placing a gem would create an immediate match
function wouldCreateMatch(
  gems: (Gem | null)[][],
  row: number,
  col: number,
  type: GemType,
  size: number
): boolean {
  // Check horizontal
  let horizontalCount = 1;

  // Check left
  for (let c = col - 1; c >= 0 && gems[row]?.[c]?.type === type; c--) {
    horizontalCount++;
  }

  // Check right
  for (let c = col + 1; c < size && gems[row]?.[c]?.type === type; c++) {
    horizontalCount++;
  }

  if (horizontalCount >= 3) return true;

  // Check vertical
  let verticalCount = 1;

  // Check up
  for (let r = row - 1; r >= 0 && gems[r]?.[col]?.type === type; r--) {
    verticalCount++;
  }

  // Check down
  for (let r = row + 1; r < size && gems[r]?.[col]?.type === type; r++) {
    verticalCount++;
  }

  return verticalCount >= 3;
}

// Check if two positions are adjacent
export function areAdjacent(pos1: Position, pos2: Position): boolean {
  const rowDiff = Math.abs(pos1.row - pos2.row);
  const colDiff = Math.abs(pos1.col - pos2.col);

  return (rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1);
}

// Swap two gems on the board
export function swapGems(board: Board, pos1: Position, pos2: Position): Board {
  const newGems = board.gems.map(row => [...row]);
  const temp = newGems[pos1.row][pos1.col];
  newGems[pos1.row][pos1.col] = newGems[pos2.row][pos2.col];
  newGems[pos2.row][pos2.col] = temp;

  return { ...board, gems: newGems };
}

// Find all matches on the board
export function findMatches(board: Board): Match[] {
  const matches: Match[] = [];
  const { gems, size } = board;
  const processed = new Set<string>();

  // Check horizontal matches
  for (let row = 0; row < size; row++) {
    let col = 0;
    while (col < size) {
      const gem = gems[row][col];
      if (!gem) {
        col++;
        continue;
      }

      const matchPositions: Position[] = [{ row, col }];
      let nextCol = col + 1;

      while (nextCol < size && gems[row][nextCol]?.type === gem.type) {
        matchPositions.push({ row, col: nextCol });
        nextCol++;
      }

      if (matchPositions.length >= 3) {
        const matchKey = matchPositions.map(p => `${p.row},${p.col}`).join('|');
        if (!processed.has(matchKey)) {
          matches.push({
            positions: matchPositions,
            type: gem.type,
            isSpecial: matchPositions.length >= 4,
          });
          processed.add(matchKey);
        }
      }

      col = nextCol;
    }
  }

  // Check vertical matches
  for (let col = 0; col < size; col++) {
    let row = 0;
    while (row < size) {
      const gem = gems[row][col];
      if (!gem) {
        row++;
        continue;
      }

      const matchPositions: Position[] = [{ row, col }];
      let nextRow = row + 1;

      while (nextRow < size && gems[nextRow][col]?.type === gem.type) {
        matchPositions.push({ row: nextRow, col });
        nextRow++;
      }

      if (matchPositions.length >= 3) {
        const matchKey = matchPositions.map(p => `${p.row},${p.col}`).join('|');
        if (!processed.has(matchKey)) {
          matches.push({
            positions: matchPositions,
            type: gem.type,
            isSpecial: matchPositions.length >= 4,
          });
          processed.add(matchKey);
        }
      }

      row = nextRow;
    }
  }

  return matches;
}

// Remove matched gems from board
export function removeMatches(board: Board, matches: Match[]): Board {
  const newGems = board.gems.map(row => [...row]);

  matches.forEach(match => {
    match.positions.forEach(pos => {
      newGems[pos.row][pos.col] = null;
    });
  });

  return { ...board, gems: newGems };
}

// Apply gravity to fill empty spaces
export function applyGravity(board: Board): Board {
  const { gems, size } = board;
  const newGems = gems.map(row => [...row]);

  // Process each column
  for (let col = 0; col < size; col++) {
    // Collect non-null gems from bottom to top
    const column: (Gem | null)[] = [];

    for (let row = size - 1; row >= 0; row--) {
      if (newGems[row][col] !== null) {
        column.push(newGems[row][col]);
      }
    }

    // Fill from bottom
    let writeRow = size - 1;
    for (const gem of column) {
      newGems[writeRow][col] = gem;
      writeRow--;
    }

    // Fill remaining with new gems
    while (writeRow >= 0) {
      newGems[writeRow][col] = generateGem();
      writeRow--;
    }
  }

  return { ...board, gems: newGems };
}

// Calculate score for matches
export function calculateScore(matches: Match[], combo: number): number {
  let totalScore = 0;

  matches.forEach(match => {
    const baseScore = match.positions.length * 10;
    const lengthBonus = Math.max(0, (match.positions.length - 3) * 20);
    const comboMultiplier = 1 + (combo * 0.5);

    totalScore += (baseScore + lengthBonus) * comboMultiplier;
  });

  return Math.floor(totalScore);
}

// Check if there are any possible moves
export function hasValidMoves(board: Board): boolean {
  const { gems, size } = board;

  // Try swapping each gem with its adjacent neighbors
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      // Try right swap
      if (col < size - 1) {
        const testBoard = swapGems(board, { row, col }, { row, col: col + 1 });
        if (findMatches(testBoard).length > 0) {
          return true;
        }
      }

      // Try down swap
      if (row < size - 1) {
        const testBoard = swapGems(board, { row, col }, { row: row + 1, col });
        if (findMatches(testBoard).length > 0) {
          return true;
        }
      }
    }
  }

  return false;
}

// Shuffle board when no moves available
export function shuffleBoard(board: Board): Board {
  const { size } = board;
  const flatGems = board.gems.flat().filter((gem): gem is Gem => gem !== null);

  // Fisher-Yates shuffle
  for (let i = flatGems.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [flatGems[i], flatGems[j]] = [flatGems[j], flatGems[i]];
  }

  // Rebuild board
  const newGems: (Gem | null)[][] = [];
  let idx = 0;

  for (let row = 0; row < size; row++) {
    newGems[row] = [];
    for (let col = 0; col < size; col++) {
      newGems[row][col] = flatGems[idx++] || generateGem();
    }
  }

  const newBoard = { gems: newGems, size };

  // Ensure no matches after shuffle
  const matches = findMatches(newBoard);
  if (matches.length > 0) {
    return shuffleBoard(newBoard);
  }

  return newBoard;
}
