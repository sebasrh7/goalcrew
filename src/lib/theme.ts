import { Colors } from "../constants";

export interface ThemeColors {
  bg: string;
  surface: string;
  surface2: string;
  surface3: string;
  accent: string;
  accent2: string;
  green: string;
  yellow: string;
  red: string;
  text: string;
  text2: string;
  text3: string;
  onTrack: string;
  atRisk: string;
  behind: string;
  gradientPrimary: readonly [string, string];
  gradientSuccess: readonly [string, string];
  gradientWarning: readonly [string, string];
  gradientDanger: readonly [string, string];
  gradientHero: readonly [string, string, string];
}

export const darkTheme: ThemeColors = {
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
  onTrack: "#22d3a0",
  atRisk: "#fbbf24",
  behind: "#f87171",
  gradientPrimary: ["#6c63ff", "#a78bfa"],
  gradientSuccess: ["#22d3a0", "#059669"],
  gradientWarning: ["#fbbf24", "#d97706"],
  gradientDanger: ["#f87171", "#dc2626"],
  gradientHero: ["#1a1555", "#0f1729", "#0b0f1a"],
};

export const lightTheme: ThemeColors = {
  bg: "#f8f9fc",
  surface: "#ffffff",
  surface2: "#f0f1f5",
  surface3: "#e2e4ec",
  accent: "#6c63ff",
  accent2: "#7c6bff",
  green: "#059669",
  yellow: "#d97706",
  red: "#dc2626",
  text: "#1a1d2e",
  text2: "#5a6078",
  text3: "#9ca3b8",
  onTrack: "#059669",
  atRisk: "#d97706",
  behind: "#dc2626",
  gradientPrimary: ["#6c63ff", "#8b7dff"],
  gradientSuccess: ["#059669", "#0d9488"],
  gradientWarning: ["#d97706", "#f59e0b"],
  gradientDanger: ["#dc2626", "#ef4444"],
  gradientHero: ["#e8e6ff", "#f0f1f5", "#f8f9fc"],
};

/** Resolve effective theme based on user preference */
export function resolveTheme(
  preference: "light" | "dark" | "auto",
  systemDark: boolean,
): ThemeColors {
  if (preference === "auto") {
    return systemDark ? darkTheme : lightTheme;
  }
  return preference === "dark" ? darkTheme : lightTheme;
}
