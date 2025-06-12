import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {createClient} from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';

const supabaseUrl = 'https://cyfcwckeqocmlwdpjjjn.supabase.co';
const supabaseAnonKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN5ZmN3Y2tlcW9jbWx3ZHBqampuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY5NzU5ODEsImV4cCI6MjA2MjU1MTk4MX0.c-QtWTVdadDQqV2rqsB2vJUAGyYJ09u7Ybux3rABX88';

// Enhanced auth storage with secure storage fallback
const ExpoSecureStoreAdapter = {
  getItem: (key: string) => {
    try {
      return SecureStore.getItemAsync(key);
    } catch (error) {
      console.warn('SecureStore unavailable, falling back to AsyncStorage:', error);
      return AsyncStorage.getItem(key);
    }
  },
  setItem: (key: string, value: string) => {
    try {
      return SecureStore.setItemAsync(key, value);
    } catch (error) {
      console.warn('SecureStore unavailable, falling back to AsyncStorage:', error);
      return AsyncStorage.setItem(key, value);
    }
  },
  removeItem: (key: string) => {
    try {
      return SecureStore.deleteItemAsync(key);
    } catch (error) {
      console.warn('SecureStore unavailable, falling back to AsyncStorage:', error);
      return AsyncStorage.removeItem(key);
    }
  },
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: ExpoSecureStoreAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

// Type-safe database schema interfaces
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          role: 'individual' | 'trainer';
          created_at: string;
        };
        Insert: {
          id: string;
          email: string;
          role: 'individual' | 'trainer';
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          role?: 'individual' | 'trainer';
          created_at?: string;
        };
      };
      trainer_clients: {
        Row: {
          trainer_id: string;
          client_id: string;
          created_at: string;
        };
        Insert: {
          trainer_id: string;
          client_id: string;
          created_at?: string;
        };
        Update: {
          trainer_id?: string;
          client_id?: string;
          created_at?: string;
        };
      };
      sessions: {
        Row: {
          id: string;
          owner: string;
          date: string;
          title: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          owner: string;
          date: string;
          title: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          owner?: string;
          date?: string;
          title?: string;
          created_at?: string;
        };
      };
      exercise_logs: {
        Row: {
          id: string;
          session_id: string;
          exercise: string;
          weight: number | null;
          side: string | null;
          reps: number | null;
          sets: number | null;
          memo: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          session_id: string;
          exercise: string;
          weight?: number | null;
          side?: string | null;
          reps?: number | null;
          sets?: number | null;
          memo?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          session_id?: string;
          exercise?: string;
          weight?: number | null;
          side?: string | null;
          reps?: number | null;
          sets?: number | null;
          memo?: string | null;
          created_at?: string;
        };
      };
    };
  };
}

// Type-safe error handling
export interface AppError {
  message: string;
  code?: string;
  details?: unknown;
}

export type Result<T, E = AppError> =
  | {
      data: T;
      error: null;
    }
  | {
      data: null;
      error: E;
    };

// Utility function to create typed Supabase client
export function getSupabaseClient() {
  return supabase as typeof supabase & {
    from: <T extends keyof Database['public']['Tables']>(
      table: T,
    ) => Database['public']['Tables'][T];
  };
}

// Auth helpers
export const auth = {
  async signInWithPassword(email: string, password: string): Promise<Result<any>> {
    try {
      const {data, error} = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return {data: null, error: {message: error.message, code: error.name}};
      }

      return {data, error: null};
    } catch (error) {
      return {
        data: null,
        error: {
          message: 'Failed to sign in',
          details: error,
        },
      };
    }
  },

  async signUp(
    email: string,
    password: string,
    role: 'individual' | 'trainer',
  ): Promise<Result<any>> {
    try {
      const {data, error} = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            role,
          },
        },
      });

      if (error) {
        return {data: null, error: {message: error.message, code: error.name}};
      }

      // Send development confirmation email with credentials
      try {
        const {error: funcError} = await supabase.functions.invoke('send-confirm-dev', {
          body: {email, password},
        });

        if (funcError) {
          console.warn('Failed to send confirmation email:', funcError);
          // Don't fail the signup if email sending fails
        }
      } catch (emailError) {
        console.warn('Failed to invoke send-confirm-dev function:', emailError);
        // Don't fail the signup if email sending fails
      }

      return {data, error: null};
    } catch (error) {
      return {
        data: null,
        error: {
          message: 'Failed to sign up',
          details: error,
        },
      };
    }
  },

  async signOut(): Promise<Result<void>> {
    try {
      const {error} = await supabase.auth.signOut();

      if (error) {
        return {data: null, error: {message: error.message, code: error.name}};
      }

      return {data: undefined, error: null};
    } catch (error) {
      return {
        data: null,
        error: {
          message: 'Failed to sign out',
          details: error,
        },
      };
    }
  },

  async getSession() {
    try {
      const {data, error} = await supabase.auth.getSession();

      if (error) {
        return {data: null, error: {message: error.message, code: error.name}};
      }

      return {data, error: null};
    } catch (error) {
      return {
        data: null,
        error: {
          message: 'Failed to get session',
          details: error,
        },
      };
    }
  },
};
