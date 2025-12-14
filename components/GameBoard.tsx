'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { GameState, Position } from '@/types/game';
import {
  createBoard,
  areAdjacent,
  swapGems,
  findMatches,
  removeMatches,
  applyGravity,
  calculateScore,
  hasValidMoves,
  shuffleBoard,
} from '@/lib/gameLogic';
import { getHighScore, saveScore } from '@/lib/storage';
import Gem from './Gem';

const BOARD_SIZE = 8;
const INITIAL_TIME = 60; // 60 seconds per game
const CELL_SIZE = 50; // Base cell size in pixels

export default function GameBoard() {
  const [gameState, setGameState] = useState<GameState>(() => ({
    board: createBoard(BOARD_SIZE),
    score: 0,
    moves: 0,
    timeLeft: INITIAL_TIME,
    combo: 0,
    selectedGem: null,
    isProcessing: false,
    isGameOver: false,
    highScore: 0,
  }));

  const [animatingMatches, setAnimatingMatches] = useState<Position[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [cellSize, setCellSize] = useState(CELL_SIZE);

  // Load high score on mount
  useEffect(() => {
    setGameState(prev => ({ ...prev, highScore: getHighScore() }));
  }, []);

  // Responsive cell size
  useEffect(() => {
    const updateCellSize = () => {
      const screenWidth = window.innerWidth;
      const padding = 32; // Total horizontal padding
      const maxBoardWidth = screenWidth - padding;
      const calculatedSize = Math.floor(maxBoardWidth / BOARD_SIZE);
      const finalSize = Math.min(calculatedSize, 60); // Max 60px per cell
      setCellSize(finalSize);
    };

    updateCellSize();
    window.addEventListener('resize', updateCellSize);
    return () => window.removeEventListener('resize', updateCellSize);
  }, []);

  // Game timer
  useEffect(() => {
    if (gameState.isGameOver || gameState.timeLeft <= 0) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      return;
    }

    timerRef.current = setInterval(() => {
      setGameState(prev => {
        const newTimeLeft = prev.timeLeft - 1;

        if (newTimeLeft <= 0) {
          // Game over - save score
          saveScore({
            score: prev.score,
            date: new Date().toISOString(),
            moves: prev.moves,
            time: INITIAL_TIME - newTimeLeft,
          });

          return { ...prev, timeLeft: 0, isGameOver: true };
        }

        return { ...prev, timeLeft: newTimeLeft };
      });
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [gameState.isGameOver, gameState.timeLeft]);

  // Process matches recursively for cascading
  const processMatches = useCallback(
    async (board = gameState.board, currentCombo = 0) => {
      const matches = findMatches(board);

      if (matches.length === 0) {
        // Check if board has valid moves
        if (!hasValidMoves(board)) {
          const shuffled = shuffleBoard(board);
          setGameState(prev => ({
            ...prev,
            board: shuffled,
            isProcessing: false,
            combo: 0,
          }));
        } else {
          setGameState(prev => ({ ...prev, isProcessing: false, combo: 0 }));
        }
        return;
      }

      // Animate matches
      const matchPositions = matches.flatMap(m => m.positions);
      setAnimatingMatches(matchPositions);

      await new Promise(resolve => setTimeout(resolve, 300));

      // Calculate score
      const points = calculateScore(matches, currentCombo);

      // Remove matches
      let newBoard = removeMatches(board, matches);

      await new Promise(resolve => setTimeout(resolve, 100));

      // Apply gravity
      newBoard = applyGravity(newBoard);

      setGameState(prev => ({
        ...prev,
        board: newBoard,
        score: prev.score + points,
        highScore: Math.max(prev.highScore, prev.score + points),
        combo: currentCombo + 1,
      }));

      setAnimatingMatches([]);

      // Check for new matches (cascade)
      await new Promise(resolve => setTimeout(resolve, 400));
      processMatches(newBoard, currentCombo + 1);
    },
    [gameState.board]
  );

  const handleGemClick = useCallback(
    (row: number, col: number) => {
      if (gameState.isProcessing || gameState.isGameOver) return;

      const clickedPos: Position = { row, col };

      if (!gameState.selectedGem) {
        // First selection
        setGameState(prev => ({ ...prev, selectedGem: clickedPos }));
      } else {
        // Second selection
        const { selectedGem } = gameState;

        if (selectedGem.row === row && selectedGem.col === col) {
          // Deselect
          setGameState(prev => ({ ...prev, selectedGem: null }));
          return;
        }

        if (areAdjacent(selectedGem, clickedPos)) {
          // Valid swap
          setGameState(prev => ({ ...prev, isProcessing: true, selectedGem: null }));

          const swappedBoard = swapGems(gameState.board, selectedGem, clickedPos);
          const matches = findMatches(swappedBoard);

          if (matches.length > 0) {
            // Valid move
            setGameState(prev => ({
              ...prev,
              board: swappedBoard,
              moves: prev.moves + 1,
            }));

            // Trigger haptic feedback if available
            if (typeof window !== 'undefined' && 'vibrate' in navigator) {
              navigator.vibrate(50);
            }

            processMatches(swappedBoard, 0);
          } else {
            // Invalid move - swap back
            setTimeout(() => {
              setGameState(prev => ({ ...prev, isProcessing: false }));
            }, 300);
          }
        } else {
          // Not adjacent - select new gem
          setGameState(prev => ({ ...prev, selectedGem: clickedPos }));
        }
      }
    },
    [gameState, processMatches]
  );

  const resetGame = () => {
    setGameState({
      board: createBoard(BOARD_SIZE),
      score: 0,
      moves: 0,
      timeLeft: INITIAL_TIME,
      combo: 0,
      selectedGem: null,
      isProcessing: false,
      isGameOver: false,
      highScore: getHighScore(),
    });
    setAnimatingMatches([]);
  };

  return (
    <div className="flex flex-col items-center gap-4 p-4 min-h-screen">
      {/* Header */}
      <div className="w-full max-w-2xl">
        <h1 className="text-3xl md:text-4xl font-bold text-center mb-2 bg-gradient-to-r from-purple-400 to-pink-600 text-transparent bg-clip-text">
          Match-3 Puzzle
        </h1>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
          <div className="bg-gray-800 rounded-lg p-3 text-center">
            <div className="text-gray-400 text-xs md:text-sm">Score</div>
            <div className="text-xl md:text-2xl font-bold text-yellow-400">
              {gameState.score.toLocaleString()}
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-3 text-center">
            <div className="text-gray-400 text-xs md:text-sm">High Score</div>
            <div className="text-xl md:text-2xl font-bold text-green-400">
              {gameState.highScore.toLocaleString()}
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-3 text-center">
            <div className="text-gray-400 text-xs md:text-sm">Time</div>
            <div
              className={`text-xl md:text-2xl font-bold ${
                gameState.timeLeft <= 10 ? 'text-red-400 animate-pulse' : 'text-blue-400'
              }`}
            >
              {gameState.timeLeft}s
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-3 text-center">
            <div className="text-gray-400 text-xs md:text-sm">Moves</div>
            <div className="text-xl md:text-2xl font-bold text-purple-400">
              {gameState.moves}
            </div>
          </div>
        </div>

        {/* Combo indicator */}
        {gameState.combo > 0 && (
          <div className="text-center mb-2">
            <span className="inline-block bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-2 rounded-full font-bold text-sm md:text-base animate-pulse-gem">
              {gameState.combo}x COMBO!
            </span>
          </div>
        )}
      </div>

      {/* Game Board */}
      <div
        className="relative bg-gray-900 rounded-xl p-2 shadow-2xl"
        style={{
          width: `${cellSize * BOARD_SIZE + 16}px`,
          height: `${cellSize * BOARD_SIZE + 16}px`,
        }}
      >
        <div
          className="grid gap-1"
          style={{
            gridTemplateColumns: `repeat(${BOARD_SIZE}, ${cellSize}px)`,
            gridTemplateRows: `repeat(${BOARD_SIZE}, ${cellSize}px)`,
          }}
        >
          {gameState.board.gems?.map((row, rowIndex) =>
            row?.map((gem, colIndex) => {
              if (!gem) return null;

              const isSelected =
                gameState.selectedGem?.row === rowIndex &&
                gameState.selectedGem?.col === colIndex;

              const isMatched = animatingMatches.some(
                pos => pos.row === rowIndex && pos.col === colIndex
              );

              return (
                <Gem
                  key={`${gem.id}-${rowIndex}-${colIndex}`}
                  type={gem.type}
                  isSelected={isSelected}
                  isMatched={isMatched}
                  onClick={() => handleGemClick(rowIndex, colIndex)}
                  size={cellSize}
                />
              );
            })
          )}
        </div>

        {/* Game Over Overlay */}
        {gameState.isGameOver && (
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm rounded-xl flex items-center justify-center">
            <div className="text-center p-6">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">Game Over!</h2>
              <p className="text-xl md:text-2xl mb-2 text-yellow-400">
                Final Score: {gameState.score.toLocaleString()}
              </p>
              <p className="text-base md:text-lg mb-6 text-gray-300">
                Moves: {gameState.moves}
              </p>
              <button
                onClick={resetGame}
                className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-bold py-3 px-8 rounded-full transition-all transform hover:scale-105 active:scale-95"
              >
                Play Again
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="max-w-2xl text-center text-gray-400 text-sm md:text-base">
        <p>
          Tap two adjacent gems to swap them. Match 3 or more of the same color to score
          points!
        </p>
        <p className="mt-2">Chain matches for combo bonuses!</p>
      </div>

      {/* Reset Button */}
      {!gameState.isGameOver && (
        <button
          onClick={resetGame}
          className="bg-gray-700 hover:bg-gray-600 text-white font-medium py-2 px-6 rounded-lg transition-colors"
        >
          New Game
        </button>
      )}
    </div>
  );
}
