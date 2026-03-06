import { useColorScheme } from "react-native";
import { useSettingsStore } from "../store/settingsStore";
import { resolveTheme, ThemeColors } from "./theme";
import { darkTheme } from "./theme";

/**
 * Hook that returns the current theme colors based on user preference.
 * Use this instead of importing Colors directly from constants.
 */
export function useColors(): ThemeColors {
  const theme = useSettingsStore((s) => s.settings.theme);
  const systemScheme = useColorScheme();
  const systemDark = systemScheme === "dark";
  return resolveTheme(theme, systemDark);
}

/** Static fallback for non-component contexts (StyleSheet defaults, etc.) */
export { darkTheme as StaticColors };
