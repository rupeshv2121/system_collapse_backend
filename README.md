# System Collapse Backend

Backend API for the System Collapse game built with Node.js, Express, and Supabase.

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env` and fill in your Supabase credentials:

```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### 3. Supabase Database Setup

Run these SQL commands in your Supabase SQL editor:

```sql
-- Create profiles table
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create game_stats table
CREATE TABLE game_stats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  final_score INTEGER NOT NULL,
  final_entropy INTEGER NOT NULL,
  final_sanity INTEGER NOT NULL,
  phase_reached INTEGER NOT NULL,
  won BOOLEAN NOT NULL,
  played_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_stats ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Game stats policies
CREATE POLICY "Users can view their own game stats" ON game_stats
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own game stats" ON game_stats
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Public read for leaderboard
CREATE POLICY "Anyone can view leaderboard" ON game_stats
  FOR SELECT USING (true);

-- Create indexes
CREATE INDEX idx_game_stats_user_id ON game_stats(user_id);
CREATE INDEX idx_game_stats_score ON game_stats(final_score DESC);
CREATE INDEX idx_game_stats_played_at ON game_stats(played_at DESC);
```

### 4. Run the Server

Development mode:
```bash
npm run dev
```

Production mode:
```bash
npm run build
npm start
```

## API Endpoints

### Profile
- `GET /api/profile` - Get user profile (authenticated)
- `PUT /api/profile` - Update user profile (authenticated)

### Game Stats
- `POST /api/stats` - Save game stats (authenticated)
- `GET /api/stats/history` - Get user's game history (authenticated)
- `GET /api/stats/aggregate` - Get user's aggregate stats (authenticated)

### Leaderboard
- `GET /api/leaderboard/global` - Get global leaderboard
- `GET /api/leaderboard/top-winners` - Get top players by wins

## Authentication

All authenticated endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer <supabase_access_token>
```
