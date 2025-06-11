import React, {createContext, useContext, useEffect, useState, ReactNode} from 'react';
import * as SecureStore from 'expo-secure-store';
import {supabase, auth as authService} from '../lib/supabase';
import {AuthContextType, AuthState} from '../types/auth';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

const REMEMBER_ME_KEY = 'remember_me_preference';

export function AuthProvider({children}: AuthProviderProps) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    loading: true,
    error: null,
  });

  const clearError = () => {
    setAuthState(prev => ({...prev, error: null}));
  };

  const signIn = async (email: string, password: string, rememberMe = false) => {
    try {
      setAuthState(prev => ({...prev, loading: true, error: null}));

      const result = await authService.signInWithPassword(email, password);

      if (result.error) {
        setAuthState(prev => ({
          ...prev,
          loading: false,
          error: result.error!.message,
        }));
        return;
      }

      // Store remember preference securely
      if (rememberMe) {
        await SecureStore.setItemAsync(REMEMBER_ME_KEY, 'true');
      } else {
        await SecureStore.deleteItemAsync(REMEMBER_ME_KEY);
      }

      // State will be updated by auth state change listener
      setAuthState(prev => ({...prev, loading: false}));
    } catch (error) {
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to sign in',
      }));
    }
  };

  const signUp = async (email: string, password: string, role: 'individual' | 'trainer') => {
    try {
      setAuthState(prev => ({...prev, loading: true, error: null}));

      const result = await authService.signUp(email, password, role);

      if (result.error) {
        setAuthState(prev => ({
          ...prev,
          loading: false,
          error: result.error!.message,
        }));
        return;
      }

      // State will be updated by auth state change listener
      setAuthState(prev => ({...prev, loading: false}));
    } catch (error) {
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to sign up',
      }));
    }
  };

  const signOut = async () => {
    try {
      setAuthState(prev => ({...prev, loading: true, error: null}));

      const result = await authService.signOut();

      if (result.error) {
        setAuthState(prev => ({
          ...prev,
          loading: false,
          error: result.error!.message,
        }));
        return;
      }

      // Clear remember preference
      await SecureStore.deleteItemAsync(REMEMBER_ME_KEY);

      // State will be updated by auth state change listener
      setAuthState(prev => ({...prev, loading: false}));
    } catch (error) {
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to sign out',
      }));
    }
  };

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const result = await authService.getSession();

        if (result.error) {
          console.warn('Failed to get initial session:', result.error);
          setAuthState(prev => ({...prev, loading: false}));
          return;
        }

        setAuthState(prev => ({
          ...prev,
          user: result.data?.session?.user ?? null,
          session: result.data?.session ?? null,
          loading: false,
        }));
      } catch (error) {
        console.error('Error getting initial session:', error);
        setAuthState(prev => ({...prev, loading: false}));
      }
    };

    // Listen for auth state changes
    const {data: authListener} = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state change:', event, session?.user?.email);

      setAuthState(prev => ({
        ...prev,
        user: session?.user ?? null,
        session: session ?? null,
        loading: false,
      }));

      // Handle specific auth events
      if (event === 'SIGNED_OUT') {
        // Clear any cached data here if needed
        console.log('User signed out, clearing cache...');
      }
    });

    getInitialSession();

    // Cleanup listener on unmount
    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  const value: AuthContextType = {
    ...authState,
    signIn,
    signUp,
    signOut,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
