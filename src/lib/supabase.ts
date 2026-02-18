import "react-native-url-polyfill/auto";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";
import Constants from "expo-constants";

const supabaseUrl =
  process.env.EXPO_PUBLIC_SUPABASE_URL ??
  Constants.expoConfig?.extra?.supabaseUrl ??
  "";

const supabaseAnonKey =
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ??
  Constants.expoConfig?.extra?.supabaseAnonKey ??
  "";

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("⚠️  Supabase URL or Anon Key missing. Check your .env file.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// ─── Auth Helpers ─────────────────────────────────────────────────────────────

export async function getCurrentUser() {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error) throw error;
  return user;
}

export async function getUserProfile(userId: string) {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", userId)
    .single();
  if (error) throw error;
  return data;
}

// ─── Groups ──────────────────────────────────────────────────────────────────

export async function fetchUserGroups(userId: string) {
  const { data, error } = await supabase
    .from("group_members")
    .select(
      `
      *,
      group:groups(*)
    `,
    )
    .eq("user_id", userId);
  if (error) throw error;
  return data;
}

export async function fetchGroupWithMembers(groupId: string) {
  const { data, error } = await supabase
    .from("groups")
    .select(
      `
      *,
      members:group_members(
        *,
        user:users(*)
      ),
      contributions(
        *,
        user:users(*)
      )
    `,
    )
    .eq("id", groupId)
    .single();
  if (error) throw error;
  return data;
}

export async function createGroup(groupData: {
  name: string;
  emoji: string;
  deadline: string;
  goal_amount: number;
  frequency: string;
  division_type: string;
  created_by: string;
}) {
  const inviteCode = generateInviteCode();
  const { data, error } = await supabase
    .from("groups")
    .insert({ ...groupData, invite_code: inviteCode })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function joinGroupByCode(inviteCode: string, userId: string) {
  // Find group by invite code
  const { data: group, error: groupError } = await supabase
    .from("groups")
    .select("*")
    .eq("invite_code", inviteCode)
    .single();
  if (groupError) throw new Error("Código de invitación inválido");

  // Check if already a member
  const { data: existing } = await supabase
    .from("group_members")
    .select("id")
    .eq("group_id", group.id)
    .eq("user_id", userId)
    .single();
  if (existing) throw new Error("Ya eres miembro de este grupo");

  // Join the group
  const { error: joinError } = await supabase.from("group_members").insert({
    group_id: group.id,
    user_id: userId,
    individual_goal: group.goal_amount,
    current_amount: 0,
    streak_days: 0,
    total_points: 0,
  });
  if (joinError) throw joinError;
  return group;
}

// ─── Contributions ───────────────────────────────────────────────────────────

export async function addContribution(
  userId: string,
  groupId: string,
  amount: number,
  note?: string,
) {
  // Insert contribution
  const { data, error } = await supabase
    .from("contributions")
    .insert({ user_id: userId, group_id: groupId, amount, note })
    .select()
    .single();
  if (error) throw error;

  // Update member's current_amount and streak via RPC (server-side function)
  const { error: rpcError } = await supabase.rpc(
    "update_member_after_contribution",
    {
      p_user_id: userId,
      p_group_id: groupId,
      p_amount: amount,
    },
  );
  if (rpcError) {
    // Fallback: manual update
    await supabase.rpc("increment_member_amount", {
      p_user_id: userId,
      p_group_id: groupId,
      p_amount: amount,
    });
  }

  return data;
}

export async function fetchGroupContributions(groupId: string, limit = 20) {
  const { data, error } = await supabase
    .from("contributions")
    .select(`*, user:users(*)`)
    .eq("group_id", groupId)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data;
}

// ─── Achievements ────────────────────────────────────────────────────────────

export async function fetchUserAchievements(userId: string, groupId: string) {
  const { data, error } = await supabase
    .from("achievements")
    .select("*")
    .eq("user_id", userId)
    .eq("group_id", groupId);
  if (error) throw error;
  return data;
}

export async function unlockAchievement(
  userId: string,
  groupId: string,
  achievementType: string,
) {
  const { data, error } = await supabase
    .from("achievements")
    .upsert(
      { user_id: userId, group_id: groupId, achievement_type: achievementType },
      { onConflict: "user_id,group_id,achievement_type" },
    )
    .select()
    .single();
  if (error) throw error;
  return data;
}

// ─── Realtime ────────────────────────────────────────────────────────────────

export function subscribeToGroup(
  groupId: string,
  onContribution: (payload: any) => void,
) {
  return supabase
    .channel(`group:${groupId}`)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "contributions",
        filter: `group_id=eq.${groupId}`,
      },
      onContribution,
    )
    .subscribe();
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function generateInviteCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from(
    { length: 8 },
    () => chars[Math.floor(Math.random() * chars.length)],
  ).join("");
}
