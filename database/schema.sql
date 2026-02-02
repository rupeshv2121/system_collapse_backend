-- ============================================
-- SYSTEM DRIFT DATABASE SCHEMA
-- ============================================
-- This file contains all SQL commands needed to set up the database
-- Run this in your Supabase SQL Editor (https://app.supabase.com)
-- Execute all commands in order

-- ============================================
-- PROFILES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  avatar_url TEXT,
  bio TEXT,
  
  -- Psychological Traits
  play_style TEXT,
  risk_tolerance NUMERIC DEFAULT 50,
  adaptability_score NUMERIC DEFAULT 50,
  patience_score NUMERIC DEFAULT 50,
  chaos_affinity NUMERIC DEFAULT 50,
  order_affinity NUMERIC DEFAULT 50,
  learning_rate NUMERIC DEFAULT 50,
  stress_response NUMERIC DEFAULT 50,
  psychological_archetype TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- GAME STATS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS game_stats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  session_id TEXT UNIQUE NOT NULL,
  
  -- Game Results
  final_score INTEGER NOT NULL,
  final_entropy INTEGER NOT NULL,
  final_sanity INTEGER NOT NULL,
  phase_reached INTEGER NOT NULL,
  won BOOLEAN NOT NULL,
  total_time INTEGER NOT NULL,
  collapse_count INTEGER DEFAULT 0,
  
  -- Behavior Metrics
  total_clicks INTEGER NOT NULL,
  average_click_speed NUMERIC NOT NULL,
  most_clicked_color TEXT NOT NULL,
  repetition_count INTEGER NOT NULL,
  variety_score NUMERIC NOT NULL,
  hesitation_score NUMERIC NOT NULL,
  impulsivity_score NUMERIC NOT NULL,
  pattern_adherence NUMERIC NOT NULL,
  dominant_behavior TEXT NOT NULL,
  
  -- Click Data
  click_sequence TEXT[] NOT NULL,
  
  -- Rule Following
  rules_followed INTEGER NOT NULL,
  rules_broken INTEGER NOT NULL,
  hints_ignored INTEGER NOT NULL,
  
  -- System Interaction
  hint_exposure_count INTEGER NOT NULL,
  misleading_hint_count INTEGER NOT NULL,
  trust_level NUMERIC NOT NULL,
  rebellion_count INTEGER NOT NULL,
  compliance_count INTEGER NOT NULL,
  manipulation_resistance NUMERIC NOT NULL,
  
  -- Timestamp
  played_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);

CREATE INDEX IF NOT EXISTS idx_game_stats_user_id ON game_stats(user_id);
CREATE INDEX IF NOT EXISTS idx_game_stats_session_id ON game_stats(session_id);
CREATE INDEX IF NOT EXISTS idx_game_stats_score ON game_stats(final_score DESC);
CREATE INDEX IF NOT EXISTS idx_game_stats_played_at ON game_stats(played_at DESC);
CREATE INDEX IF NOT EXISTS idx_game_stats_won ON game_stats(won);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_stats ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Game Stats Policies
DROP POLICY IF EXISTS "Users can view their own stats" ON game_stats;
CREATE POLICY "Users can view their own stats" ON game_stats
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own stats" ON game_stats;
CREATE POLICY "Users can insert their own stats" ON game_stats
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Public can view all stats for leaderboard" ON game_stats;
CREATE POLICY "Public can view all stats for leaderboard" ON game_stats
  FOR SELECT USING (true);

-- ============================================
-- DATABASE FUNCTIONS (OPTIONAL)
-- ============================================

-- Function to get best scores per user (optimized leaderboard)
CREATE OR REPLACE FUNCTION get_best_scores_per_user(result_limit INTEGER DEFAULT 100)
RETURNS TABLE (
  user_id UUID,
  username TEXT,
  final_score INTEGER,
  final_entropy INTEGER,
  phase_reached INTEGER,
  won BOOLEAN,
  played_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  WITH ranked_scores AS (
    SELECT 
      gs.user_id,
      p.username,
      gs.final_score,
      gs.final_entropy,
      gs.phase_reached,
      gs.won,
      gs.played_at,
      ROW_NUMBER() OVER (PARTITION BY gs.user_id ORDER BY gs.final_score DESC) as rn
    FROM game_stats gs
    JOIN profiles p ON gs.user_id = p.id
  )
  SELECT 
    rs.user_id,
    rs.username,
    rs.final_score,
    rs.final_entropy,
    rs.phase_reached,
    rs.won,
    rs.played_at
  FROM ranked_scores rs
  WHERE rs.rn = 1
  ORDER BY rs.final_score DESC
  LIMIT result_limit;
END;
$$ LANGUAGE plpgsql STABLE;

-- ============================================
-- TRIGGERS
-- ============================================

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, username, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(
      NEW.raw_user_meta_data->>'username',
      split_part(NEW.email, '@', 1)
    ),
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_profiles_modtime ON profiles;
CREATE TRIGGER update_profiles_modtime
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_modified_column();

