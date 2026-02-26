import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";
import "react-native-url-polyfill/auto";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? "";
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? "";

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
  custom_frequency_days?: number | null;
  division_type: string;
}) {
  const { data, error } = await supabase.rpc("create_group", {
    p_name: groupData.name,
    p_emoji: groupData.emoji,
    p_deadline: groupData.deadline,
    p_goal_amount: groupData.goal_amount,
    p_frequency: groupData.frequency,
    p_custom_frequency_days: groupData.custom_frequency_days ?? null,
    p_division_type: groupData.division_type,
  });
  if (error) throw error;
  return data;
}

export async function joinGroupByCode(
  inviteCode: string,
  userId: string,
  individualGoal?: number,
) {
  // Use SECURITY DEFINER RPC to bypass RLS (user isn't a member yet)
  const { data, error } = await supabase.rpc("join_group_by_code", {
    p_invite_code: inviteCode,
    p_individual_goal: individualGoal ?? null,
  });
  if (error) {
    // Map server exceptions to friendly messages
    if (error.message?.includes("Invalid invite code"))
      throw new Error("Código de invitación inválido");
    if (error.message?.includes("Already a member"))
      throw new Error("Ya eres miembro de este grupo");
    throw error;
  }
  return data;
}

export async function peekGroupByCode(inviteCode: string) {
  // Use SECURITY DEFINER RPC to get group preview without being a member
  const { data, error } = await supabase.rpc("peek_group_by_code", {
    p_invite_code: inviteCode,
  });
  if (error) throw error;
  return data;
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
// ─── Group Management ────────────────────────────────────────────────────

export async function leaveGroupApi(groupId: string) {
  const { error } = await supabase.rpc("leave_group", { p_group_id: groupId });
  if (error) {
    if (error.message?.includes("Creator cannot leave"))
      throw new Error("CREATOR_CANNOT_LEAVE");
    throw error;
  }
}

export async function deleteGroupApi(groupId: string) {
  const { error } = await supabase.rpc("delete_group", { p_group_id: groupId });
  if (error) {
    if (error.message?.includes("Only the group creator"))
      throw new Error("NOT_CREATOR");
    throw error;
  }
}

export async function updateGroupApi(
  groupId: string,
  updates: {
    name?: string;
    emoji?: string;
    deadline?: string;
    goal_amount?: number;
    frequency?: string;
    custom_frequency_days?: number;
  },
) {
  const { data, error } = await supabase.rpc("update_group", {
    p_group_id: groupId,
    p_name: updates.name ?? null,
    p_emoji: updates.emoji ?? null,
    p_deadline: updates.deadline ?? null,
    p_goal_amount: updates.goal_amount ?? null,
    p_frequency: updates.frequency ?? null,
    p_custom_frequency_days: updates.custom_frequency_days ?? null,
  });
  if (error) {
    if (error.message?.includes("Only the group creator"))
      throw new Error("NOT_CREATOR");
    throw error;
  }
  return data;
}

// ─── Contribution Management ─────────────────────────────────────────────────

export async function deleteContributionApi(contributionId: string) {
  const { error } = await supabase.rpc("delete_contribution", {
    p_contribution_id: contributionId,
  });
  if (error) throw error;
}

export async function updateContributionApi(
  contributionId: string,
  updates: {
    amount?: number;
    note?: string;
  },
) {
  const { data, error } = await supabase.rpc("update_contribution", {
    p_contribution_id: contributionId,
    p_amount: updates.amount ?? null,
    p_note: updates.note ?? null,
  });
  if (error) throw error;
  return data;
}
