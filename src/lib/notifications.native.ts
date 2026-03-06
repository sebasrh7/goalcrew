import Constants from "expo-constants";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import { getCurrentLanguage, Language, t } from "./i18n";
import { supabase } from "./supabase";

// ─── Handler: show notifications when app is in foreground ────────────────────
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// ─── Types ────────────────────────────────────────────────────────────────────
export interface PushToken {
  user_id: string;
  token: string;
  platform: string;
  created_at?: string;
  updated_at?: string;
}

// ─── Register for push notifications ──────────────────────────────────────────
export async function registerForPushNotificationsAsync(): Promise<
  string | null
> {
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
    });
    await Notifications.setNotificationChannelAsync("reminders", {
      name: "Reminders",
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
    });
  }

  if (!Device.isDevice) return null;

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") return null;

  try {
    const { data } = await Notifications.getExpoPushTokenAsync({
      projectId: Constants.expoConfig?.extra?.eas?.projectId ?? "4f25daa4-b37f-43cc-8b6f-02b753df72b7",
    });
    await savePushToken(data);
    return data;
  } catch {
    return null;
  }
}

// ─── Save push token to Supabase ──────────────────────────────────────────────
async function savePushToken(token: string): Promise<void> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from("push_tokens").upsert(
      {
        user_id: user.id,
        token,
        platform: Platform.OS,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id,platform" },
    );
  } catch (_e) {
    // Silent fail — non-critical
  }
}

// ─── Schedule a local notification ────────────────────────────────────────────
export async function scheduleNotification(
  title: string,
  body: string,
  trigger: Date | number = 5,
): Promise<string> {
  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data: { timestamp: new Date().toISOString() },
    },
    trigger:
      typeof trigger === "number"
        ? {
            type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
            seconds: trigger,
          }
        : {
            type: Notifications.SchedulableTriggerInputTypes.DATE,
            date: trigger,
          },
  });
  return id;
}

// ─── Cancel a notification ────────────────────────────────────────────────────
export async function cancelNotification(id: string): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(id);
}

// ─── Cancel ALL scheduled notifications ───────────────────────────────────────
export async function cancelAllNotifications(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

// ─── Daily contribution reminder (recurring, every day at 19:00) ──────────────
export async function scheduleDailyReminder(lang?: Language): Promise<string> {
  const l = lang || getCurrentLanguage();

  // Cancel existing daily reminders first to avoid duplicates
  await cancelNotificationsByTag("daily-reminder");

  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: `⏰ ${t("dailyReminderTitle", l)}`,
      body: t("dailyReminderBody", l),
      data: { tag: "daily-reminder" },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: 19,
      minute: 0,
      channelId: "reminders",
    },
  });
  return id;
}

// ─── Weekly summary reminder (recurring, every Sunday at 10:00) ───────────────
export async function scheduleWeeklyReminder(lang?: Language): Promise<string> {
  const l = lang || getCurrentLanguage();

  await cancelNotificationsByTag("weekly-reminder");

  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: `📊 ${t("weeklyReminderTitle", l)}`,
      body: t("weeklyReminderBody", l),
      data: { tag: "weekly-reminder" },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
      weekday: 1, // Sunday
      hour: 10,
      minute: 0,
      channelId: "reminders",
    },
  });
  return id;
}

// ─── One-time contribution reminder (tomorrow at 19:00) ──────────────────────
export async function scheduleContributionReminder(
  groupName: string,
  amount: number,
  currencySymbol: string,
  lang?: Language,
): Promise<void> {
  const l = lang || getCurrentLanguage();
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(19, 0, 0, 0);

  await scheduleNotification(
    `⏰ ${t("reminderTitle", l)} ${groupName}`,
    `${t("dontForgetContribution", l)} ${currencySymbol}${amount} ${t("forTomorrow", l)}`,
    tomorrow,
  );
}

// ─── Achievement notification (instant, 2s delay) ────────────────────────────
export async function notifyAchievement(
  achievementType: string,
  lang?: Language,
): Promise<void> {
  const l = lang || getCurrentLanguage();
  const titleKey = `achievement_${achievementType}_title`;
  const achievementName = t(titleKey, l) || achievementType;
  await scheduleNotification(
    `🏆 ${t("newAchievementUnlocked", l)}`,
    `${t("youEarned", l)} ${achievementName}`,
    2,
  );
}

// ─── Goal completed notification ──────────────────────────────────────────────
export async function notifyGoalCompleted(
  groupName: string,
  lang?: Language,
): Promise<void> {
  const l = lang || getCurrentLanguage();
  await scheduleNotification(
    `🎉 ${t("goalCompletedNotif", l)}`,
    `${t("goalCompletedNotifBody", l).replace("{group}", groupName)}`,
    2,
  );
}

