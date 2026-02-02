# System Drift Backend - (Documentation)

## Table of Contents

- [Overview](#overview)
- [Technology Stack](#technology-stack)
- [Project Architecture](#project-architecture)
- [Installation & Setup](#installation--setup)
- [Database Schema](#database-schema)
- [API Endpoints Reference](#api-endpoints-reference)
- [Authentication & Security](#authentication--security)
- [Data Models & Types](#data-models--types)
- [Repository Pattern](#repository-pattern)
- [Middleware](#middleware)
- [Services](#services)
- [Error Handling](#error-handling)
- [Deployment Guide](#deployment-guide)
- [Performance Optimization](#performance-optimization)

---

## Overview

The System Drift Backend is a RESTful API server built with Node.js and Express.js that powers the System Drift psychological game. It handles user authentication, profile management, game statistics tracking, leaderboard rankings, and email notifications.

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
├── database/                # Database setup files
│   └── schema.sql          # Complete database schema
├── dist/                    # Compiled JavaScript (generated)
├── node_modules/            # Dependencies (generated)
├── .env                     # Environment variables (gitignored)
├── .env.example             # Environment template
├── .gitignore              # Git ignore rules
├── package.json            # Project dependencies
├── tsconfig.json           # TypeScript configuration
├── README.md               # This documentation
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

### Database Setup Instructions

**Complete SQL schema is located in:** [`database/schema.sql`](database/schema.sql)

#### Quick Setup Steps:

1. **Go to your Supabase Dashboard** → [https://app.supabase.com](https://app.supabase.com)
2. **Select your project**
3. **Navigate to SQL Editor** (left sidebar)
4. **Copy the entire contents** of `database/schema.sql`
5. **Paste and run** in the SQL Editor
6. **Wait for completion** - you should see "Success" messages

#### What the Schema Creates:

**Tables:**
- `profiles` - User profiles with psychological traits
- `game_stats` - Game session statistics and behavior metrics

**Security:**
- Row Level Security (RLS) policies
- User-specific data access controls
- Public leaderboard access

**Performance:**
- Optimized indexes for queries
- Database functions for leaderboards

**Automation:**
- Auto-create profile trigger on user signup
- Auto-update timestamp triggers

#### Schema File Structure:

```sql
-- Tables: profiles, game_stats
-- Indexes: Performance optimization
-- RLS Policies: Security rules
-- Functions: get_best_scores_per_user()
-- Triggers: Auto-create profiles, update timestamps
```

#### Verify Setup:

After running the schema, verify in Supabase Dashboard:
- **Table Editor** → Should see `profiles` and `game_stats` tables
- **Authentication** → RLS should be enabled on both tables
- **Database** → Functions → Should see `get_best_scores_per_user`

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
  "subject": "Check out my System Drift stats!",
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
---

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

## Support

For issues, questions, or contributions:
1. Check existing issues in the repository
2. Review this README thoroughly
3. Test with Supabase dashboard SQL editor
4. Check server logs for detailed errors
5. Contact the development team

---

## License

This project is part of a hackathon submission. All rights reserved by the development team.

---

**Built with ❤️ by Commit & Conquer Team**