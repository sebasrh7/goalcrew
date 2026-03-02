// ─── Web stub: notifications are not supported on web ─────────────────────────
// All exports match the native API so imports work across platforms.

import type { Language } from "./i18n";

export interface PushToken {
  user_id: string;
  token: string;
  platform: string;
  created_at?: string;
  updated_at?: string;
}

export async function registerForPushNotificationsAsync(): Promise<
  string | null
> {
  return null;
}

export async function scheduleNotification(
  _title: string,
  _body: string,
  _trigger?: Date | number,
): Promise<string> {
  return "";
}

export async function cancelNotification(_id: string): Promise<void> {}

export async function cancelAllNotifications(): Promise<void> {}

export async function scheduleDailyReminder(_lang?: Language): Promise<string> {
  return "";
}

export async function scheduleWeeklyReminder(
  _lang?: Language,
): Promise<string> {
  return "";
}

export async function scheduleContributionReminder(
  _groupName: string,
  _amount: number,
  _currencySymbol: string,
  _lang?: Language,
): Promise<void> {}

export async function notifyAchievement(
  _achievementType: string,
  _lang?: Language,
): Promise<void> {}

export async function notifyGoalCompleted(
  _groupName: string,
  _lang?: Language,
): Promise<void> {}

export async function initializeNotifications(_settings: {
  push_notifications: boolean;
  contribution_reminders: boolean;
  language?: Language;
}): Promise<void> {}

export async function onNotificationSettingChanged(
  _key: string,
  _enabled: boolean,
  _lang?: Language,
): Promise<void> {}

export function addNotificationListeners(
  _onReceived?: (notification: unknown) => void,
  _onTapped?: (response: unknown) => void,
) {
  return () => {};
}
