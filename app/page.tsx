'use client';

import dynamic from 'next/dynamic';

const GameBoard = dynamic(() => import('@/components/GameBoard'), { ssr: false });
const Leaderboard = dynamic(() => import('@/components/Leaderboard'), { ssr: false });

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-start py-8 px-4 bg-gradient-to-b from-gray-900 via-purple-900/20 to-gray-900">
      <GameBoard />
      <div className="mt-8 w-full flex justify-center">
        <Leaderboard />
      </div>

      {/* Footer */}
      <footer className="mt-12 text-center text-gray-500 text-sm">
        <p>Built with Next.js & TypeScript</p>
        <p className="mt-1">Match 3 or more gems to score points!</p>
      </footer>
    </main>
  );
}
