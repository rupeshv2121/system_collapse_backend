import { Response, Router } from "express";
import { supabase } from "../config/supabase";
import { authenticateUser, AuthRequest } from "../middleware/auth";

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

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          // Profile not found
          return res.status(404).json({ error: "Profile not found" });
        }
        throw error;
      }

      res.json(data);
    } catch (error) {
      console.error("Error fetching profile:", error);
      res.status(500).json({ error: "Failed to fetch profile" });
    }
  },
);

// Get current user profile
router.get("/", authenticateUser, async (req: AuthRequest, res: Response) => {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", req.user!.id)
      .single();

    if (error) throw error;

    res.json(data);
  } catch (error) {
    console.error("Error fetching profile:", error);
    res.status(500).json({ error: "Failed to fetch profile" });
  }
});

// Create or update user profile (upsert)
router.post("/", authenticateUser, async (req: AuthRequest, res: Response) => {
  try {
    const {
      user_id,
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

    // Use authenticated user's ID
    const userId = req.user!.id;
    const userEmail = req.user!.email;

    const { data, error } = await supabase
      .from("profiles")
      .upsert(
        {
          id: userId,
          email: userEmail,
          username: username || userEmail?.split("@")[0],
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
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "id",
        },
      )
      .select()
      .single();

    if (error) {
      console.error("Supabase upsert error:", error);
      throw error;
    }

    res.status(200).json(data);
  } catch (error: any) {
    console.error("Error upserting profile:", error);
    res.status(500).json({
      error: "Failed to update profile",
      details: error.message,
    });
  }
});

// Update user profile
router.put("/", authenticateUser, async (req: AuthRequest, res: Response) => {
  try {
    const { username } = req.body;

    const { data, error } = await supabase
      .from("profiles")
      .update({ username, updated_at: new Date().toISOString() })
      .eq("id", req.user!.id)
      .select()
      .single();

    if (error) throw error;

    res.json(data);
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ error: "Failed to update profile" });
  }
});

export default router;
