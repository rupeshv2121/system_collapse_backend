{/* Database operations for game statistics */}

import { supabase } from "../config/supabase";
import type { AggregateStats, CreateGameStatsInput, GameStats } from "./types";

export class GameStatsRepository {
  // Create new game stats entry

  async create(statsData: CreateGameStatsInput): Promise<GameStats> {
    const { data, error } = await supabase
      .from("game_stats")
      .insert([
        {
          ...statsData,
          played_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  }


  // Get all game stats for a user
  async findByUserId(userId: string, limit: number = 50): Promise<GameStats[]> {
    const { data, error } = await supabase
      .from("game_stats")
      .select("*")
      .eq("user_id", userId)
      .order("played_at", { ascending: false })
      .limit(limit);

    if (error) {
      throw error;
    }

    return data || [];
  }


  // Get game stats by session ID

  async findBySessionId(sessionId: string): Promise<GameStats | null> {
    const { data, error } = await supabase
      .from("game_stats")
      .select("*")
      .eq("session_id", sessionId)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return null;
      }
      throw error;
    }

    return data;
  }

  
  // Get aggregate statistics for a user
   
  async getAggregateStats(userId: string): Promise<AggregateStats> {
    const { data, error } = await supabase
      .from("game_stats")
      .select("*")
      .eq("user_id", userId);

    if (error) {
      throw error;
    }

    const totalGames = data.length;
    const gamesWon = data.filter((g) => g.won).length;
    const gamesLost = data.filter((g) => !g.won).length;
    const averageScore =
      totalGames > 0
        ? data.reduce((sum, g) => sum + g.final_score, 0) / totalGames
        : 0;
    const averageEntropy =
      totalGames > 0
        ? data.reduce((sum, g) => sum + g.final_entropy, 0) / totalGames
        : 0;
    const highestScore =
      totalGames > 0 ? Math.max(...data.map((g) => g.final_score)) : 0;

    return {
      totalGames,
      gamesWon,
      gamesLost,
      averageScore,
      averageEntropy,
      highestScore,
    };
  }

  
   // Get recent games 
  
  async getRecentGames(
    userId: string,
    limit: number = 10,
  ): Promise<GameStats[]> {
    return this.findByUserId(userId, limit);
  }

  
   // Delete all game stats 
   
  async deleteByUserId(userId: string): Promise<void> {
    const { error } = await supabase
      .from("game_stats")
      .delete()
      .eq("user_id", userId);

    if (error) {
      throw error;
    }
  }


  // Get top scores 

  async getTopScores(limit: number = 100): Promise<GameStats[]> {
    const { data, error } = await supabase
      .from("game_stats")
      .select("*")
      .order("final_score", { ascending: false })
      .limit(limit);

    if (error) {
      throw error;
    }

    return data || [];
  }

  // Count total games played 
   
  async countByUserId(userId: string): Promise<number> {
    const { count, error } = await supabase
      .from("game_stats")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId);

    if (error) {
      throw error;
    }

    return count || 0;
  }
}

export const gameStatsRepository = new GameStatsRepository();
