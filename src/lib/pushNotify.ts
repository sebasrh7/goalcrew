// Client-side helper to send push notifications via Supabase Edge Function
import { supabase } from "./supabase";

export type NotifyEventType =
  | "contribution_added"
  | "contribution_updated"
  | "contribution_deleted"
  | "expense_added"
  | "expense_deleted"
  | "settlement_created"
  | "chat_message"
  | "member_joined"
  | "member_left"
  | "member_removed"
  | "group_completed"
  | "group_archived"
  | "group_reactivated"
  | "group_deleted"
  | "group_updated"
  | "achievement_unlocked";

interface NotifyParams {
  type: NotifyEventType;
  groupId: string;
  groupName: string;
  groupEmoji?: string;
  data?: Record<string, unknown>;
}

/**
 * Send a push notification to all group members (except the current user).
 * Fires and forgets — never blocks the UI or throws errors.
 */
export async function notifyGroup(params: NotifyParams): Promise<void> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.functions.invoke("notify", {
      body: {
        type: params.type,
        group_id: params.groupId,
        actor_id: user.id,
        actor_name: user.user_metadata?.name || user.email?.split("@")[0] || "Alguien",
        group_name: params.groupName,
        group_emoji: params.groupEmoji,
        data: params.data,
      },
    });
  } catch {
    // Silent fail — push notifications are non-critical
  }
}

/**
 * Helper to get group info for notification context.
 * Used by stores that don't have group name/emoji readily available.
 */
export async function getGroupInfo(groupId: string): Promise<{ name: string; emoji: string } | null> {
  try {
    const { data, error } = await supabase
      .from("groups")
      .select("name, emoji")
      .eq("id", groupId)
      .single();
    if (error || !data) return null;
    return data;
  } catch {
    return null;
  }
}
