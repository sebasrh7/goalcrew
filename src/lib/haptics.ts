import { Platform } from "react-native";

type ImpactStyle = "Light" | "Medium" | "Heavy";
type NotificationType = "Success" | "Warning" | "Error";

/** Safe wrapper around expo-haptics. No-op on web. */
export async function impactAsync(style: ImpactStyle = "Light"): Promise<void> {
  if (Platform.OS === "web") return;
  const Haptics = require("expo-haptics");
  await Haptics.impactAsync(Haptics.ImpactFeedbackStyle[style]);
}

export async function notificationAsync(
  type: NotificationType = "Success",
): Promise<void> {
  if (Platform.OS === "web") return;
  const Haptics = require("expo-haptics");
  await Haptics.notificationAsync(Haptics.NotificationFeedbackType[type]);
}
