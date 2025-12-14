'use client';

import { useState, useEffect } from 'react';
import { LeaderboardEntry } from '@/types/game';
import { getLeaderboard, clearLeaderboard } from '@/lib/storage';

export default function Leaderboard() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const loadLeaderboard = () => {
    setEntries(getLeaderboard());
  };

  const handleClear = () => {
    if (confirm('Are you sure you want to clear the leaderboard?')) {
      clearLeaderboard();
      loadLeaderboard();
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full max-w-2xl">
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold py-3 px-6 rounded-lg transition-all mb-4"
      >
        {isVisible ? 'Hide' : 'Show'} Leaderboard
      </button>

      {isVisible && (
        <div className="bg-gray-800 rounded-xl p-6 shadow-xl">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-white">Top Scores</h2>
            {entries.length > 0 && (
              <button
                onClick={handleClear}
                className="text-sm text-red-400 hover:text-red-300 transition-colors"
              >
                Clear All
              </button>
            )}
          </div>

          {entries.length === 0 ? (
            <p className="text-gray-400 text-center py-8">No scores yet. Play a game!</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-gray-400 text-sm border-b border-gray-700">
                    <th className="text-left py-2 px-2">Rank</th>
                    <th className="text-right py-2 px-2">Score</th>
                    <th className="text-right py-2 px-2">Moves</th>
                    <th className="text-right py-2 px-2">Time</th>
                    <th className="text-right py-2 px-2">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {entries.map((entry, index) => (
                    <tr
                      key={index}
                      className={`border-b border-gray-700/50 ${
                        index === 0 ? 'text-yellow-400' : 'text-white'
                      }`}
                    >
                      <td className="py-3 px-2">
                        <div className="flex items-center gap-2">
                          {index === 0 && <span>🏆</span>}
                          {index === 1 && <span>🥈</span>}
                          {index === 2 && <span>🥉</span>}
                          <span className="font-bold">#{index + 1}</span>
                        </div>
                      </td>
                      <td className="text-right py-3 px-2 font-bold">
                        {entry.score.toLocaleString()}
                      </td>
                      <td className="text-right py-3 px-2 text-gray-300">
                        {entry.moves}
                      </td>
                      <td className="text-right py-3 px-2 text-gray-300">
                        {formatTime(entry.time)}
                      </td>
                      <td className="text-right py-3 px-2 text-gray-400 text-sm">
                        {formatDate(entry.date)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
