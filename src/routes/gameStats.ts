import { Response, Router } from "express";
import { authenticateUser, AuthRequest } from "../middleware/auth";
import type { CreateGameStatsInput } from "../models";
import { gameStatsRepository } from "../models";

const router = Router();

// Save game stats
router.post("/", authenticateUser, async (req: AuthRequest, res: Response) => {
  try {
    // Check if session already exists
    const existingSession = await gameStatsRepository.findBySessionId(
      req.body.session_id,
    );

    if (existingSession) {
      // Session already saved, return existing data
      return res.status(200).json(existingSession);
    }

    const statsData: CreateGameStatsInput = {
      user_id: req.user!.id,
      session_id: req.body.session_id,
      final_score: req.body.final_score,
      final_entropy: req.body.final_entropy,
      final_sanity: req.body.final_sanity,
      phase_reached: req.body.phase_reached,
      won: req.body.won,
      total_time: req.body.total_time,
      collapse_count: req.body.collapse_count || 0,
      total_clicks: req.body.total_clicks,
      average_click_speed: req.body.average_click_speed,
      most_clicked_color: req.body.most_clicked_color,
      repetition_count: req.body.repetition_count,
      variety_score: req.body.variety_score,
      hesitation_score: req.body.hesitation_score,
      impulsivity_score: req.body.impulsivity_score,
      pattern_adherence: req.body.pattern_adherence,
      dominant_behavior: req.body.dominant_behavior,
      click_sequence: req.body.click_sequence,
      rules_followed: req.body.rules_followed,
      rules_broken: req.body.rules_broken,
      hints_ignored: req.body.hints_ignored,
      hint_exposure_count: req.body.hint_exposure_count,
      misleading_hint_count: req.body.misleading_hint_count,
      trust_level: req.body.trust_level,
      rebellion_count: req.body.rebellion_count,
      compliance_count: req.body.compliance_count,
      manipulation_resistance: req.body.manipulation_resistance,
    };

    const gameStats = await gameStatsRepository.create(statsData);

    res.status(201).json(gameStats);
  } catch (error) {
    res.status(500).json({ error: "Failed to save game stats" });
  }
});

// Get user's game history
router.get(
  "/history",
  authenticateUser,
  async (req: AuthRequest, res: Response) => {
    try {
      const history = await gameStatsRepository.findByUserId(req.user!.id, 50);
      res.json(history);
    } catch (error) {
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
      const stats = await gameStatsRepository.getAggregateStats(req.user!.id);
      res.json(stats);
    } catch (error) {
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

      const stats = await gameStatsRepository.findByUserId(userId, 50);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch stats" });
    }
  },
);

export default router;