// ─── Helper: cancel notifications by data tag ─────────────────────────────────
async function cancelNotificationsByTag(tag: string): Promise<void> {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  for (const notif of scheduled) {
    if (notif.content.data?.tag === tag) {
      await Notifications.cancelScheduledNotificationAsync(notif.identifier);
    }
  }
}

// ─── Initialize notification system (call once after auth) ────────────────────
export async function initializeNotifications(settings: {
  push_notifications: boolean;
  contribution_reminders: boolean;
  language?: Language;
}): Promise<void> {
  if (!settings.push_notifications) return;

  await registerForPushNotificationsAsync();

  if (settings.contribution_reminders) {
    await scheduleDailyReminder(settings.language);
    await scheduleWeeklyReminder(settings.language);
  }
}

// ─── Handle settings toggle: cancel reminders when disabled ───────────────────
export async function onNotificationSettingChanged(
  key: string,
  enabled: boolean,
  lang?: Language,
): Promise<void> {
  if (key === "push_notifications" && !enabled) {
    await cancelAllNotifications();
    return;
  }

  if (key === "push_notifications" && enabled) {
    await registerForPushNotificationsAsync();
    return;
  }

  if (key === "contribution_reminders" && !enabled) {
    await cancelNotificationsByTag("daily-reminder");
    await cancelNotificationsByTag("weekly-reminder");
    return;
  }

  if (key === "contribution_reminders" && enabled) {
    await scheduleDailyReminder(lang);
    await scheduleWeeklyReminder(lang);
  }
}

// ─── Smart reminder: streak-aware, period-aware ─────────────────────────────
export async function scheduleSmartReminders(
  groups: {
    name: string;
    frequency: string;
    custom_frequency_days: number | null;
    members?: { user_id: string; streak_days: number; last_completed_period: number }[];
    created_at: string;
  }[],
  userId: string,
  lang?: Language,
): Promise<void> {
  const l = lang || getCurrentLanguage();

  // Cancel existing smart reminders
  await cancelNotificationsByTag("smart-reminder");

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  for (const group of groups) {
    const member = group.members?.find((m) => m.user_id === userId);
    if (!member) continue;

    const periodDays =
      group.frequency === "daily" ? 1
        : group.frequency === "weekly" ? 7
        : group.frequency === "biweekly" ? 14
        : group.frequency === "monthly" ? 30
        : (group.custom_frequency_days ?? 7);

    const groupStart = new Date(group.created_at);
    const groupStartDate = new Date(groupStart.getFullYear(), groupStart.getMonth(), groupStart.getDate());
    const diffDays = Math.floor((today.getTime() - groupStartDate.getTime()) / (1000 * 60 * 60 * 24));
    const currentPeriod = Math.max(0, Math.floor(diffDays / periodDays));

    // If the user hasn't contributed this period yet and has an active streak
    if (member.last_completed_period < currentPeriod && member.streak_days > 0) {
      // Calculate when the current period ends
      const periodEndDay = (currentPeriod + 1) * periodDays;
      const periodEndDate = new Date(groupStartDate);
      periodEndDate.setDate(periodEndDate.getDate() + periodEndDay);

      const daysUntilEnd = Math.floor((periodEndDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

      // If period ends tomorrow or today, send urgent reminder
      if (daysUntilEnd <= 1) {
        const reminderDate = new Date();
        reminderDate.setHours(18, 0, 0, 0);
        if (reminderDate <= now) {
          reminderDate.setDate(reminderDate.getDate() + 1);
        }

        await Notifications.scheduleNotificationAsync({
          content: {
            title: `🔥 ${group.name}`,
            body: t("reminderStreakAtRisk", l),
            data: { tag: "smart-reminder", groupName: group.name },
          },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DATE,
            date: reminderDate,
            channelId: "reminders",
          },
        });
      }
    }
  }
}

// ─── Notification listeners (setup + cleanup) ────────────────────────────────
export function addNotificationListeners(
  onReceived?: (notification: Notifications.Notification) => void,
  onTapped?: (response: Notifications.NotificationResponse) => void,
) {
  const receivedSub = Notifications.addNotificationReceivedListener(
    (notification) => {
      onReceived?.(notification);
    },
  );

  const responseSub = Notifications.addNotificationResponseReceivedListener(
    (response) => {
      onTapped?.(response);
    },
  );

  return () => {
    receivedSub.remove();
    responseSub.remove();
  };
}
