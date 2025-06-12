# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- **OpenAI Integration**: GPT-4o-mini streaming formatter for exercise and memo data
- LLM service layer with formatExercise() and formatMemo() functions
- AI-powered data structuring with fallback to original parsed data
- Comprehensive test suite for LLM integration (snapshots, mocks, E2E)
- Initial project setup with Expo SDK 53 and TypeScript
- Supabase backend integration with authentication
- Database schema with Row Level Security (RLS)
- ESLint airbnb-typescript configuration with 0 errors
- Jest unit testing setup
- Detox E2E testing configuration
- GitHub Actions CI/CD pipeline
- Husky pre-commit hooks
- EAS Build and Update configuration
- Sentry error tracking integration

### Security

- Secure token storage with Expo SecureStore
- Row Level Security policies for all database tables
- Environment variable configuration for sensitive data

## [1.0.0] - 2024-01-01

### Added

- Initial release of トレーニング声メモくん
- Voice input for exercise logging
- Training session management
- Rest timer functionality
- Trainer-client relationship system
- Cross-platform support (iOS 15+, Android 9+)
