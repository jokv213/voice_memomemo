-- Create profiles table
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('individual', 'trainer')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Create trainer_clients table
CREATE TABLE trainer_clients (
  trainer_id UUID NOT NULL REFERENCES profiles(id),
  client_id UUID NOT NULL REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (trainer_id, client_id)
);

-- Enable RLS on trainer_clients
ALTER TABLE trainer_clients ENABLE ROW LEVEL SECURITY;

-- Trainer_clients policies
CREATE POLICY "Trainers can view their clients" ON trainer_clients
  FOR SELECT USING (auth.uid() = trainer_id);

CREATE POLICY "Clients can view their trainers" ON trainer_clients
  FOR SELECT USING (auth.uid() = client_id);

CREATE POLICY "Trainers can add clients" ON trainer_clients
  FOR INSERT WITH CHECK (auth.uid() = trainer_id);

CREATE POLICY "Trainers can remove clients" ON trainer_clients
  FOR DELETE USING (auth.uid() = trainer_id);

-- Create sessions table
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner UUID NOT NULL REFERENCES profiles(id),
  date TIMESTAMPTZ NOT NULL,
  title TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on sessions
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

-- Sessions policies
CREATE POLICY "Users can view own sessions" ON sessions
  FOR SELECT USING (auth.uid() = owner);

CREATE POLICY "Trainers can view client sessions" ON sessions
  FOR SELECT USING (
    auth.uid() IN (
      SELECT trainer_id FROM trainer_clients WHERE client_id = owner
    )
  );

CREATE POLICY "Users can insert own sessions" ON sessions
  FOR INSERT WITH CHECK (auth.uid() = owner);

CREATE POLICY "Users can update own sessions" ON sessions
  FOR UPDATE USING (auth.uid() = owner);

CREATE POLICY "Users can delete own sessions" ON sessions
  FOR DELETE USING (auth.uid() = owner);

-- Create exercise_logs table
CREATE TABLE exercise_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  exercise TEXT NOT NULL,
  weight NUMERIC,
  side TEXT,
  reps INTEGER,
  sets INTEGER,
  memo TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on exercise_logs
ALTER TABLE exercise_logs ENABLE ROW LEVEL SECURITY;

-- Exercise_logs policies
CREATE POLICY "Users can view own exercise logs" ON exercise_logs
  FOR SELECT USING (
    auth.uid() IN (
      SELECT owner FROM sessions WHERE id = session_id
    )
  );

CREATE POLICY "Trainers can view client exercise logs" ON exercise_logs
  FOR SELECT USING (
    auth.uid() IN (
      SELECT trainer_id FROM trainer_clients 
      WHERE client_id IN (
        SELECT owner FROM sessions WHERE id = session_id
      )
    )
  );

CREATE POLICY "Users can insert own exercise logs" ON exercise_logs
  FOR INSERT WITH CHECK (
    auth.uid() IN (
      SELECT owner FROM sessions WHERE id = session_id
    )
  );

CREATE POLICY "Users can update own exercise logs" ON exercise_logs
  FOR UPDATE USING (
    auth.uid() IN (
      SELECT owner FROM sessions WHERE id = session_id
    )
  );

CREATE POLICY "Users can delete own exercise logs" ON exercise_logs
  FOR DELETE USING (
    auth.uid() IN (
      SELECT owner FROM sessions WHERE id = session_id
    )
  );

-- Create function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'individual')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Create indexes for better performance
CREATE INDEX idx_sessions_owner_date ON sessions(owner, date DESC);
CREATE INDEX idx_exercise_logs_session_id ON exercise_logs(session_id);
CREATE INDEX idx_exercise_logs_exercise ON exercise_logs(exercise);
CREATE INDEX idx_trainer_clients_trainer_id ON trainer_clients(trainer_id);
CREATE INDEX idx_trainer_clients_client_id ON trainer_clients(client_id);