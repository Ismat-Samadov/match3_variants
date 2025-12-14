# Match-3 Puzzle Game

A highly engaging, mobile-friendly Match-3 puzzle game built with Next.js, TypeScript, and Tailwind CSS.

## Features

- **Addictive Gameplay**: Classic match-3 mechanics with smooth animations
- **Time Challenge**: 60-second timed mode for intense gameplay
- **Combo System**: Chain matches for bonus points and multipliers
- **Responsive Design**: Optimized for both mobile and desktop
- **Touch Controls**: Intuitive tap-to-swap mechanics
- **Haptic Feedback**: Vibration feedback on mobile devices
- **Leaderboard**: Track your top 10 high scores locally
- **Beautiful Animations**: Smooth gem animations and visual effects
- **Auto-Shuffle**: Board automatically shuffles when no moves are available

## Game Mechanics

- Match 3 or more gems of the same color
- Swap adjacent gems by tapping/clicking
- Score points for each match
- Longer matches = more points
- Chain reactions create combos for bonus multipliers
- Beat the clock to get the highest score!

## Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: React Hooks
- **Storage**: localStorage for leaderboard

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to play the game.

### Build for Production

```bash
npm run build
npm start
```

## How to Play

1. **Select a Gem**: Tap/click on a gem to select it
2. **Swap**: Tap an adjacent gem to swap positions
3. **Match**: Create lines of 3+ matching gems
4. **Score**: Earn points for matches and combos
5. **Race**: Beat the 60-second timer!

## Scoring System

- **Basic Match (3 gems)**: 30 points
- **Longer Match**: +20 points per extra gem
- **Combo Multiplier**: +50% per combo level
- **Special Matches (4+ gems)**: Bonus points

## Mobile Optimization

- Responsive grid sizing
- Touch-friendly controls
- Prevented zoom on input
- Haptic feedback
- Optimized animations
- Portrait and landscape support

## Browser Support

Works on all modern browsers:
- Chrome/Edge (recommended)
- Safari
- Firefox
- Mobile browsers

## License

MIT
