import {auth} from '../supabase';

// Mock Supabase
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    auth: {
      signInWithPassword: jest.fn(),
      signUp: jest.fn(),
      signOut: jest.fn(),
      getSession: jest.fn(),
      onAuthStateChange: jest.fn(() => ({
        data: {subscription: {unsubscribe: jest.fn()}},
      })),
    },
  })),
}));

describe('Auth Service', () => {
  describe('signInWithPassword', () => {
    it('should return success result for valid credentials', async () => {
      const mockAuth = require('@supabase/supabase-js').createClient().auth;
      mockAuth.signInWithPassword.mockResolvedValue({
        data: {user: {id: '123', email: 'test@example.com'}},
        error: null,
      });

      const result = await auth.signInWithPassword('test@example.com', 'password');

      expect(result.error).toBeNull();
      expect(result.data).toBeTruthy();
    });

    it('should return error result for invalid credentials', async () => {
      const mockAuth = require('@supabase/supabase-js').createClient().auth;
      mockAuth.signInWithPassword.mockResolvedValue({
        data: null,
        error: {message: 'Invalid credentials', name: 'AuthError'},
      });

      const result = await auth.signInWithPassword('test@example.com', 'wrong');

      expect(result.data).toBeNull();
      expect(result.error?.message).toBe('Invalid credentials');
    });
  });

  describe('signUp', () => {
    it('should create new user account', async () => {
      const mockAuth = require('@supabase/supabase-js').createClient().auth;
      mockAuth.signUp.mockResolvedValue({
        data: {user: {id: '123', email: 'test@example.com'}},
        error: null,
      });

      const result = await auth.signUp('test@example.com', 'password', 'individual');

      expect(result.error).toBeNull();
      expect(result.data).toBeTruthy();
    });
  });

  describe('signOut', () => {
    it('should sign out successfully', async () => {
      const mockAuth = require('@supabase/supabase-js').createClient().auth;
      mockAuth.signOut.mockResolvedValue({error: null});

      const result = await auth.signOut();

      expect(result.error).toBeNull();
    });
  });
});
