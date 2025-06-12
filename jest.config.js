module.exports = {
  preset: 'react-native',
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|expo|@expo|@react-native/js-polyfills|@testing-library|react-native-url-polyfill|@supabase|@sentry|victory-native|@react-navigation|react-native-screens|react-native-safe-area-context|react-native-gesture-handler|react-native-svg|@react-native-async-storage|@react-native-voice)/)',
  ],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  setupFiles: ['<rootDir>/jest.setup.js'],
  setupFilesAfterEnv: [
    '<rootDir>/src/setupTests.ts',
    '<rootDir>/node_modules/@testing-library/react-native/src/matchers/extend-expect.ts',
  ],
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@react-native/js-polyfills/error-guard$': 'identity-obj-proxy',
    '^react-native-url-polyfill/auto$': 'identity-obj-proxy',
    '^@sentry/react-native$': '<rootDir>/src/__mocks__/@sentry/react-native.js',
    '^expo-notifications$': '<rootDir>/src/__mocks__/expo-notifications.js',
    '^expo-av$': '<rootDir>/src/__mocks__/expo-av.js',
  },
};
