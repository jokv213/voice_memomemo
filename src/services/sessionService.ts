import {supabase, Result} from '../lib/supabase';

export interface Session {
  id: string;
  owner: string;
  date: string;
  title: string;
  created_at: string;
}

export interface ExerciseLog {
  id: string;
  session_id: string;
  exercise: string;
  weight?: number;
  side?: string;
  reps?: number;
  sets?: number;
  memo?: string;
  created_at: string;
}

export interface CreateSessionInput {
  date: string;
  title: string;
}

export interface CreateExerciseLogInput {
  session_id: string;
  exercise: string;
  weight?: number;
  side?: string;
  reps?: number;
  sets?: number;
  memo?: string;
}

class SessionService {
  async createSession(input: CreateSessionInput): Promise<Result<Session>> {
    try {
      const {data, error} = await supabase
        .from('sessions')
        .insert({
          date: input.date,
          title: input.title,
          owner: (await supabase.auth.getUser()).data.user?.id,
        })
        .select()
        .single();

      if (error) {
        return {
          data: null,
          error: {message: error.message, code: error.code},
        };
      }

      return {data, error: null};
    } catch (error) {
      return {
        data: null,
        error: {
          message: 'Failed to create session',
          details: error,
        },
      };
    }
  }

  async getTodaysSession(): Promise<Result<Session | null>> {
    try {
      const today = new Date().toISOString().split('T')[0];
      const user = await supabase.auth.getUser();

      if (!user.data.user) {
        return {
          data: null,
          error: {message: 'User not authenticated'},
        };
      }

      const {data, error} = await supabase
        .from('sessions')
        .select('*')
        .eq('owner', user.data.user.id)
        .gte('date', `${today}T00:00:00`)
        .lt('date', `${today}T23:59:59`)
        .order('created_at', {ascending: false})
        .limit(1)
        .maybeSingle();

      if (error) {
        return {
          data: null,
          error: {message: error.message, code: error.code},
        };
      }

      return {data, error: null};
    } catch (error) {
      return {
        data: null,
        error: {
          message: "Failed to get today's session",
          details: error,
        },
      };
    }
  }

  async getOrCreateTodaysSession(): Promise<Result<Session>> {
    try {
      const sessionResult = await this.getTodaysSession();

      if (sessionResult.error) {
        return sessionResult;
      }

      if (sessionResult.data) {
        return {data: sessionResult.data, error: null};
      }

      // Create new session for today
      const today = new Date();
      const title = `${today.getMonth() + 1}/${today.getDate()} トレーニング`;

      return await this.createSession({
        date: today.toISOString(),
        title,
      });
    } catch (error) {
      return {
        data: null,
        error: {
          message: "Failed to get or create today's session",
          details: error,
        },
      };
    }
  }

  async addExerciseLog(input: CreateExerciseLogInput): Promise<Result<ExerciseLog>> {
    try {
      const {data, error} = await supabase.from('exercise_logs').insert(input).select().single();

      if (error) {
        return {
          data: null,
          error: {message: error.message, code: error.code},
        };
      }

      return {data, error: null};
    } catch (error) {
      return {
        data: null,
        error: {
          message: 'Failed to add exercise log',
          details: error,
        },
      };
    }
  }

  async getSessionLogs(sessionId: string): Promise<Result<ExerciseLog[]>> {
    try {
      const {data, error} = await supabase
        .from('exercise_logs')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', {ascending: true});

      if (error) {
        return {
          data: null,
          error: {message: error.message, code: error.code},
        };
      }

      return {data: data || [], error: null};
    } catch (error) {
      return {
        data: null,
        error: {
          message: 'Failed to get session logs',
          details: error,
        },
      };
    }
  }

  async getUserSessions(limit = 20): Promise<Result<Session[]>> {
    try {
      const user = await supabase.auth.getUser();

      if (!user.data.user) {
        return {
          data: null,
          error: {message: 'User not authenticated'},
        };
      }

      const {data, error} = await supabase
        .from('sessions')
        .select('*')
        .eq('owner', user.data.user.id)
        .order('date', {ascending: false})
        .limit(limit);

      if (error) {
        return {
          data: null,
          error: {message: error.message, code: error.code},
        };
      }

      return {data: data || [], error: null};
    } catch (error) {
      return {
        data: null,
        error: {
          message: 'Failed to get user sessions',
          details: error,
        },
      };
    }
  }
}

export const sessionService = new SessionService();
