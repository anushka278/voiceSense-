-- Sage App Database Schema for Supabase
-- Run this SQL in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  preferred_name TEXT NOT NULL,
  cognitive_profile JSONB DEFAULT '{}'::jsonb,
  family_members JSONB DEFAULT '[]'::jsonb,
  is_onboarded BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Talk sessions table
CREATE TABLE IF NOT EXISTS talk_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  timestamp TIMESTAMPTZ NOT NULL,
  messages JSONB NOT NULL DEFAULT '[]'::jsonb,
  transcript TEXT NOT NULL,
  cli_score NUMERIC,
  cli_breakdown JSONB,
  status TEXT NOT NULL DEFAULT 'active',
  duration NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Health cards table
CREATE TABLE IF NOT EXISTS health_cards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  session_id UUID REFERENCES talk_sessions(id) ON DELETE SET NULL,
  date TIMESTAMPTZ NOT NULL,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  severity TEXT NOT NULL,
  confidence TEXT NOT NULL,
  confirmed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Speech analyses table
CREATE TABLE IF NOT EXISTS speech_analyses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  timestamp TIMESTAMPTZ NOT NULL,
  transcript TEXT NOT NULL,
  word_count INTEGER NOT NULL,
  avg_word_length NUMERIC NOT NULL,
  sentence_count INTEGER NOT NULL,
  avg_sentence_length NUMERIC NOT NULL,
  emotional_state TEXT NOT NULL,
  language_complexity NUMERIC NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Game results table
CREATE TABLE IF NOT EXISTS game_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  timestamp TIMESTAMPTZ NOT NULL,
  game_type TEXT NOT NULL,
  score INTEGER NOT NULL,
  time_taken NUMERIC NOT NULL,
  accuracy NUMERIC NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insights table
CREATE TABLE IF NOT EXISTS insights (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  timestamp TIMESTAMPTZ NOT NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Family requests table
CREATE TABLE IF NOT EXISTS family_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  from_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  from_name TEXT NOT NULL,
  to_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  to_name TEXT NOT NULL,
  relationship TEXT NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Memory sessions table (for biography capture and speak sessions)
CREATE TABLE IF NOT EXISTS memory_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  chapter TEXT NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL,
  transcript TEXT NOT NULL,
  questions JSONB NOT NULL DEFAULT '[]'::jsonb,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_talk_sessions_user_id ON talk_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_talk_sessions_timestamp ON talk_sessions(timestamp);
CREATE INDEX IF NOT EXISTS idx_health_cards_user_id ON health_cards(user_id);
CREATE INDEX IF NOT EXISTS idx_speech_analyses_user_id ON speech_analyses(user_id);
CREATE INDEX IF NOT EXISTS idx_game_results_user_id ON game_results(user_id);
CREATE INDEX IF NOT EXISTS idx_insights_user_id ON insights(user_id);
CREATE INDEX IF NOT EXISTS idx_family_requests_from_user_id ON family_requests(from_user_id);
CREATE INDEX IF NOT EXISTS idx_family_requests_to_user_id ON family_requests(to_user_id);
CREATE INDEX IF NOT EXISTS idx_family_requests_status ON family_requests(status);
CREATE INDEX IF NOT EXISTS idx_memory_sessions_user_id ON memory_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_memory_sessions_timestamp ON memory_sessions(timestamp);
CREATE INDEX IF NOT EXISTS idx_memory_sessions_chapter ON memory_sessions(chapter);

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE talk_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE speech_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE memory_sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access their own data
-- Note: Since we're using username/password auth (not Supabase Auth),
-- we'll need to handle security in the application layer
-- For now, we'll allow all operations but you should add proper RLS policies

-- Policy: Users can read their own data
CREATE POLICY "Users can read own data" ON users
  FOR SELECT USING (true);

CREATE POLICY "Users can update own data" ON users
  FOR UPDATE USING (true);

CREATE POLICY "Users can insert own data" ON users
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can delete own data" ON users
  FOR DELETE USING (true);

-- Policy: Users can manage their own talk sessions
CREATE POLICY "Users can manage own talk sessions" ON talk_sessions
  FOR ALL USING (true);

-- Policy: Users can manage their own health cards
CREATE POLICY "Users can manage own health cards" ON health_cards
  FOR ALL USING (true);

-- Policy: Users can manage their own speech analyses
CREATE POLICY "Users can manage own speech analyses" ON speech_analyses
  FOR ALL USING (true);

-- Policy: Users can manage their own game results
CREATE POLICY "Users can manage own game results" ON game_results
  FOR ALL USING (true);

-- Policy: Users can manage their own insights
CREATE POLICY "Users can manage own insights" ON insights
  FOR ALL USING (true);

-- Policy: Users can manage family requests (both sent and received)
CREATE POLICY "Users can manage family requests" ON family_requests
  FOR ALL USING (true);

-- Policy: Users can manage their own memory sessions
CREATE POLICY "Users can manage own memory sessions" ON memory_sessions
  FOR ALL USING (true);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
