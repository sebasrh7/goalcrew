// Re-export for TypeScript resolution. At runtime, Metro uses
// notifications.native.ts (iOS/Android) or notifications.web.ts (web).
export {
  registerForPushNotificationsAsync,
  scheduleNotification,
  cancelNotification,
  cancelAllNotifications,
  scheduleDailyReminder,
  scheduleWeeklyReminder,
  scheduleContributionReminder,
  notifyAchievement,
  notifyGoalCompleted,
  initializeNotifications,
  onNotificationSettingChanged,
  addNotificationListeners,
  scheduleSmartReminders,
} from "./notifications.native";
export type { PushToken } from "./notifications.native";
