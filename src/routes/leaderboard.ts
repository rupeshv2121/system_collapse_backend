import { Request, Response, Router } from "express";
import { leaderboardRepository } from "../models";

const router = Router();

// Get global leaderboard
router.get("/global", async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 100;
    const leaderboard = await leaderboardRepository.getGlobalLeaderboard(limit);
    res.json(leaderboard);
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    res.status(500).json({ error: "Failed to fetch leaderboard" });
  }
});

// Get top players by wins
router.get("/top-winners", async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 20;
    const topWinners = await leaderboardRepository.getTopWinners(limit);
    res.json(topWinners);
  } catch (error) {
    console.error("Error fetching top winners:", error);
    res.status(500).json({ error: "Failed to fetch top winners" });
  }
});

// Get leaderboard by time period
router.get("/period/:period", async (req: Request, res: Response) => {
  try {
    const period = req.params.period as "day" | "week" | "month" | "all";
    const limit = parseInt(req.query.limit as string) || 100;

    if (!["day", "week", "month", "all"].includes(period)) {
      return res
        .status(400)
        .json({ error: "Invalid period. Use: day, week, month, or all" });
    }

    const leaderboard = await leaderboardRepository.getLeaderboardByPeriod(
      period,
      limit,
    );
    res.json(leaderboard);
  } catch (error) {
    console.error("Error fetching period leaderboard:", error);
    res.status(500).json({ error: "Failed to fetch period leaderboard" });
  }
});

export default router;
