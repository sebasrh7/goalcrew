import { AchievementType } from "../types";

// Visual config for achievements — text comes from i18n via getAchievementText()
interface AchievementVisualConfig {
  type: AchievementType;
  icon: string;
  color: string;
}

// Sentinel value for "no period completed yet"
export const INITIAL_PERIOD = -1;

// ─── Colors ──────────────────────────────────────────────────────────────────
export const Colors = {
  bg: "#0b0f1a",
  surface: "#141929",
  surface2: "#1c2338",
  surface3: "#232c42",
  accent: "#6c63ff",
  accent2: "#a78bfa",
  green: "#22d3a0",
  yellow: "#f59e0b",
  red: "#f87171",
  text: "#f0f2ff",
  text2: "#8892b0",
  text3: "#4a5578",

  // Status colors
  onTrack: "#22d3a0",
  atRisk: "#f59e0b",
  behind: "#f87171",

  // Gradients (use with LinearGradient)
  gradientPrimary: ["#6c63ff", "#a78bfa"] as const,
  gradientSuccess: ["#22d3a0", "#059669"] as const,
  gradientWarning: ["#f59e0b", "#d97706"] as const,
  gradientDanger: ["#f87171", "#dc2626"] as const,
  gradientHero: ["#1a1555", "#0f1729", "#0b0f1a"] as const,
} as const;

// ─── Spacing ─────────────────────────────────────────────────────────────────
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 28,
  xxxl: 40,
} as const;

// ─── Border Radius ───────────────────────────────────────────────────────────
export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 28,
  full: 9999,
} as const;

// ─── Typography ──────────────────────────────────────────────────────────────
export const FontSize = {
  xs: 11,
  sm: 12,
  base: 14,
  md: 15,
  lg: 17,
  xl: 20,
  xxl: 24,
  xxxl: 28,
  display: 32,
} as const;

// ─── Achievements ────────────────────────────────────────────────────────────
// Visual config only — use getAchievementText() from i18n for localized title/description
export const ACHIEVEMENTS: Record<AchievementType, AchievementVisualConfig> = {
  first_contribution: { type: "first_contribution", icon: "flash", color: "#FBBF24" },
  streak_3: { type: "streak_3", icon: "flame", color: "#FF6B35" },
  streak_7: { type: "streak_7", icon: "flame", color: "#FF6B35" },
  streak_30: { type: "streak_30", icon: "flame", color: "#DC2626" },
  first_50_percent: { type: "first_50_percent", icon: "rocket", color: "#6C63FF" },
  goal_completed: { type: "goal_completed", icon: "checkmark-circle", color: "#22D3A0" },
  most_consistent: { type: "most_consistent", icon: "trophy", color: "#FBBF24" },
  early_bird: { type: "early_bird", icon: "sunny", color: "#F97316" },
  big_saver: { type: "big_saver", icon: "diamond", color: "#8B5CF6" },
};

// ─── Points System ───────────────────────────────────────────────────────────
export const POINTS = {
  PER_DOLLAR: 0.25, // 0.25 pts per dollar saved
  STREAK_BONUS: 5, // extra pts per streak day
  ACHIEVEMENT_BONUS: 50, // pts for unlocking an achievement
} as const;

// ─── Level System ────────────────────────────────────────────────────────────
// Each level requires more points than the last
export const LEVEL_THRESHOLDS = [
  0, // Level 1: 0 pts
  50, // Level 2: 50 pts
  150, // Level 3: 150 pts
  350, // Level 4: 350 pts
  600, // Level 5: 600 pts
  1000, // Level 6: 1000 pts
  1500, // Level 7: 1500 pts
  2500, // Level 8: 2500 pts
  4000, // Level 9: 4000 pts
  6000, // Level 10: 6000 pts
] as const;

export interface LevelConfig {
  icon: string; // Ionicons name
  color: string;
  gradient: readonly [string, string];
}

