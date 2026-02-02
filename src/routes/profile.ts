import { Response, Router } from "express";
import { authenticateUser, AuthRequest } from "../middleware/auth";
import type { CreateProfileInput, UpdateProfileInput } from "../models";
import { profileRepository } from "../models";

const router = Router();

// Get user profile by ID
router.get(
  "/:userId",
  authenticateUser,
  async (req: AuthRequest, res: Response) => {
    try {
      const { userId } = req.params;

      // Verify user can only access their own profile
      if (userId !== req.user!.id) {
        return res.status(403).json({ error: "Unauthorized access" });
      }

      const profile = await profileRepository.findById(userId);

      if (!profile) {
        return res.status(404).json({ error: "Profile not found" });
      }

      res.json(profile);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch profile" });
    }
  },
);

// Get current user profile
router.get("/", authenticateUser, async (req: AuthRequest, res: Response) => {
  try {
    const profile = await profileRepository.findById(req.user!.id);

    if (!profile) {
      return res.status(404).json({ error: "Profile not found" });
    }

    res.json(profile);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch profile" });
  }
});

// Create or update user profile (upsert)
router.post("/", authenticateUser, async (req: AuthRequest, res: Response) => {
  try {
    const {
      username,
      avatar_url,
      bio,
      play_style,
      risk_tolerance,
      adaptability_score,
      patience_score,
      chaos_affinity,
      order_affinity,
      learning_rate,
      stress_response,
      psychological_archetype,
    } = req.body;

    // Use authenticated user's ID and email
    const profileData: CreateProfileInput = {
      id: req.user!.id,
      email: req.user!.email,
      username,
      avatar_url,
      bio,
      play_style,
      risk_tolerance,
      adaptability_score,
      patience_score,
      chaos_affinity,
      order_affinity,
      learning_rate,
      stress_response,
      psychological_archetype,
    };

    const profile = await profileRepository.upsert(profileData);

    res.status(200).json(profile);
  } catch (error: any) {
    res.status(500).json({
      error: "Failed to update profile",
      details: error.message,
    });
  }
});

// Update user profile
router.put("/", authenticateUser, async (req: AuthRequest, res: Response) => {
  try {
    const updates: UpdateProfileInput = {
      username: req.body.username,
      avatar_url: req.body.avatar_url,
      bio: req.body.bio,
      play_style: req.body.play_style,
      risk_tolerance: req.body.risk_tolerance,
      adaptability_score: req.body.adaptability_score,
      patience_score: req.body.patience_score,
      chaos_affinity: req.body.chaos_affinity,
      order_affinity: req.body.order_affinity,
      learning_rate: req.body.learning_rate,
      stress_response: req.body.stress_response,
      psychological_archetype: req.body.psychological_archetype,
    };

    const profile = await profileRepository.update(req.user!.id, updates);

    res.json(profile);
  } catch (error) {
    res.status(500).json({ error: "Failed to update profile" });
  }
});

export default router;
