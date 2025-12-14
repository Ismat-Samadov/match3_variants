import { LeaderboardEntry } from '@/types/game';

const STORAGE_KEY = 'match3_leaderboard';
const HIGH_SCORE_KEY = 'match3_high_score';

export function getLeaderboard(): LeaderboardEntry[] {
  if (typeof window === 'undefined') return [];

  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Failed to load leaderboard:', error);
    return [];
  }
}

export function saveScore(entry: LeaderboardEntry): void {
  if (typeof window === 'undefined') return;

  try {
    const leaderboard = getLeaderboard();
    leaderboard.push(entry);

    // Sort by score (descending) and keep top 10
    leaderboard.sort((a, b) => b.score - a.score);
    const topScores = leaderboard.slice(0, 10);

    localStorage.setItem(STORAGE_KEY, JSON.stringify(topScores));

    // Update high score
    const currentHigh = getHighScore();
    if (entry.score > currentHigh) {
      localStorage.setItem(HIGH_SCORE_KEY, entry.score.toString());
    }
  } catch (error) {
    console.error('Failed to save score:', error);
  }
}

export function getHighScore(): number {
  if (typeof window === 'undefined') return 0;

  try {
    const score = localStorage.getItem(HIGH_SCORE_KEY);
    return score ? parseInt(score, 10) : 0;
  } catch (error) {
    console.error('Failed to load high score:', error);
    return 0;
  }
}

export function clearLeaderboard(): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(HIGH_SCORE_KEY);
  } catch (error) {
    console.error('Failed to clear leaderboard:', error);
  }
}
