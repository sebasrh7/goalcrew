// Supabase Edge Function: Push Notification Sender
// Receives event data, looks up push tokens, checks preferences, sends via Expo Push API
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send";

interface NotifyRequest {
  type: string;
  group_id: string;
  actor_id: string;
  actor_name: string;
  group_name: string;
  group_emoji?: string;
  data?: Record<string, unknown>;
}

interface PushMessage {
  to: string;
  title: string;
  body: string;
  data?: Record<string, unknown>;
  sound: "default";
  channelId: string;
}

// Map event types to notification setting keys
const EVENT_SETTING_MAP: Record<string, string> = {
  contribution_added: "contribution_notifications",
  contribution_updated: "contribution_notifications",
  contribution_deleted: "contribution_notifications",
  expense_added: "expense_notifications",
  expense_deleted: "expense_notifications",
  settlement_created: "expense_notifications",
  chat_message: "chat_notifications",
  member_joined: "group_notifications",
  member_left: "group_notifications",
  member_removed: "group_notifications",
  group_completed: "group_notifications",
  group_archived: "group_notifications",
  group_reactivated: "group_notifications",
  group_deleted: "group_notifications",
  group_updated: "group_notifications",
  achievement_unlocked: "achievement_notifications",
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    // Verify the caller is authenticated
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return jsonResponse({ error: "Missing authorization" }, 401);
    }

    const authClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: authError } = await authClient.auth.getUser();
    if (authError || !user) {
      return jsonResponse({ error: "Invalid token" }, 401);
    }

    // Use service role for data operations
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const body: NotifyRequest = await req.json();
    const { type, group_id, actor_id, actor_name, group_name, group_emoji, data } = body;

    if (!type || !group_id || !actor_id) {
      return jsonResponse({ error: "Missing required fields" }, 400);
    }

    // 1. Get all group members except the actor
    const { data: members, error: membersError } = await supabase
      .from("group_members")
      .select("user_id")
      .eq("group_id", group_id)
      .neq("user_id", actor_id);

    if (membersError || !members?.length) {
      return jsonResponse({ sent: 0 });
    }

    const memberIds = members.map((m: { user_id: string }) => m.user_id);

    // 2. Check notification preferences for each member
    const settingKey = EVENT_SETTING_MAP[type] || "push_notifications";
    const { data: settings } = await supabase
      .from("user_settings")
      .select("user_id, push_notifications, " + settingKey)
      .in("user_id", memberIds);

    // Filter out users who have disabled notifications
    const enabledUserIds = memberIds.filter((uid: string) => {
      const userSetting = settings?.find((s: Record<string, unknown>) => s.user_id === uid);
      if (!userSetting) return true; // Default: enabled
      if (!userSetting.push_notifications) return false; // Master toggle off
      // Check specific category toggle (default to true if column doesn't exist yet)
      const categoryValue = userSetting[settingKey];
      return categoryValue === undefined || categoryValue === null || categoryValue === true;
    });

    if (!enabledUserIds.length) {
      return jsonResponse({ sent: 0 });
    }

    // 3. Get push tokens for enabled users
    const { data: tokens } = await supabase
      .from("push_tokens")
      .select("token, user_id")
      .in("user_id", enabledUserIds);

    if (!tokens?.length) {
      return jsonResponse({ sent: 0 });
    }

    // 4. Build notification messages
    const emoji = group_emoji || "💰";
    const { title, message } = buildNotificationContent(type, actor_name, group_name, emoji, data);

    const pushMessages: PushMessage[] = tokens.map((t: { token: string }) => ({
      to: t.token,
      title,
      body: message,
      data: { groupId: group_id, type, ...data },
      sound: "default" as const,
      channelId: "default",
    }));

    // 5. Send via Expo Push API (batch up to 100)
    const chunks = chunkArray(pushMessages, 100);
    let totalSent = 0;

    for (const chunk of chunks) {
      const response = await fetch(EXPO_PUSH_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(chunk),
      });

      if (response.ok) {
        const result = await response.json();
        // Clean up invalid tokens
        if (result.data) {
          for (let i = 0; i < result.data.length; i++) {
            if (result.data[i].status === "error" && result.data[i].details?.error === "DeviceNotRegistered") {
              // Remove invalid token
              await supabase.from("push_tokens").delete().eq("token", chunk[i].to);
            }
          }
        }
        totalSent += chunk.length;
      }
    }

    return jsonResponse({ sent: totalSent });
  } catch (err) {
    return jsonResponse({ error: String(err) }, 500);
  }
});

// ─── Build notification content based on event type ─────────────────────────
function buildNotificationContent(
  type: string,
  actorName: string,
  groupName: string,
  emoji: string,
  data?: Record<string, unknown>,
): { title: string; message: string } {
  const amount = data?.amount ? formatAmount(data.amount as number, data.currency as string) : "";

  switch (type) {
    // Contributions
    case "contribution_added":
      return {
        title: `${emoji} ${groupName}`,
        message: `${actorName} aportó ${amount}`,
      };
    case "contribution_updated":
      return {
        title: `${emoji} ${groupName}`,
        message: `${actorName} editó un aporte`,
      };
    case "contribution_deleted":
      return {
        title: `${emoji} ${groupName}`,
        message: `${actorName} eliminó un aporte`,
      };

    // Expenses
    case "expense_added":
      return {
        title: `${emoji} ${groupName}`,
        message: `${actorName} registró un gasto: ${data?.description || ""} (${amount})`,
      };
    case "expense_deleted":
      return {
        title: `${emoji} ${groupName}`,
        message: `${actorName} eliminó un gasto`,
      };
    case "settlement_created":
      return {
        title: `${emoji} ${groupName}`,
        message: `${actorName} saldó una deuda de ${amount}`,
      };

    // Chat
    case "chat_message":
      return {
        title: `${emoji} ${groupName}`,
        message: `${actorName}: ${truncate(data?.message as string, 100)}`,
      };

    // Group management
    case "member_joined":
      return {
        title: `${emoji} ${groupName}`,
        message: `${actorName} se unió al grupo`,
      };
    case "member_left":
      return {
        title: `${emoji} ${groupName}`,
        message: `${actorName} salió del grupo`,
      };
    case "member_removed":
      return {
        title: `${emoji} ${groupName}`,
        message: `${actorName} fue removido del grupo`,
      };
    case "group_completed":
      return {
        title: `🎉 ${groupName}`,
        message: `¡El grupo completó su meta!`,
      };
    case "group_archived":
      return {
        title: `📦 ${groupName}`,
        message: `El grupo fue archivado`,
      };
    case "group_reactivated":
      return {
        title: `🔄 ${groupName}`,
        message: `¡El grupo fue reactivado!`,
      };
    case "group_deleted":
      return {
        title: `🗑️ ${groupName}`,
        message: `El grupo fue eliminado`,
      };
    case "group_updated":
      return {
        title: `${emoji} ${groupName}`,
        message: `${actorName} actualizó el grupo`,
      };
    case "achievement_unlocked":
      return {
        title: `🏆 ${groupName}`,
        message: `${actorName} desbloqueó un logro: ${data?.achievement || ""}`,
      };

    default:
      return {
        title: `${emoji} ${groupName}`,
        message: `Nueva actividad de ${actorName}`,
      };
  }
}

function formatAmount(amount: number, currency?: string): string {
  const sym = currency || "$";
  return `${sym}${amount.toLocaleString()}`;
}

function truncate(str: string | undefined, max: number): string {
  if (!str) return "";
  return str.length > max ? str.slice(0, max) + "…" : str;
}

function chunkArray<T>(arr: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
}
