import { Response, Router } from "express";
import { supabase } from "../config/supabase";
import { authenticateUser, AuthRequest } from "../middleware/auth";

const router = Router();

// Save game stats
router.post("/", authenticateUser, async (req: AuthRequest, res: Response) => {
  try {
    const {
      session_id,
      final_score,
      final_entropy,
      final_sanity,
      phase_reached,
      won,
      duration,
      total_clicks,
      average_click_speed,
      most_clicked_color,
      repetition_count,
      variety_score,
      hesitation_score,
      impulsivity_score,
      pattern_adherence,
      dominant_behavior,
      click_sequence,
      rules_followed,
      rules_broken,
      hints_ignored,
      hint_exposure_count,
      misleading_hint_count,
      trust_level,
      rebellion_count,
      compliance_count,
      manipulation_resistance,
    } = req.body;

    const { data, error } = await supabase
      .from("game_stats")
      .insert([
        {
          user_id: req.user!.id,
          session_id,
          final_score,
          final_entropy,
          final_sanity,
          phase_reached,
          won,
          duration,
          total_clicks,
          average_click_speed,
          most_clicked_color,
          repetition_count,
          variety_score,
          hesitation_score,
          impulsivity_score,
          pattern_adherence,
          dominant_behavior,
          click_sequence,
          rules_followed,
          rules_broken,
          hints_ignored,
          hint_exposure_count,
          misleading_hint_count,
          trust_level,
          rebellion_count,
          compliance_count,
          manipulation_resistance,
          played_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json(data);
  } catch (error) {
    console.error("Error saving game stats:", error);
    res.status(500).json({ error: "Failed to save game stats" });
  }
});

// Get user's game history
router.get(
  "/history",
  authenticateUser,
  async (req: AuthRequest, res: Response) => {
    try {
      const { data, error } = await supabase
        .from("game_stats")
        .select("*")
        .eq("user_id", req.user!.id)
        .order("played_at", { ascending: false })
        .limit(50);

      if (error) throw error;

      res.json(data);
    } catch (error) {
      console.error("Error fetching game history:", error);
      res.status(500).json({ error: "Failed to fetch game history" });
    }
  },
);

// Get user's aggregate stats
router.get(
  "/aggregate",
  authenticateUser,
  async (req: AuthRequest, res: Response) => {
    try {
      const { data, error } = await supabase
        .from("game_stats")
        .select("*")
        .eq("user_id", req.user!.id);

      if (error) throw error;

      const stats = {
        totalGames: data.length,
        gamesWon: data.filter((g) => g.won).length,
        gamesLost: data.filter((g) => !g.won).length,
        averageScore:
          data.reduce((sum, g) => sum + g.final_score, 0) / data.length || 0,
        averageEntropy:
          data.reduce((sum, g) => sum + g.final_entropy, 0) / data.length || 0,
        highestScore: Math.max(...data.map((g) => g.final_score), 0),
      };

      res.json(stats);
    } catch (error) {
      console.error("Error calculating aggregate stats:", error);
      res.status(500).json({ error: "Failed to calculate stats" });
    }
  },
);

// Get user's game stats by userId
router.get(
  "/:userId",
  authenticateUser,
  async (req: AuthRequest, res: Response) => {
    try {
      const { userId } = req.params;

      // Verify user can only access their own data
      if (userId !== req.user!.id) {
        return res.status(403).json({ error: "Unauthorized access" });
      }

      const { data, error } = await supabase
        .from("game_stats")
        .select("*")
        .eq("user_id", userId)
        .order("played_at", { ascending: false })
        .limit(50);

      if (error) throw error;

      res.json(data || []);
    } catch (error) {
      console.error("Error fetching user stats:", error);
      res.status(500).json({ error: "Failed to fetch stats" });
    }
  },
);

export default router;
