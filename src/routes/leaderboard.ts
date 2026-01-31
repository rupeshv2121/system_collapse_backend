import { Request, Response, Router } from "express";
import { supabase } from "../config/supabase";

const router = Router();

// Get global leaderboard
router.get("/global", async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from("game_stats")
      .select(
        `
        *,
        profiles:user_id (username)
      `,
      )
      .order("final_score", { ascending: false })
      .limit(100);

    if (error) throw error;

    const leaderboard = data.map((entry) => ({
      username: entry.profiles?.username || "Anonymous",
      score: entry.final_score,
      entropy: entry.final_entropy,
      phase: entry.phase_reached,
      won: entry.won,
      playedAt: entry.played_at,
    }));

    res.json(leaderboard);
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    res.status(500).json({ error: "Failed to fetch leaderboard" });
  }
});

// Get top players by wins
router.get("/top-winners", async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from("game_stats")
      .select(
        `
        user_id,
        profiles:user_id (username)
      `,
      )
      .eq("won", true);

    if (error) throw error;

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

    const topWinners = Object.values(winCounts)
      .sort((a, b) => b.wins - a.wins)
      .slice(0, 20);

    res.json(topWinners);
  } catch (error) {
    console.error("Error fetching top winners:", error);
    res.status(500).json({ error: "Failed to fetch top winners" });
  }
});

export default router;
