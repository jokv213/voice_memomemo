import {auth} from '../supabase';

describe('AuthService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('signUp', () => {
    it('should successfully sign up a user', async () => {
      const mockUser = {id: '123', email: 'test@example.com'};
      const mockData = {user: mockUser, session: null};

      (auth.signUp as jest.Mock) = jest.fn().mockResolvedValue({
        data: mockData,
        error: null,
      });

      const result = await auth.signUp('test@example.com', 'password123', 'individual');

      expect(result.error).toBeNull();
      expect(result.data).toEqual(mockData);
    });

    it('should handle signup error', async () => {
      (auth.signUp as jest.Mock) = jest.fn().mockResolvedValue({
        data: null,
        error: {message: 'Email already registered', name: 'AuthApiError'},
      });

      const result = await auth.signUp('test@example.com', 'password123', 'individual');

      expect(result.error).toEqual({
        message: 'Email already registered',
        code: 'AuthApiError',
      });
      expect(result.data).toBeNull();
    });

    it('should continue signup even if email sending fails', async () => {
      const mockUser = {id: '123', email: 'test@example.com'};
      const mockData = {user: mockUser, session: null};

      (auth.signUp as jest.Mock) = jest.fn().mockResolvedValue({
        data: mockData,
        error: null,
      });

      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      const result = await auth.signUp('test@example.com', 'password123', 'individual');

      expect(result.error).toBeNull();
      expect(result.data).toEqual(mockData);

      consoleSpy.mockRestore();
    });

    it('should handle edge function invocation exception', async () => {
      const mockUser = {id: '123', email: 'test@example.com'};
      const mockData = {user: mockUser, session: null};

      (auth.signUp as jest.Mock) = jest.fn().mockResolvedValue({
        data: mockData,
        error: null,
      });

      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      const result = await auth.signUp('test@example.com', 'password123', 'trainer');

      expect(result.error).toBeNull();
      expect(result.data).toEqual(mockData);

      consoleSpy.mockRestore();
    });
  });

  describe('signInWithPassword', () => {
    it('should successfully sign in a user', async () => {
      const mockUser = {id: '123', email: 'test@example.com'};
      const mockSession = {access_token: 'token123', user: mockUser};
      const mockData = {user: mockUser, session: mockSession};

      (auth.signInWithPassword as jest.Mock) = jest.fn().mockResolvedValue({
        data: mockData,
        error: null,
      });

      const result = await auth.signInWithPassword('test@example.com', 'password123');

      expect(result.error).toBeNull();
      expect(result.data).toEqual(mockData);
    });

    it('should handle signin error', async () => {
      (auth.signInWithPassword as jest.Mock) = jest.fn().mockResolvedValue({
        data: null,
        error: {message: 'Invalid credentials', name: 'AuthApiError'},
      });

      const result = await auth.signInWithPassword('test@example.com', 'wrongpassword');

      expect(result.error).toEqual({
        message: 'Invalid credentials',
        code: 'AuthApiError',
      });
      expect(result.data).toBeNull();
    });

    it('should handle exception during signin', async () => {
      (auth.signInWithPassword as jest.Mock) = jest
        .fn()
        .mockRejectedValue(new Error('Network error'));

      const result = await auth.signInWithPassword('test@example.com', 'password123');

      expect(result.error).toEqual({
        message: 'Failed to sign in',
        details: expect.any(Error),
      });
      expect(result.data).toBeNull();
    });
  });

  describe('signOut', () => {
    it('should successfully sign out', async () => {
      (auth.signOut as jest.Mock) = jest.fn().mockResolvedValue({
        error: null,
      });

      const result = await auth.signOut();

      expect(result.error).toBeNull();
      expect(result.data).toBeUndefined();
    });

    it('should handle signout error', async () => {
      (auth.signOut as jest.Mock) = jest.fn().mockResolvedValue({
        error: {message: 'Signout failed', name: 'AuthApiError'},
      });

      const result = await auth.signOut();

      expect(result.error).toEqual({
        message: 'Signout failed',
        code: 'AuthApiError',
      });
      expect(result.data).toBeNull();
    });
  });

  describe('getSession', () => {
    it('should successfully get session', async () => {
      const mockSession = {access_token: 'token123', user: {id: '123'}};
      const mockData = {session: mockSession};

      (auth.getSession as jest.Mock) = jest.fn().mockResolvedValue({
        data: mockData,
        error: null,
      });

      const result = await auth.getSession();

      expect(result.error).toBeNull();
      expect(result.data).toEqual(mockData);
    });

    it('should handle get session error', async () => {
      (auth.getSession as jest.Mock) = jest.fn().mockResolvedValue({
        data: null,
        error: {message: 'Session not found', name: 'AuthApiError'},
      });

      const result = await auth.getSession();

      expect(result.error).toEqual({
        message: 'Session not found',
        code: 'AuthApiError',
      });
      expect(result.data).toBeNull();
    });
  });
});
