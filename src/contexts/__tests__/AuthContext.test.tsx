import React from 'react';
import {renderHook, act} from '@testing-library/react-native';
import {AuthProvider, useAuth} from '../AuthContext';

// Mock dependencies
jest.mock('expo-secure-store', () => ({
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
  getItemAsync: jest.fn(),
}));

jest.mock('../../lib/supabase', () => ({
  supabase: {
    auth: {
      onAuthStateChange: jest.fn(() => ({
        data: {subscription: {unsubscribe: jest.fn()}},
      })),
    },
  },
  auth: {
    signInWithPassword: jest.fn(),
    signUp: jest.fn(),
    signOut: jest.fn(),
    getSession: jest.fn(),
  },
}));

const wrapper = ({children}: {children: React.ReactNode}) => (
  <AuthProvider>{children}</AuthProvider>
);

describe('AuthContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should provide auth context', () => {
    const {result} = renderHook(() => useAuth(), {wrapper});

    expect(result.current).toBeDefined();
    expect(result.current.user).toBeNull();
    expect(result.current.session).toBeNull();
    expect(typeof result.current.signIn).toBe('function');
    expect(typeof result.current.signUp).toBe('function');
    expect(typeof result.current.signOut).toBe('function');
  });

  it('should throw error when used outside provider', () => {
    // Suppress console.error for this test
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

    expect(() => {
      renderHook(() => useAuth());
    }).toThrow('useAuth must be used within an AuthProvider');

    consoleSpy.mockRestore();
  });

  it('should handle sign in success', async () => {
    const mockAuth = require('../../lib/supabase').auth;
    mockAuth.signInWithPassword.mockResolvedValue({
      data: {user: {id: '123', email: 'test@example.com'}},
      error: null,
    });

    const {result} = renderHook(() => useAuth(), {wrapper});

    await act(async () => {
      await result.current.signIn('test@example.com', 'password');
    });

    expect(mockAuth.signInWithPassword).toHaveBeenCalledWith('test@example.com', 'password');
  });

  it('should handle sign in error', async () => {
    const mockAuth = require('../../lib/supabase').auth;
    mockAuth.signInWithPassword.mockResolvedValue({
      data: null,
      error: {message: 'Invalid credentials'},
    });

    const {result} = renderHook(() => useAuth(), {wrapper});

    await act(async () => {
      await result.current.signIn('test@example.com', 'wrong');
    });

    expect(result.current.error).toBe('Invalid credentials');
  });
});
