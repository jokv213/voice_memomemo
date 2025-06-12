// Jest matchers are imported via setupFilesAfterEnv in jest.config.js

// Mock SecureStore
jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

// Mock Supabase
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    auth: {
      signInWithPassword: jest.fn(() =>
        Promise.resolve({data: {user: {}, session: {}}, error: null}),
      ),
      signUp: jest.fn(() => Promise.resolve({data: {user: {}, session: {}}, error: null})),
      signOut: jest.fn(() => Promise.resolve({error: null})),
      getSession: jest.fn(() => Promise.resolve({data: {session: null}, error: null})),
      onAuthStateChange: jest.fn(() => ({
        data: {subscription: {unsubscribe: jest.fn()}},
      })),
    },
  })),
}));

// Global test timeout
jest.setTimeout(10000);
