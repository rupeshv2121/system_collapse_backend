{/* Handles all database operations for user profiles */}

import { supabase } from "../config/supabase";
import type { CreateProfileInput, Profile, UpdateProfileInput } from "./types";

export class ProfileRepository {

  // Find profile by user ID
  async findById(userId: string): Promise<Profile | null> {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return null; // Profile not found
      }
      throw error;
    }

    return data;
  }

  // Create or update profile

  async upsert(profileData: CreateProfileInput): Promise<Profile> {
    const { data, error } = await supabase
      .from("profiles")
      .upsert(
        {
          ...profileData,
          email: profileData.email || `user_${profileData.id}@system.local`,
          username:
            profileData.username ||
            profileData.email?.split("@")[0] ||
            `user_${profileData.id.slice(0, 8)}`,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "id",
        },
      )
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  }

  
  // Update existing profile

  async update(userId: string, updates: UpdateProfileInput): Promise<Profile> {
    const { data, error } = await supabase
      .from("profiles")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  }


   // Delete profile

  async delete(userId: string): Promise<void> {
    const { error } = await supabase.from("profiles").delete().eq("id", userId);

    if (error) {
      throw error;
    }
  }


   // Check if profile exists
   
  async exists(userId: string): Promise<boolean> {
    const { data, error } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", userId)
      .single();

    return !error && !!data;
  }
}

// Export singleton instance
export const profileRepository = new ProfileRepository();
