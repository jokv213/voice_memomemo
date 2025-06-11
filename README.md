# トレーニング声メモくん

A production-ready cross-platform React Native app for voice-enabled training log management.

## Quick Start

```bash
gh repo clone [repo] && cd [repo] && npm i && npm run dev
```

## Tech Stack

- **React Native (Expo SDK 53)** - Cross-platform mobile development
- **TypeScript** - Type safety and better developer experience
- **Supabase** - Backend-as-a-Service with real-time database
- **ESLint + Prettier** - Code quality and formatting
- **Jest + Detox** - Unit and E2E testing
- **Husky** - Git hooks for code quality

## Features

- 🎤 Voice input for exercise logging
- 📊 Training session management
- ⏱️ Rest timer with background notifications
- 👥 Trainer-client relationship management
- 🔒 Secure authentication with email/password
- 📱 Cross-platform (iOS 15+, Android 9+)

## Development

### Prerequisites

- Node.js 18+
- npm or yarn
- Expo CLI
- iOS Simulator (for iOS development)
- Android Emulator (for Android development)

### Available Scripts

```bash
npm start          # Start Expo development server
npm run ios        # Run on iOS simulator
npm run android    # Run on Android emulator
npm run web        # Run on web browser

npm run lint       # Run ESLint
npm run test       # Run unit tests
npm run typecheck  # Run TypeScript compiler
npm run format     # Format code with Prettier

npm run e2e:build:ios    # Build iOS for E2E testing
npm run e2e:test:ios     # Run iOS E2E tests
npm run e2e:build:android # Build Android for E2E testing
npm run e2e:test:android  # Run Android E2E tests
```

## Database Setup

The app uses Supabase as the backend. To set up the database:

1. Create a new Supabase project
2. Run the SQL schema from `sql/schema.sql` in the Supabase SQL editor
3. Update the Supabase URL and anon key in `src/lib/supabase.ts`

### Database Schema

- **profiles** - User profiles with role (individual/trainer)
- **trainer_clients** - Many-to-many relationship between trainers and clients
- **sessions** - Training sessions
- **exercise_logs** - Individual exercise entries within sessions

## Architecture

```
src/
├── lib/           # Core services (Supabase client, utilities)
├── types/         # TypeScript type definitions
├── contexts/      # React contexts (Auth, etc.)
├── components/    # Reusable UI components
├── screens/       # Screen components
├── navigation/    # Navigation configuration
└── utils/         # Utility functions
```

## Testing

- **Unit Tests**: Jest with React Native Testing Library
- **E2E Tests**: Detox for both iOS and Android
- **Type Checking**: TypeScript compiler
- **Linting**: ESLint with Airbnb TypeScript config

Coverage target: 90% for branches, functions, lines, and statements.

## Deployment

The app is configured for deployment via Expo Application Services (EAS):

- **Preview**: Internal testing builds
- **Production**: App Store and Google Play releases

## Contributing

1. Run `npm run lint` and `npm run test` before committing
2. Follow conventional commit messages
3. Ensure TypeScript compilation passes
4. Maintain test coverage above 90%

## Environment Variables

Create a `.env` file with:

```
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## License

MIT
