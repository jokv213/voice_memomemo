// Global mocks for Jest
jest.setTimeout(30000);

// Mock expo-constants
jest.mock('expo-constants', () => ({
  expoConfig: {
    extra: {
      supabaseUrl: 'http://localhost:54321',
      supabaseAnonKey: 'test-anon-key',
      sentryDsn: 'test-sentry-dsn',
      openaiApiKey: 'test-openai-key',
    },
  },
}));

// Mock expo-av
jest.mock('expo-av', () => ({
  Audio: {
    Recording: jest.fn().mockImplementation(() => ({
      prepareToRecordAsync: jest.fn(),
      startAsync: jest.fn(),
      stopAndUnloadAsync: jest.fn(() =>
        Promise.resolve({
          uri: 'file://test.m4a',
          duration: 1000,
        }),
      ),
      getStatusAsync: jest.fn(() =>
        Promise.resolve({
          isRecording: false,
          durationMillis: 1000,
        }),
      ),
    })),
    setAudioModeAsync: jest.fn(),
    requestPermissionsAsync: jest.fn(() => Promise.resolve({status: 'granted'})),
    getPermissionsAsync: jest.fn(() => Promise.resolve({status: 'granted'})),
  },
}));

// Mock @react-native-voice/voice
jest.mock('@react-native-voice/voice', () => ({
  start: jest.fn(),
  stop: jest.fn(),
  cancel: jest.fn(),
  destroy: jest.fn(),
  isAvailable: jest.fn(() => Promise.resolve(true)),
  isRecognizing: jest.fn(() => Promise.resolve(false)),
  isSpeaking: jest.fn(() => Promise.resolve(false)),
  getSpeechRecognitionServices: jest.fn(() => Promise.resolve([])),
  onSpeechStart: jest.fn(),
  onSpeechRecognized: jest.fn(),
  onSpeechEnd: jest.fn(),
  onSpeechError: jest.fn(),
  onSpeechResults: jest.fn(),
  onSpeechPartialResults: jest.fn(),
  onSpeechVolumeChanged: jest.fn(),
  removeAllListeners: jest.fn(),
}));

// Mock React Native modules
// eslint-disable-next-line no-underscore-dangle
global.__DEV__ = true;

// Mock timers correctly
global.setTimeout = jest.fn(cb => {
  const timer = {unref: jest.fn()};
  if (typeof cb === 'function') {
    Promise.resolve().then(cb);
  }
  return timer;
});
global.clearTimeout = jest.fn();

// Mock console methods to avoid noise in tests
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

console.error = (...args) => {
  if (
    typeof args[0] === 'string' &&
    (args[0].includes('Warning: ReactTestRenderer') ||
      args[0].includes('Warning: An update to') ||
      args[0].includes('Warning: Cannot update a component'))
  ) {
    return;
  }
  originalConsoleError(...args);
};

console.warn = (...args) => {
  if (
    typeof args[0] === 'string' &&
    (args[0].includes('Sentry DSN not configured') ||
      args[0].includes('Failed to send confirmation email') ||
      args[0].includes('Error destroying voice service'))
  ) {
    return;
  }
  originalConsoleWarn(...args);
};
