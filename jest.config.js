module.exports = {
  preset: 'react-native',
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|expo|@expo|@react-native/js-polyfills|@testing-library|react-native-url-polyfill)/)',
  ],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  setupFilesAfterEnv: [],
  testEnvironment: 'node',
  testPathIgnorePatterns: [
    'src/hooks/__tests__/useVoiceRecording.test.ts',
    'src/hooks/__tests__/useRestTimer.test.ts',
    'src/services/__tests__/voiceService.test.ts',
    'src/data/__tests__/exerciseDictionary.test.ts',
    'src/components/__tests__/ExerciseChart.test.tsx',
    'src/components/__tests__/ProgressCircle.test.tsx',
    'src/contexts/__tests__/AuthContext.test.tsx',
    'src/lib/__tests__/supabase.test.ts',
    './App.test.tsx',
  ],
  moduleNameMapper: {
    '^react-native$': 'react-native/jest/react-native',
    '^@react-native/js-polyfills/error-guard$': 'identity-obj-proxy',
    '^react-native-url-polyfill/auto$': 'identity-obj-proxy',
  },
};
