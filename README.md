# System Collapse Backend - (Documentation)

## Table of Contents

- [Overview](#overview)
- [Technology Stack](#technology-stack)
- [Project Architecture](#project-architecture)
- [Installation & Setup](#installation--setup)
- [Environment Configuration](#environment-configuration)
- [Database Schema](#database-schema)
- [API Endpoints Reference](#api-endpoints-reference)
- [Authentication & Security](#authentication--security)
- [Data Models & Types](#data-models--types)
- [Repository Pattern](#repository-pattern)
- [Middleware](#middleware)
- [Services](#services)
- [Error Handling](#error-handling)
- [Development Workflow](#development-workflow)
- [Deployment Guide](#deployment-guide)
- [Testing & Debugging](#testing--debugging)
- [Performance Optimization](#performance-optimization)
- [Common Issues & Solutions](#common-issues--solutions)

---

## Overview

The System Collapse Backend is a RESTful API server built with Node.js and Express.js that powers the System Collapse psychological game. It handles user authentication, profile management, game statistics tracking, leaderboard rankings, and email notifications.

### Key Features

- **User Authentication**: JWT-based authentication via Supabase Auth
- **Profile Management**: User profiles with psychological traits tracking
- **Game Statistics**: Comprehensive tracking of gameplay metrics and behavior
- **Leaderboard System**: Global and period-based rankings
- **Email Notifications**: Share game statistics via email
- **PostgreSQL Database**: Powered by Supabase with Row Level Security (RLS)
- **TypeScript**: Full type safety across the codebase
- **CORS Support**: Configured for frontend integration

---

## Technology Stack

### Core Technologies

| Technology | Version | Purpose |
|------------|---------|---------|
| Node.js | 18+ | Runtime environment |
| TypeScript | 5.7+ | Type-safe development |
| Express.js | 4.21+ | Web framework |
| Supabase | 2.45+ | Database & Authentication |
| PostgreSQL | 15+ | Database (via Supabase) |

---

## Project Architecture

### Directory Structure

```
system_collapse_backend/
├── src/
│   ├── config/              # Configuration files
│   │   └── supabase.ts      # Supabase client initialization
│   ├── middleware/          # Express middleware
│   │   └── auth.ts          # Authentication middleware
│   ├── models/              # Data models & repositories
│   │   ├── index.ts         # Model exports
│   │   ├── types.ts         # TypeScript interfaces
│   │   ├── ProfileRepository.ts
│   │   ├── GameStatsRepository.ts
│   │   └── LeaderboardRepository.ts
│   ├── routes/              # API route handlers
│   │   ├── profile.ts       # Profile endpoints
│   │   ├── gameStats.ts     # Game statistics endpoints
│   │   ├── leaderboard.ts   # Leaderboard endpoints
│   │   └── email.ts         # Email endpoints
│   ├── services/            # Business logic services
│   │   └── emailService.ts  # Email sending service
│   └── index.ts             # Application entry point
├── dist/                    # Compiled JavaScript (generated)
├── node_modules/            # Dependencies (generated)
├── .env                     # Environment variables (gitignored)
├── .env.example             # Environment template
├── .gitignore              # Git ignore rules
├── package.json            # Project dependencies
├── tsconfig.json           # TypeScript configuration
├── README.md               # Quick start guide
└── EMAIL_SETUP.md          # Email configuration guide
```

### Architecture Pattern

The backend follows the **Repository Pattern** with a layered architecture:

```
┌─────────────────────────────────────────┐
│         Client (Frontend)               │
└─────────────────┬───────────────────────┘
                  │ HTTP/REST
┌─────────────────▼───────────────────────┐
│         Routes Layer                    │
│  (HTTP handlers, validation)            │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│      Middleware Layer                   │
│  (Auth, CORS, Error handling)           │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│      Repository Layer                   │
│  (Data access, business logic)          │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│         Services Layer                  │
│  (External services: Email, etc)        │
└─────────────────────────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│      Database (Supabase/PostgreSQL)     │
└─────────────────────────────────────────┘
```

---

## Installation & Setup

### Prerequisites

- **Node.js** 18.x or higher
- **npm** or **yarn**
- **Supabase Account** (free tier available)
- **Gmail Account** (for email features, optional)

### Step 1: Clone the Repository

```bash
git clone <repository-url>
cd system_collapse_backend
```

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Environment Configuration

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Edit `.env` with your credentials:

```env
# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Server Configuration
PORT=3000
FRONTEND_URL=http://localhost:5173

# Email Configuration (Optional)
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
```

### Step 4: Database Setup

Run the SQL commands in your Supabase SQL editor (see [Database Schema](#database-schema) section).

### Step 5: Start the Server

**Development mode** (with auto-reload):
```bash
npm run dev
```

**Production mode**:
```bash
npm run build
npm start
```

The server will start on `http://localhost:3000`

---

## Database Schema

### Overview

The database consists of 3 main tables:
- **profiles**: User profile and psychological traits
- **game_stats**: Detailed game session statistics
- **auth.users**: Supabase authentication (built-in)

### Complete SQL Setup

Run this SQL in your Supabase SQL Editor:

```sql
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
```

### Database Relationships

```
auth.users (Supabase Auth)
    │
    │ 1:1
    ▼
profiles (User Info)
    │
    │ 1:N
    ▼
game_stats (Game Sessions)
```

---

## API Endpoints Reference

### Base URL

```
http://localhost:3000/api
```

### Authentication Header

All protected endpoints require:
```http
Authorization: Bearer <supabase_jwt_token>
```

---

### Profile Endpoints

#### **GET** `/api/profile`
Get current user's profile

**Headers:**
```http
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "username": "player123",
  "avatar_url": null,
  "bio": null,
  "play_style": "The Adaptive",
  "risk_tolerance": 65,
  "adaptability_score": 72,
  "patience_score": 58,
  "chaos_affinity": 45,
  "order_affinity": 55,
  "learning_rate": 68,
  "stress_response": 52,
  "psychological_archetype": "intuitive-player",
  "created_at": "2026-01-15T10:00:00Z",
  "updated_at": "2026-01-20T14:30:00Z"
}
```

---

#### **GET** `/api/profile/:userId`
Get specific user's profile

**Headers:**
```http
Authorization: Bearer <token>
```

**Parameters:**
- `userId` (path) - User UUID

**Response (200):** Same as above

**Response (403):**
```json
{
  "error": "Unauthorized access"
}
```

---

#### **POST** `/api/profile`
Create or update user profile (upsert)

**Headers:**
```http
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "username": "newusername",
  "play_style": "The Rebel",
  "risk_tolerance": 80,
  "adaptability_score": 65,
  "patience_score": 40,
  "chaos_affinity": 85,
  "order_affinity": 15,
  "learning_rate": 70,
  "stress_response": 60,
  "psychological_archetype": "system-challenger"
}
```

**Response (200):** Profile object

---

#### **PUT** `/api/profile`
Update user profile

**Headers:**
```http
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "username": "updatedname",
  "bio": "New bio",
  "avatar_url": "https://example.com/avatar.jpg"
}
```

**Response (200):** Updated profile object

---

### Game Stats Endpoints

#### **POST** `/api/stats`
Save game session statistics

**Headers:**
```http
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "session_id": "unique-session-uuid",
  "final_score": 850,
  "final_entropy": 75,
  "final_sanity": 30,
  "phase_reached": 4,
  "won": true,
  "total_time": 180000,
  "collapse_count": 2,
  "total_clicks": 45,
  "average_click_speed": 1.2,
  "most_clicked_color": "red",
  "repetition_count": 8,
  "variety_score": 65,
  "hesitation_score": 40,
  "impulsivity_score": 70,
  "pattern_adherence": 55,
  "dominant_behavior": "adaptive",
  "click_sequence": ["red", "blue", "green", "yellow"],
  "rules_followed": 10,
  "rules_broken": 3,
  "hints_ignored": 2,
  "hint_exposure_count": 5,
  "misleading_hint_count": 1,
  "trust_level": 60,
  "rebellion_count": 3,
  "compliance_count": 7,
  "manipulation_resistance": 55
}
```

**Response (201):**
```json
{
  "id": "stat-uuid",
  "user_id": "user-uuid",
  "session_id": "unique-session-uuid",
  ...
  "played_at": "2026-02-01T10:30:00Z"
}
```

**Notes:**
- If session_id already exists, returns existing stats (200)
- Prevents duplicate session submissions

---

#### **GET** `/api/stats/history`
Get user's game history

**Headers:**
```http
Authorization: Bearer <token>
```

**Query Parameters:**
- None (returns last 50 sessions)

**Response (200):**
```json
[
  {
    "id": "uuid",
    "session_id": "session-uuid",
    "final_score": 850,
    "won": true,
    "played_at": "2026-02-01T10:30:00Z",
    ...
  },
  ...
]
```

---

#### **GET** `/api/stats/aggregate`
Get user's aggregate statistics

**Headers:**
```http
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "totalGames": 25,
  "gamesWon": 15,
  "gamesLost": 10,
  "averageScore": 625.5,
  "averageEntropy": 68.2,
  "highestScore": 950
}
```

---

#### **GET** `/api/stats/:userId`
Get specific user's game stats

**Headers:**
```http
Authorization: Bearer <token>
```

**Parameters:**
- `userId` (path) - User UUID

**Response (200):** Array of game stats (last 50)

**Response (403):**
```json
{
  "error": "Unauthorized access"
}
```

---

### Leaderboard Endpoints

#### **GET** `/api/leaderboard/global`
Get global leaderboard (best scores)

**Query Parameters:**
- `limit` (optional) - Number of results (default: 100)

**Response (200):**
```json
[
  {
    "username": "player1",
    "score": 1200,
    "entropy": 85,
    "phase": 5,
    "won": true,
    "playedAt": "2026-02-01T10:30:00Z"
  },
  {
    "username": "player2",
    "score": 1150,
    "entropy": 80,
    "phase": 5,
    "won": true,
    "playedAt": "2026-01-31T15:20:00Z"
  }
]
```

---

#### **GET** `/api/leaderboard/top-winners`
Get players with most wins

**Query Parameters:**
- `limit` (optional) - Number of results (default: 20)

**Response (200):**
```json
[
  {
    "username": "champion",
    "wins": 45
  },
  {
    "username": "runner_up",
    "wins": 38
  }
]
```

---

### Email Endpoints

#### **POST** `/api/email/share-profile`
Send profile statistics via email

**Headers:**
```http
Content-Type: application/json
```

**Request Body:**
```json
{
  "to": "friend@example.com",
  "subject": "Check out my System Collapse stats!",
  "content": "My stats:\nTotal Games: 25\nWins: 15\nHighest Score: 950"
}
```

**Response (200):**
```json
{
  "message": "Email sent successfully",
  "success": true
}
```

**Response (400):**
```json
{
  "errors": [
    {
      "msg": "Valid email address is required",
      "param": "to"
    }
  ]
}
```

**Response (500):**
```json
{
  "error": "Failed to send email",
  "message": "Connection refused"
}
```

---

## Authentication & Security

### Authentication Flow

1. **User Sign Up/Login** (Frontend → Supabase Auth)
   ```javascript
   const { data, error } = await supabase.auth.signUp({
     email,
     password
   })
   ```

2. **Get JWT Token** (Frontend)
   ```javascript
   const { data: { session } } = await supabase.auth.getSession()
   const token = session.access_token
   ```

3. **Send Requests** (Frontend → Backend)
   ```javascript
   fetch('http://localhost:3000/api/profile', {
     headers: {
       'Authorization': `Bearer ${token}`
     }
   })
   ```

4. **Token Verification** (Backend Middleware)
   ```typescript
   // Verify token with Supabase
   const { data: { user } } = await supabase.auth.getUser(token)
   ```

### Security Features

#### Row Level Security (RLS)

- Users can only access their own data
- Leaderboard data is publicly readable
- Admin operations require service role key

#### Environment Variables

- Sensitive keys stored in `.env` (gitignored)
- Service role key never exposed to frontend
- JWT tokens expire after session timeout

#### SQL Injection Protection

- Supabase client uses parameterized queries
- No raw SQL string concatenation

---

## Data Models & Types

### Core Types

All types are defined in `src/models/types.ts`:

#### Profile Interface

```typescript
interface Profile {
  id: string;                          // UUID from auth.users
  email: string;                       // User email
  username?: string;                   // Display name
  avatar_url?: string;                 // Profile picture URL
  bio?: string;                        // User bio
  
  // Psychological Traits (0-100)
  play_style?: string;                 // Playing style classification
  risk_tolerance?: number;             // Risk-taking tendency
  adaptability_score?: number;         // Adaptation ability
  patience_score?: number;             // Patience level
  chaos_affinity?: number;             // Attraction to chaos
  order_affinity?: number;             // Preference for order
  learning_rate?: number;              // Learning speed
  stress_response?: number;            // Stress handling
  psychological_archetype?: string;    // Archetype classification
  
  created_at?: string;                 // Account creation
  updated_at?: string;                 // Last update
}
```

#### GameStats Interface

```typescript
interface GameStats {
  id?: string;                         // UUID
  user_id: string;                     // User reference
  session_id: string;                  // Unique session ID
  
  // Game Results
  final_score: number;                 // Points earned
  final_entropy: number;               // Chaos level (0-100)
  final_sanity: number;                // Sanity remaining (0-100)
  phase_reached: number;               // Highest phase (1-5)
  won: boolean;                        // Victory status
  total_time: number;                  // Duration (milliseconds)
  collapse_count: number;              // Times collapsed
  
  // Behavior Metrics
  total_clicks: number;                // Total clicks made
  average_click_speed: number;         // Clicks per second
  most_clicked_color: string;          // Dominant color
  repetition_count: number;            // Repeated patterns
  variety_score: number;               // Click diversity (0-100)
  hesitation_score: number;            // Decision delay (0-100)
  impulsivity_score: number;           // Quick decisions (0-100)
  pattern_adherence: number;           // Rule following (0-100)
  dominant_behavior: string;           // Behavior classification
  
  // Click Data
  click_sequence: string[];            // Color sequence
  
  // Rule Following
  rules_followed: number;              // Correct follows
  rules_broken: number;                // Rule violations
  hints_ignored: number;               // Ignored hints
  
  // System Interaction
  hint_exposure_count: number;         // Hints shown
  misleading_hint_count: number;       // False hints
  trust_level: number;                 // System trust (0-100)
  rebellion_count: number;             // Rebellious actions
  compliance_count: number;            // Compliant actions
  manipulation_resistance: number;     // Manipulation defense (0-100)
  
  played_at?: string;                  // Session timestamp
}
```

#### LeaderboardEntry Interface

```typescript
interface LeaderboardEntry {
  username: string;                    // Player name
  score: number;                       // Best score
  entropy: number;                     // Entropy at best
  phase: number;                       // Phase reached
  won: boolean;                        // Victory status
  playedAt: string;                    // Timestamp
}
```

#### TopWinner Interface

```typescript
interface TopWinner {
  username: string;                    // Player name
  wins: number;                        // Total wins
}
```

---

## Repository Pattern

### What is the Repository Pattern?

The Repository Pattern abstracts data access logic, providing a clean interface between business logic and database operations.

### Benefits

- **Separation of Concerns**: Database logic isolated from routes
- **Testability**: Easy to mock for unit tests
- **Maintainability**: Changes to database structure localized
- **Reusability**: Repositories used across multiple routes

### Repository Structure

#### ProfileRepository

**Location:** `src/models/ProfileRepository.ts`

**Methods:**

```typescript
class ProfileRepository {
  // Find profile by user ID
  async findById(userId: string): Promise<Profile | null>
  
  // Create or update profile
  async upsert(profileData: CreateProfileInput): Promise<Profile>
  
  // Update existing profile
  async update(userId: string, updates: UpdateProfileInput): Promise<Profile>
  
  // Delete profile
  async delete(userId: string): Promise<void>
  
  // Check if profile exists
  async exists(userId: string): Promise<boolean>
}
```

**Example Usage:**

```typescript
import { profileRepository } from './models'

// Get profile
const profile = await profileRepository.findById(userId)

// Update profile
const updated = await profileRepository.update(userId, {
  username: 'newname',
  bio: 'Updated bio'
})
```

---

#### GameStatsRepository

**Location:** `src/models/GameStatsRepository.ts`

**Methods:**

```typescript
class GameStatsRepository {
  // Create new game stats
  async create(statsData: CreateGameStatsInput): Promise<GameStats>
  
  // Get all stats for user
  async findByUserId(userId: string, limit: number): Promise<GameStats[]>
  
  // Get stats by session ID
  async findBySessionId(sessionId: string): Promise<GameStats | null>
  
  // Get aggregate statistics
  async getAggregateStats(userId: string): Promise<AggregateStats>
}
```

**Example Usage:**

```typescript
import { gameStatsRepository } from './models'

// Save new session
const stats = await gameStatsRepository.create({
  user_id: userId,
  session_id: 'uuid',
  final_score: 850,
  // ... other fields
})

// Get user history
const history = await gameStatsRepository.findByUserId(userId, 50)

// Get aggregate stats
const aggregate = await gameStatsRepository.getAggregateStats(userId)
// Returns: { totalGames, gamesWon, gamesLost, averageScore, ... }
```

---

#### LeaderboardRepository

**Location:** `src/models/LeaderboardRepository.ts`

**Methods:**

```typescript
class LeaderboardRepository {
  // Get global leaderboard (best scores)
  async getGlobalLeaderboard(limit: number): Promise<LeaderboardEntry[]>
  
  // Get top players by wins
  async getTopWinners(limit: number): Promise<TopWinner[]>
  
  // Get leaderboard by time period
  async getLeaderboardByPeriod(
    period: 'day' | 'week' | 'month' | 'all',
    limit: number
  ): Promise<LeaderboardEntry[]>
}
```

**Example Usage:**

```typescript
import { leaderboardRepository } from './models'

// Get top 100 scores
const leaderboard = await leaderboardRepository.getGlobalLeaderboard(100)

// Get top 20 winners
const winners = await leaderboardRepository.getTopWinners(20)

// Get weekly leaderboard
const weekly = await leaderboardRepository.getLeaderboardByPeriod('week', 50)
```

---

## Middleware

### Authentication Middleware

**Location:** `src/middleware/auth.ts`

**Purpose:** Verify JWT tokens and extract user information

**Implementation:**

```typescript
export interface AuthRequest extends Request {
  user?: {
    id: string;
    email?: string;
  };
}

export const authenticateUser = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    // Extract Bearer token
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        error: 'Missing or invalid authorization header' 
      });
    }

    const token = authHeader.substring(7);

    // Verify with Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    // Attach user to request
    req.user = { id: user.id, email: user.email };
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
};
```

**Usage in Routes:**

```typescript
import { authenticateUser, AuthRequest } from '../middleware/auth'

router.get('/protected', authenticateUser, async (req: AuthRequest, res) => {
  const userId = req.user!.id  // User is guaranteed to exist
  // ... handle request
})
```

---

### CORS Middleware

**Purpose:** Allow cross-origin requests from frontend

**Configuration:**

```typescript
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}))
```

---

### JSON Body Parser

**Purpose:** Parse JSON request bodies

```typescript
app.use(express.json())
```

---

### Error Handling Middleware

**Purpose:** Catch and handle all errors

```typescript
app.use((err: Error, req: Request, res: Response, next: any) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});
```

---

## Services

### Email Service

**Location:** `src/services/emailService.ts`

**Purpose:** Send emails via Gmail SMTP

**Configuration:**

```typescript
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD  // App password
  }
})
```

**Function:**

```typescript
export async function sendProfileEmail(
  to: string,
  subject: string,
  content: string
): Promise<void>
```

**Usage:**

```typescript
import { sendProfileEmail } from '../services/emailService'

await sendProfileEmail(
  'user@example.com',
  'Game Statistics',
  'Your stats:\nScore: 850\nWins: 15'
)
```

---

## Error Handling

### Error Response Format

All error responses follow this structure:

```json
{
  "error": "Error message description"
}
```

Or with validation errors:

```json
{
  "errors": [
    {
      "msg": "Error description",
      "param": "field_name"
    }
  ]
}
```

### HTTP Status Codes

| Code | Meaning | When Used |
|------|---------|-----------|
| 200 | OK | Successful GET/PUT requests |
| 201 | Created | Successful POST (resource created) |
| 400 | Bad Request | Invalid input/validation errors |
| 401 | Unauthorized | Missing or invalid auth token |
| 403 | Forbidden | Access denied (not your resource) |
| 404 | Not Found | Resource doesn't exist |
| 500 | Internal Server Error | Unexpected server errors |

---

## Development Workflow

### Development Commands

```bash
# Install dependencies
npm install

# Start development server (auto-reload)
npm run dev

# Build TypeScript to JavaScript
npm run build

# Start production server
npm start

# Check TypeScript types
npx tsc --noEmit
```

**Key Tools**:
- **Nodemon**: Auto-restarts server on file changes during development
- **TypeScript**: Compiles to JavaScript for production (see `tsconfig.json`)
- **ts-node**: Runs TypeScript directly in development mode

---

## Deployment Guide

### Production Build

```bash
# Build TypeScript to JavaScript
npm run build

# Output: dist/ folder with compiled .js files
```

### Deployment Platforms

#### Heroku

1. **Install Heroku CLI**:
   ```bash
   npm install -g heroku
   ```

2. **Create Heroku App**:
   ```bash
   heroku create system-collapse-api
   ```

3. **Set Environment Variables**:
   ```bash
   heroku config:set SUPABASE_URL=https://your-project.supabase.co
   heroku config:set SUPABASE_ANON_KEY=your-anon-key
   heroku config:set SUPABASE_SERVICE_ROLE_KEY=your-service-key
   heroku config:set FRONTEND_URL=https://your-frontend.vercel.app
   heroku config:set EMAIL_USER=your-email@gmail.com
   heroku config:set EMAIL_PASSWORD=your-app-password
   ```

4. **Deploy**:
   ```bash
   git push heroku main
   ```

5. **View Logs**:
   ```bash
   heroku logs --tail
   ```

#### Railway

1. **Create New Project** at [railway.app](https://railway.app)
2. **Connect GitHub Repository**
3. **Add Environment Variables** in Settings:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `FRONTEND_URL`
   - `EMAIL_USER`
   - `EMAIL_PASSWORD`
4. **Deploy**: Automatic on git push

#### Render

1. **Create Web Service** at [render.com](https://render.com)
2. **Build Command**: `npm install && npm run build`
3. **Start Command**: `npm start`
4. **Environment Variables**: Add in dashboard
5. **Deploy**: Automatic on git push

#### VPS (Ubuntu/Linux)

1. **Install Node.js**:
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```

2. **Clone Repository**:
   ```bash
   git clone <repo-url>
   cd system_collapse_backend
   npm install
   ```

3. **Create .env File**:
   ```bash
   nano .env
   # Add all environment variables
   ```

4. **Build**:
   ```bash
   npm run build
   ```

5. **Use PM2 for Process Management**:
   ```bash
   npm install -g pm2
   pm2 start dist/index.js --name system-collapse-api
   pm2 startup
   pm2 save
   ```

6. **Set Up Nginx Reverse Proxy**:
   ```nginx
   server {
       listen 80;
       server_name api.yourdomain.com;

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

7. **Enable HTTPS with Let's Encrypt**:
   ```bash
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d api.yourdomain.com
   ```

### Pre-Deployment Checklist

- [ ] All environment variables set correctly
- [ ] Supabase database schema deployed
- [ ] Frontend CORS origin configured
- [ ] Email service tested (if using)
- [ ] Build completes without errors: `npm run build`
- [ ] TypeScript compilation successful: `npx tsc --noEmit`
- [ ] Test API endpoints with production credentials
- [ ] Database RLS policies enabled
- [ ] Service role key secured (never exposed to frontend)
- [ ] HTTPS/SSL certificate configured
- [ ] Monitor server logs for errors

### Post-Deployment Testing

```bash
# Health check
curl https://your-api-domain.com/

# Test authenticated endpoint (replace with real token)
curl -H "Authorization: Bearer <token>" \
  https://your-api-domain.com/api/profile

# Test leaderboard
curl https://your-api-domain.com/api/leaderboard/global
```

### Monitoring & Logging

**Recommended Tools**:
- **Heroku**: Built-in logs via `heroku logs --tail`
- **Railway**: Dashboard logs
- **VPS**: PM2 logs via `pm2 logs`
- **Third-party**: Sentry, LogRocket, DataDog

**Health Monitoring**:
```typescript
// Add to index.ts
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  })
})
```

---

## Testing & Debugging

### Manual Testing

#### Health Check

```bash
curl http://localhost:3000/
# Expected: {"message": "System Collapse Backend API"}
```

#### Test Authentication

```bash
# Get token from frontend login
TOKEN="your-jwt-token"

# Test profile endpoint
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/api/profile
```

### Debug Logging

Enable detailed logging at key points:

```typescript
// Authentication
console.log('Token:', token)
console.log('User from token:', user)

// Database operations
console.log('Query result:', data)
console.log('Query error:', error)

// Request validation
console.log('Request body:', req.body)
console.log('Validation errors:', errors.array())
```

### Supabase Dashboard Debugging

1. Go to Supabase Dashboard
2. Navigate to **Table Editor** to view data
3. Use **SQL Editor** to run queries
4. Check **Logs** for database errors
5. Verify **API** settings

---

## Performance Optimization

### Database Optimization

#### Indexes

Already created for common queries:

```sql
CREATE INDEX idx_game_stats_user_id ON game_stats(user_id);
CREATE INDEX idx_game_stats_score ON game_stats(final_score DESC);
CREATE INDEX idx_game_stats_played_at ON game_stats(played_at DESC);
```

#### Query Optimization

Use database functions for complex queries:

```typescript
// Instead of fetching all data and processing
const leaderboard = await leaderboardRepository.getGlobalLeaderboard(100)

// Uses optimized RPC function:
await supabase.rpc('get_best_scores_per_user', { result_limit: 100 })
```

### API Optimization

#### Limit Result Sets

```typescript
// Don't fetch all records
const stats = await gameStatsRepository.findByUserId(userId, 50)  // Limit 50
```

### Caching (Future Enhancement)

Consider adding Redis for:
- Leaderboard caching (update every 5 minutes)
- User profile caching
- Aggregate statistics caching

---

## Common Issues & Solutions

### "Cannot connect to Supabase" Error

**Symptoms**: Database queries fail, authentication doesn't work

**Solutions**:
1. Verify `SUPABASE_URL` and `SUPABASE_ANON_KEY` in `.env`
2. Check Supabase dashboard for project status
3. Ensure network connectivity: `ping your-project.supabase.co`
4. Verify API keys haven't been regenerated
5. Check Supabase service status: [status.supabase.com](https://status.supabase.com)

### "Authentication failed" / 401 Errors

**Symptoms**: Protected endpoints return unauthorized

**Solutions**:
1. Check JWT token is valid (not expired)
2. Verify `Authorization: Bearer <token>` header format
3. Ensure token is from correct Supabase project
4. Check auth middleware is applied to route
5. Verify user exists in Supabase Auth

### "Row Level Security policy violated" Error

**Symptoms**: Database operations fail with RLS error

**Solutions**:
```sql
-- Check if RLS policies exist
SELECT * FROM pg_policies WHERE tablename = 'profiles';

-- Temporarily disable RLS for testing (NOT for production)
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- Re-create missing policies (see Database Schema section)
```

### Email Not Sending

**Symptoms**: `/api/email/share-profile` returns success but no email received

**Solutions**:
1. **Gmail App Password**: Use app-specific password, not account password
   - Go to Google Account → Security → 2-Step Verification → App passwords
2. **Check credentials**: Verify `EMAIL_USER` and `EMAIL_PASSWORD` in `.env`
3. **Test with nodemailer**:
   ```typescript
   await transporter.verify()
   console.log('SMTP connection successful')
   ```
4. **Check spam folder**: Email might be filtered
5. **Enable less secure apps** (not recommended): Google Account settings

### Port Already in Use

**Symptoms**: `Error: listen EADDRINUSE: address already in use :::3000`

**Solutions**:
```bash
# Windows - Find and kill process
netstat -ano | findstr :3000
taskkill /PID <process_id> /F

# Linux/Mac - Find and kill process
lsof -i :3000
kill -9 <PID>

# Or use different port
PORT=3001 npm run dev
```

### TypeScript Build Errors

**Symptoms**: `npm run build` fails with type errors

**Solutions**:
```bash
# Check specific errors
npx tsc --noEmit

# Clear build cache
rm -rf dist/ node_modules/.cache

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Update TypeScript
npm install typescript@latest --save-dev
```

### CORS Errors

**Symptoms**: Frontend can't access API, browser shows CORS error

**Solutions**:
1. **Verify FRONTEND_URL** matches actual frontend domain
2. **Check CORS configuration**:
   ```typescript
   app.use(cors({
     origin: process.env.FRONTEND_URL || 'http://localhost:5173',
     credentials: true,
     methods: ['GET', 'POST', 'PUT', 'DELETE'],
     allowedHeaders: ['Content-Type', 'Authorization']
   }))
   ```
3. **Production**: Update FRONTEND_URL to production domain
4. **Multiple origins**:
   ```typescript
   origin: ['https://app.example.com', 'https://www.example.com']
   ```

### Database Connection Timeouts

**Symptoms**: Queries hang or timeout

**Solutions**:
1. Check Supabase connection pooling limits
2. Verify database isn't paused (free tier auto-pauses)
3. Check network latency to Supabase region
4. Implement connection retry logic
5. Use database connection pooling

### Session_id Already Exists Error

**Symptoms**: Duplicate session error when saving game stats

**Expected**: This is normal behavior - prevents duplicate submissions

**Solution**: Frontend should generate unique session IDs (UUID v4)

### Environment Variables Not Loading

**Symptoms**: `undefined` values for `process.env.VARIABLE_NAME`

**Solutions**:
1. **Check .env file exists** in project root
2. **Restart server** after changing .env
3. **Verify dotenv is loaded**:
   ```typescript
   import 'dotenv/config'  // At top of index.ts
   ```
4. **Check for typos** in variable names
5. **No spaces around =**:
   ```env
   # Wrong
   PORT = 3000
   
   # Correct
   PORT=3000
   ```

### High Memory Usage

**Symptoms**: Server crashes or slows down over time

**Solutions**:
1. Implement result limiting in queries
2. Add pagination for large datasets
3. Close database connections properly
4. Monitor with: `node --inspect dist/index.js`
5. Use PM2 with memory limits:
   ```bash
   pm2 start dist/index.js --max-memory-restart 500M
   ```

### Debugging Tips

1. **Enable detailed logging**:
   ```typescript
   console.log('User ID:', req.user?.id)
   console.log('Request body:', JSON.stringify(req.body, null, 2))
   console.log('Supabase error:', error)
   ```

2. **Test endpoints with curl**:
   ```bash
   # Test with verbose output
   curl -v -H "Authorization: Bearer $TOKEN" \
     http://localhost:3000/api/profile
   ```

3. **Use Postman/Insomnia** for API testing

4. **Check Supabase logs**: Dashboard → Logs

5. **Monitor server logs**:
   ```bash
   # Development
   npm run dev
   
   # Production (PM2)
   pm2 logs system-collapse-api
   ```

---

## Additional Resources

### Official Documentation

- [Express.js Documentation](https://expressjs.com/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Supabase Documentation](https://supabase.com/docs)
- [Node.js Documentation](https://nodejs.org/docs/)

### Supabase Resources

- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Database Functions](https://supabase.com/docs/guides/database/functions)

---

## 🆘 Support

For issues, questions, or contributions:
1. Check existing issues in the repository
2. Review this README thoroughly
3. Test with Supabase dashboard SQL editor
4. Check server logs for detailed errors
5. Contact the development team

---

## 📄 License

This project is part of a hackathon submission. All rights reserved by the development team.

---

## 📌 Version Information

**Current Version**: 1.0.0  
**Last Updated**: February 2026  
**Minimum Node Version**: 18.0.0  
**TypeScript Version**: 5.7+

---

**Built with ❤️ by Commit & Conquer Team**