import { AchievementConfig, AchievementType } from "../types";

// ─── Colors ──────────────────────────────────────────────────────────────────
export const Colors = {
  bg: "#0b0f1a",
  surface: "#141929",
  surface2: "#1c2338",
  surface3: "#232c42",
  accent: "#6c63ff",
  accent2: "#a78bfa",
  green: "#22d3a0",
  yellow: "#fbbf24",
  red: "#f87171",
  text: "#f0f2ff",
  text2: "#8892b0",
  text3: "#4a5578",

  // Status colors
  onTrack: "#22d3a0",
  atRisk: "#fbbf24",
  behind: "#f87171",

  // Gradients (use with LinearGradient)
  gradientPrimary: ["#6c63ff", "#a78bfa"] as const,
  gradientSuccess: ["#22d3a0", "#059669"] as const,
  gradientWarning: ["#fbbf24", "#d97706"] as const,
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
export const ACHIEVEMENTS: Record<AchievementType, AchievementConfig> = {
  first_contribution: {
    type: "first_contribution",
    icon: "flash",
    color: "#FBBF24",
    title: "Inicio rápido",
    description: "Registraste tu primer aporte",
  },
  streak_3: {
    type: "streak_3",
    icon: "flame",
    color: "#FF6B35",
    title: "3 en raya",
    description: "3 días consecutivos ahorrando",
  },
  streak_7: {
    type: "streak_7",
    icon: "flame",
    color: "#FF6B35",
    title: "Semana de fuego",
    description: "7 días consecutivos ahorrando",
  },
  streak_30: {
    type: "streak_30",
    icon: "flame",
    color: "#DC2626",
    title: "Mes imparable",
    description: "30 días consecutivos ahorrando",
  },
  first_50_percent: {
    type: "first_50_percent",
    icon: "rocket",
    color: "#6C63FF",
    title: "Primero al 50%",
    description: "Fuiste el primero en llegar al 50%",
  },
  goal_completed: {
    type: "goal_completed",
    icon: "checkmark-circle",
    color: "#22D3A0",
    title: "Meta cumplida",
    description: "¡Llegaste al 100% de tu meta!",
  },
  most_consistent: {
    type: "most_consistent",
    icon: "trophy",
    color: "#FBBF24",
    title: "Más constante",
    description: "El miembro más consistente del grupo",
  },
  early_bird: {
    type: "early_bird",
    icon: "sunrise",
    color: "#F97316",
    title: "Early bird",
    description: "Completaste la meta antes de tiempo",
  },
  big_saver: {
    type: "big_saver",
    icon: "diamond",
    color: "#8B5CF6",
    title: "Gran aportador",
    description: "Registraste un aporte mayor a $100",
  },
};

// ─── Points System ───────────────────────────────────────────────────────────
export const POINTS = {
  PER_DOLLAR: 0.25, // 0.25 pts per dollar saved
  STREAK_BONUS: 5, // extra pts per streak day
  ACHIEVEMENT_BONUS: 50, // pts for unlocking an achievement
} as const;

export function calculatePoints(amount: number, streakDays: number): number {
  const base = Math.round(amount * POINTS.PER_DOLLAR);
  const streakBonus = streakDays > 0 ? POINTS.STREAK_BONUS : 0;
  return base + streakBonus;
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
  const ratio = currentAmount / expectedProgress;
  if (ratio >= 0.9) return "on_track";
  if (ratio >= 0.6) return "at_risk";
  return "behind";
}

// ─── Frequency Labels ────────────────────────────────────────────────────────
export const FREQUENCY_LABELS = {
  daily: "Diario",
  weekly: "Semanal",
  monthly: "Mensual",
} as const;

// ─── Trip Icons ─────────────────────────────────────────────────────────────
export const TRIP_ICONS = [
  { name: "beach", color: "#00B4D8" },
  { name: "business", color: "#6C757D" },
  { name: "snow", color: "#0077BE" },
  { name: "airplane", color: "#6C63FF" },
  { name: "car-sport", color: "#DC2626" },
  { name: "boat", color: "#059669" },
  { name: "train", color: "#7C2D12" },
  { name: "camera", color: "#DB2777" },
  { name: "restaurant", color: "#EA580C" },
  { name: "home", color: "#16A34A" },
  { name: "heart", color: "#E11D48" },
  { name: "star", color: "#FBBF24" },
];
