module.exports = {
  preset: 'react-native',
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': [
      'babel-jest',
      {
        presets: [
          ['@babel/preset-env', {targets: {node: 'current'}}],
          '@babel/preset-typescript',
          '@babel/preset-react',
        ],
      },
    ],
  },
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native(-.*)?|@react-native(-.*)?|@react-navigation|@react-native-community|expo(-.*)?|@expo(-.*)?|@supabase|@sentry/react-native))',
  ],
  testMatch: ['**/__tests__/**/*.(ts|tsx|js)', '**/*.(test|spec).(ts|tsx|js)'],
  testPathIgnorePatterns: [
    'src/hooks/__tests__/useVoiceRecording.test.ts',
    'src/hooks/__tests__/useRestTimer.test.ts',
    'src/services/__tests__/voiceService.test.ts',
  ],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/setupTests.ts',
    '!src/navigation/**',
    '!src/screens/**',
  ],
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@sentry/react-native$': '<rootDir>/src/__mocks__/@sentry/react-native.js',
    '^expo-notifications$': '<rootDir>/src/__mocks__/expo-notifications.js',
    '^expo-av$': '<rootDir>/src/__mocks__/expo-av.js',
  },
  coverageThreshold: {
    global: {
      branches: 31,
      functions: 45,
      lines: 47,
      statements: 46,
    },
  },
};
