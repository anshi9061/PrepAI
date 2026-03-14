# PREP AI

AI-powered exam preparation platform for Indian competitive exams (NEET, JEE, KEAM, CLAT, CBSE boards, and more).

Built with **Expo** (React Native) for iOS, Android, and Web from a single codebase.

## Tech Stack

- **Mobile/Web**: Expo SDK 52 + React Native + Expo Router
- **Styling**: NativeWind (Tailwind CSS for React Native)
- **Backend**: Supabase (Auth, PostgreSQL, Storage, Edge Functions)
- **AI**: Google Gemini API (proxied through Supabase Edge Functions)
- **State**: Zustand

## Getting Started

### Prerequisites

- Node.js 18+
- Expo CLI (`npm install -g expo-cli`)
- A [Supabase](https://supabase.com) project (free tier works)

### Setup

```bash
# Install dependencies
npm install

# Copy environment template and add your Supabase keys
cp .env.example .env.local

# Start the dev server
npx expo start
```

Press `i` for iOS simulator, `a` for Android emulator, or `w` for web.

## Project Structure

```
├── app/                 # Expo Router screens
│   ├── (auth)/          # Login / Register
│   ├── (tabs)/          # Main tab navigation
│   └── _layout.tsx      # Root layout (auth guard)
├── shared/              # Reusable business logic
│   ├── types.ts         # TypeScript domain types
│   ├── constants/       # Exam database, topics, patterns
│   ├── services/        # Quiz logic, paper catalog
│   └── ai/              # AI prompt templates
├── lib/                 # Client configs
│   ├── supabase.ts      # Supabase client
│   └── store.ts         # Zustand stores
├── components/          # Reusable UI components
└── assets/              # Images, fonts
```

## Features

- Quiz engine with practice mode, mock tests, and daily challenges
- 50+ Indian exams: NEET, JEE, KEAM, CLAT, CBSE, state boards
- Analytics dashboard with progress tracking
- Past papers browser
- AI chat assistant (coming soon)
- Cross-platform: iOS, Android, and Web from one codebase
