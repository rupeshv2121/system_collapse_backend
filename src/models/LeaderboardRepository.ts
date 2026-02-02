//database operations for leaderboard data

import { supabase } from "../config/supabase";
import type { LeaderboardEntry, TopWinner } from "./types";

export class LeaderboardRepository {
  
  //  Get global leaderboard by score

  async getGlobalLeaderboard(limit: number = 100): Promise<LeaderboardEntry[]> {
    // Use a subquery to get the best score per user, then join with game_stats to get full details
    const { data, error } = await supabase.rpc("get_best_scores_per_user", {
      result_limit: limit,
    });

    if (error) {
      // Get all game stats with profiles
      const { data: allStats, error: statsError } = await supabase
        .from("game_stats")
        .select(
          `
          *,
          profiles:user_id (username)
        `,
        )
        .order("final_score", { ascending: false });

      if (statsError) {
        throw statsError;
      }

      // Group by user and keep only the best score
      const bestScoresMap = new Map<string, any>();

      for (const entry of allStats) {
        const userId = entry.user_id;
        if (
          !bestScoresMap.has(userId) ||
          entry.final_score > bestScoresMap.get(userId).final_score
        ) {
          bestScoresMap.set(userId, entry);
        }
      }

      // Convert to array, sort by score, and limit
      const bestScores = Array.from(bestScoresMap.values())
        .sort((a, b) => b.final_score - a.final_score)
        .slice(0, limit);

      return bestScores.map((entry: any) => ({
        username: entry.profiles?.username || "Anonymous",
        score: entry.final_score,
        entropy: entry.final_entropy,
        phase: entry.phase_reached,
        won: entry.won,
        playedAt: entry.played_at,
      }));
    }

    return data.map((entry: any) => ({
      username: entry.username || "Anonymous",
      score: entry.final_score,
      entropy: entry.final_entropy,
      phase: entry.phase_reached,
      won: entry.won,
      playedAt: entry.played_at,
    }));
  }

  /**
   * Get top winners by win count
   */
  async getTopWinners(limit: number = 20): Promise<TopWinner[]> {
    const { data, error } = await supabase
      .from("game_stats")
      .select(
        `
        user_id,
        profiles:user_id (username)
      `,
      )
      .eq("won", true);

    if (error) {
      throw error;
    }

    // Count wins per user
    const winCounts: { [key: string]: { username: string; wins: number } } = {};

    data.forEach((entry: any) => {
      const userId = entry.user_id;
      const username = entry.profiles?.username || "Anonymous";

      if (!winCounts[userId]) {
        winCounts[userId] = { username, wins: 0 };
      }
      winCounts[userId].wins++;
    });

    return Object.values(winCounts)
      .sort((a, b) => b.wins - a.wins)
      .slice(0, limit);
  }

  /**
   * Get user's leaderboard rank by score
   */
  async getUserRank(userId: string): Promise<number | null> {
    // Get user's best score
    const { data: userBest, error: userError } = await supabase
      .from("game_stats")
      .select("final_score")
      .eq("user_id", userId)
      .order("final_score", { ascending: false })
      .limit(1)
      .single();

    if (userError || !userBest) {
      return null;
    }

    // Count how many users have a higher score
    const { count, error: countError } = await supabase
      .from("game_stats")
      .select("*", { count: "exact", head: true })
      .gt("final_score", userBest.final_score);

    if (countError) {
      throw countError;
    }

    return (count || 0) + 1; // Rank is count + 1
  }

  
  // Get leaderboard for a specific time period

  async getLeaderboardByPeriod(
    period: "day" | "week" | "month" | "all",
    limit: number = 100,
  ): Promise<LeaderboardEntry[]> {
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case "day":
        startDate = new Date(now.setDate(now.getDate() - 1));
        break;
      case "week":
        startDate = new Date(now.setDate(now.getDate() - 7));
        break;
      case "month":
        startDate = new Date(now.setMonth(now.getMonth() - 1));
        break;
      default:
        startDate = new Date(0); // Beginning of time
    }

    const { data, error } = await supabase
      .from("game_stats")
      .select(
        `
        *,
        profiles:user_id (username)
      `,
      )
      .gte("played_at", startDate.toISOString())
      .order("final_score", { ascending: false });

    if (error) {
      throw error;
    }

    // Group by user and keep only the best score
    const bestScoresMap = new Map<string, any>();

    for (const entry of data) {
      const userId = entry.user_id;
      if (
        !bestScoresMap.has(userId) ||
        entry.final_score > bestScoresMap.get(userId).final_score
      ) {
        bestScoresMap.set(userId, entry);
      }
    }

    // Convert to array, sort by score, and limit
    const bestScores = Array.from(bestScoresMap.values())
      .sort((a, b) => b.final_score - a.final_score)
      .slice(0, limit);

    return bestScores.map((entry: any) => ({
      username: entry.profiles?.username || "Anonymous",
      score: entry.final_score,
      entropy: entry.final_entropy,
      phase: entry.phase_reached,
      won: entry.won,
      playedAt: entry.played_at,
    }));
  }
}

export const leaderboardRepository = new LeaderboardRepository();
