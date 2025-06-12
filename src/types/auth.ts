import {User, Session} from '@supabase/supabase-js';

export interface AuthState {
  user: User | null;
  session: Session | null;
  role: 'individual' | 'trainer' | null;
  loading: boolean;
  error: string | null;
}

export interface Profile {
  id: string;
  email: string;
  role: 'individual' | 'trainer';
  created_at: string;
}

export interface AuthContextType extends AuthState {
  signIn: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  signUp: (email: string, password: string, role: 'individual' | 'trainer') => Promise<void>;
  signOut: () => Promise<void>;
  clearError: () => void;
}

export interface SignInCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface SignUpCredentials {
  email: string;
  password: string;
  role: 'individual' | 'trainer';
}