export const LEVEL_CONFIGS: LevelConfig[] = [
  { icon: "leaf", color: "#9CA3AF", gradient: ["#9CA3AF", "#6B7280"] },       // 1
  { icon: "leaf", color: "#22D3A0", gradient: ["#22D3A0", "#059669"] },       // 2
  { icon: "shield-half", color: "#60A5FA", gradient: ["#60A5FA", "#2563EB"] },// 3
  { icon: "shield", color: "#818CF8", gradient: ["#818CF8", "#6366F1"] },     // 4
  { icon: "star-half", color: "#FBBF24", gradient: ["#FBBF24", "#D97706"] },  // 5
  { icon: "star", color: "#F59E0B", gradient: ["#F59E0B", "#B45309"] },       // 6
  { icon: "diamond", color: "#A78BFA", gradient: ["#A78BFA", "#7C3AED"] },    // 7
  { icon: "diamond", color: "#C084FC", gradient: ["#C084FC", "#9333EA"] },    // 8
  { icon: "flame", color: "#F87171", gradient: ["#F87171", "#DC2626"] },      // 9
  { icon: "skull", color: "#FCD34D", gradient: ["#FCD34D", "#F59E0B"] },      // 10
];

export function getLevelConfig(level: number): LevelConfig {
  return LEVEL_CONFIGS[Math.min(level, LEVEL_CONFIGS.length) - 1];
}

export function getUserLevel(totalPoints: number): {
  level: number;
  currentXP: number;
  nextLevelXP: number;
  progress: number;
} {
  let level = 1;
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (totalPoints >= LEVEL_THRESHOLDS[i]) {
      level = i + 1;
      break;
    }
  }
  const currentThreshold = LEVEL_THRESHOLDS[level - 1] ?? 0;
  const nextThreshold = LEVEL_THRESHOLDS[level] ?? currentThreshold + 2000;
  const currentXP = totalPoints - currentThreshold;
  const nextLevelXP = nextThreshold - currentThreshold;
  const progress = nextLevelXP > 0 ? Math.min(1, currentXP / nextLevelXP) : 1;
  return { level, currentXP, nextLevelXP, progress };
}

// ─── Status Logic ─────────────────────────────────────────────────────────────
export function getMemberStatus(
  currentAmount: number,
  individualGoal: number,
  daysElapsed: number,
  totalDays: number,
): "on_track" | "at_risk" | "behind" {
  if (totalDays === 0) return "on_track";
  const expectedProgress = (daysElapsed / totalDays) * individualGoal;
  if (expectedProgress <= 0) return "on_track";
  const ratio = currentAmount / expectedProgress;
  if (ratio >= 0.9) return "on_track";
  if (ratio >= 0.6) return "at_risk";
  return "behind";
}

// ─── Group Icons ────────────────────────────────────────────────────────────
export const GROUP_ICONS = [
  { name: "sunny", color: "#00B4D8", labelKey: "iconVacation" },
  { name: "briefcase", color: "#6C757D", labelKey: "iconWork" },
  { name: "snow", color: "#0077BE", labelKey: "iconWinter" },
  { name: "airplane", color: "#6C63FF", labelKey: "iconTravel" },
  { name: "car-sport", color: "#DC2626", labelKey: "iconCar" },
  { name: "boat", color: "#059669", labelKey: "iconBoat" },
  { name: "train", color: "#7C2D12", labelKey: "iconTrain" },
  { name: "camera", color: "#DB2777", labelKey: "iconPhoto" },
  { name: "restaurant", color: "#EA580C", labelKey: "iconFood" },
  { name: "home", color: "#16A34A", labelKey: "iconHome" },
  { name: "heart", color: "#E11D48", labelKey: "iconHealth" },
  { name: "star", color: "#FBBF24", labelKey: "iconGoal" },
];

// ─── Error helper ─────────────────────────────────────────────────────────────
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return String(error);
}

// ─── Web App URL ──────────────────────────────────────────────────────────────
const WEB_APP_URL =
  process.env.EXPO_PUBLIC_WEB_APP_URL ?? "https://goalcrew.vercel.app";

/** Build a full invite URL that opens the join screen on the web app */
export function getInviteUrl(inviteCode: string): string {
  return `${WEB_APP_URL}/group/join?code=${encodeURIComponent(inviteCode)}`;
}

/** Extract an invite code from a URL or plain text */
export function extractInviteCode(data: string): string | null {
  // Try to extract ?code= from URL
  try {
    const url = new URL(data);
    const code = url.searchParams.get("code");
    if (code && code.length >= 6) return code.toUpperCase().slice(0, 8);
  } catch {
    // Not a URL — treat as plain code
  }
  // Fallback: clean raw text
  const clean = data
    .replace(/[^A-Za-z0-9]/g, "")
    .toUpperCase()
    .slice(0, 8);
  return clean.length >= 6 ? clean : null;
}
