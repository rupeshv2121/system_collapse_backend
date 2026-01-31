-- System Collapse Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Player Profile
  play_style TEXT DEFAULT 'The Adaptive',
  risk_tolerance INTEGER DEFAULT 50,
  adaptability_score INTEGER DEFAULT 50,
  patience_score INTEGER DEFAULT 50,
  chaos_affinity INTEGER DEFAULT 50,
  order_affinity INTEGER DEFAULT 50,
  learning_rate INTEGER DEFAULT 50,
  stress_response TEXT DEFAULT 'strategic',
  psychological_archetype TEXT DEFAULT 'intuitive-player'
);

-- Create game_stats table with comprehensive tracking
CREATE TABLE IF NOT EXISTS game_stats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL,
  
  -- Game Results
  final_score INTEGER NOT NULL,
  final_entropy INTEGER NOT NULL,
  final_sanity INTEGER NOT NULL,
  phase_reached INTEGER NOT NULL,
  won BOOLEAN NOT NULL,
  duration INTEGER NOT NULL, -- seconds
  
  -- Behavior Tracking
  total_clicks INTEGER DEFAULT 0,
  average_click_speed NUMERIC DEFAULT 0,
  most_clicked_color TEXT,
  repetition_count INTEGER DEFAULT 0,
  variety_score INTEGER DEFAULT 50,
  hesitation_score INTEGER DEFAULT 50,
  impulsivity_score INTEGER DEFAULT 50,
  pattern_adherence INTEGER DEFAULT 50,
  
  -- Session Specifics
  dominant_behavior TEXT,
  click_sequence JSONB,
  rules_followed INTEGER DEFAULT 0,
  rules_broken INTEGER DEFAULT 0,
  hints_ignored INTEGER DEFAULT 0,
  
  -- System Interaction
  hint_exposure_count INTEGER DEFAULT 0,
  misleading_hint_count INTEGER DEFAULT 0,
  trust_level INTEGER DEFAULT 50,
  rebellion_count INTEGER DEFAULT 0,
  compliance_count INTEGER DEFAULT 0,
  manipulation_resistance INTEGER DEFAULT 50,
  
  -- Metadata
  played_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_stats ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view their own game stats" ON game_stats;
DROP POLICY IF EXISTS "Users can insert their own game stats" ON game_stats;
DROP POLICY IF EXISTS "Anyone can view leaderboard" ON game_stats;

-- Profiles policies
CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Game stats policies
CREATE POLICY "Users can view their own game stats" ON game_stats
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own game stats" ON game_stats
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Public read for leaderboard (everyone can see scores)
CREATE POLICY "Anyone can view leaderboard" ON game_stats
  FOR SELECT USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_game_stats_user_id ON game_stats(user_id);
CREATE INDEX IF NOT EXISTS idx_game_stats_score ON game_stats(final_score DESC);
CREATE INDEX IF NOT EXISTS idx_game_stats_played_at ON game_stats(played_at DESC);
CREATE INDEX IF NOT EXISTS idx_game_stats_session_id ON game_stats(session_id);
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);
CREATE INDEX IF NOT EXISTS idx_game_stats_dominant_behavior ON game_stats(dominant_behavior);
CREATE INDEX IF NOT EXISTS idx_game_stats_won ON game_stats(won);

-- Create user_analytics table for aggregated data
CREATE TABLE IF NOT EXISTS user_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  
  -- Win/Loss Stats
  total_games INTEGER DEFAULT 0,
  total_wins INTEGER DEFAULT 0,
  total_losses INTEGER DEFAULT 0,
  current_win_streak INTEGER DEFAULT 0,
  current_loss_streak INTEGER DEFAULT 0,
  longest_win_streak INTEGER DEFAULT 0,
  longest_loss_streak INTEGER DEFAULT 0,
  collapse_count INTEGER DEFAULT 0,
  
  -- Score Stats
  average_score NUMERIC DEFAULT 0,
  highest_score INTEGER DEFAULT 0,
  lowest_score INTEGER DEFAULT 0,
  
  -- Trend Data
  entropy_history JSONB DEFAULT '[]',
  sanity_history JSONB DEFAULT '[]',
  score_history JSONB DEFAULT '[]',
  phase_reach_counts JSONB DEFAULT '{"1":0,"2":0,"3":0,"4":0,"5":0}',
  average_session_duration NUMERIC DEFAULT 0,
  performance_trend TEXT DEFAULT 'stable',
  
  -- Advanced Analytics
  entropy_resistance INTEGER DEFAULT 50,
  sanity_management INTEGER DEFAULT 50,
  phase_transition_success INTEGER DEFAULT 50,
  color_bias JSONB DEFAULT '{"red":25,"blue":25,"green":25,"yellow":25}',
  decision_fatigue INTEGER DEFAULT 0,
  recovery_ability INTEGER DEFAULT 50,
  
  -- Metadata
  last_calculated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on user_analytics
ALTER TABLE user_analytics ENABLE ROW LEVEL SECURITY;

-- Analytics policies
DROP POLICY IF EXISTS "Users can view their own analytics" ON user_analytics;
DROP POLICY IF EXISTS "Users can update their own analytics" ON user_analytics;

CREATE POLICY "Users can view their own analytics" ON user_analytics
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own analytics" ON user_analytics
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own analytics" ON user_analytics
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create index on user_analytics
CREATE INDEX IF NOT EXISTS idx_user_analytics_user_id ON user_analytics(user_id);

-- Create a function to handle user profile creation on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, username, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    NOW(),
    NOW()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for automatic profile creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
