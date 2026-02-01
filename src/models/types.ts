export interface Profile {
  id: string;
  email: string;
  username?: string;
  avatar_url?: string;
  bio?: string;
  play_style?: string;
  risk_tolerance?: number;
  adaptability_score?: number;
  patience_score?: number;
  chaos_affinity?: number;
  order_affinity?: number;
  learning_rate?: number;
  stress_response?: number;
  psychological_archetype?: string;
  created_at?: string;
  updated_at?: string;
}

export interface GameStats {
  id?: string;
  user_id: string;
  session_id: string;
  final_score: number;
  final_entropy: number;
  final_sanity: number;
  phase_reached: number;
  won: boolean;
  total_time: number;
  collapse_count: number;
  total_clicks: number;
  average_click_speed: number;
  most_clicked_color: string;
  repetition_count: number;
  variety_score: number;
  hesitation_score: number;
  impulsivity_score: number;
  pattern_adherence: number;
  dominant_behavior: string;
  click_sequence: string[];
  rules_followed: number;
  rules_broken: number;
  hints_ignored: number;
  hint_exposure_count: number;
  misleading_hint_count: number;
  trust_level: number;
  rebellion_count: number;
  compliance_count: number;
  manipulation_resistance: number;
  played_at?: string;
}

export interface UserAnalytics {
  id?: string;
  user_id: string;
  total_games: number;
  games_won: number;
  games_lost: number;
  current_streak: number;
  longest_streak: number;
  highest_score: number;
  average_score: number;
  average_entropy: number;
  total_playtime: number;
  phases_distribution: Record<number, number>;
  last_played_at?: string;
  created_at?: string;
  updated_at?: string;
}

export interface LeaderboardEntry {
  username: string;
  score: number;
  entropy: number;
  phase: number;
  won: boolean;
  playedAt: string;
}

export interface TopWinner {
  username: string;
  wins: number;
}

// Input DTOs for creating/updating
export interface CreateProfileInput {
  id: string;
  email?: string;
  username?: string;
  avatar_url?: string;
  bio?: string;
  play_style?: string;
  risk_tolerance?: number;
  adaptability_score?: number;
  patience_score?: number;
  chaos_affinity?: number;
  order_affinity?: number;
  learning_rate?: number;
  stress_response?: number;
  psychological_archetype?: string;
}

export interface UpdateProfileInput {
  username?: string;
  avatar_url?: string;
  bio?: string;
  play_style?: string;
  risk_tolerance?: number;
  adaptability_score?: number;
  patience_score?: number;
  chaos_affinity?: number;
  order_affinity?: number;
  learning_rate?: number;
  stress_response?: number;
  psychological_archetype?: string;
}

export interface CreateGameStatsInput {
  user_id: string;
  session_id: string;
  final_score: number;
  final_entropy: number;
  final_sanity: number;
  phase_reached: number;
  won: boolean;
  total_time: number;
  collapse_count: number;
  total_clicks: number;
  average_click_speed: number;
  most_clicked_color: string;
  repetition_count: number;
  variety_score: number;
  hesitation_score: number;
  impulsivity_score: number;
  pattern_adherence: number;
  dominant_behavior: string;
  click_sequence: string[];
  rules_followed: number;
  rules_broken: number;
  hints_ignored: number;
  hint_exposure_count: number;
  misleading_hint_count: number;
  trust_level: number;
  rebellion_count: number;
  compliance_count: number;
  manipulation_resistance: number;
}

export interface AggregateStats {
  totalGames: number;
  gamesWon: number;
  gamesLost: number;
  averageScore: number;
  averageEntropy: number;
  highestScore: number;
}
