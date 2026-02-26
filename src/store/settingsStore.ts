import { create } from "zustand";
import { changeLanguage } from "../lib/i18n";
import { detectDeviceLocale } from "../lib/locale";
import { supabase } from "../lib/supabase";

export interface UserSettings {
  id?: string;
  user_id?: string;
  language: "es" | "en" | "fr";
  currency:
    | "USD"
    | "EUR"
    | "COP"
    | "MXN"
    | "ARS"
    | "CLP"
    | "PEN"
    | "BRL"
    | "GBP";
  theme: "light" | "dark" | "auto";
  push_notifications: boolean;
  email_notifications: boolean;
  contribution_reminders: boolean;
  achievement_notifications: boolean;
  public_profile: boolean;
  show_achievements: boolean;
  show_stats: boolean;
  created_at?: string;
  updated_at?: string;
}

interface SettingsStore {
  settings: UserSettings;
  isLoading: boolean;

  // Actions
  loadSettings: () => Promise<void>;
  updateSettings: (newSettings: Partial<UserSettings>) => Promise<void>;
  resetSettings: () => void;
}

const defaultSettings: UserSettings = {
  language: "es",
  currency: "USD",
  theme: "light",
  push_notifications: true,
  email_notifications: true,
  contribution_reminders: true,
  achievement_notifications: true,
  public_profile: true,
  show_achievements: true,
  show_stats: true,
};

export const useSettingsStore = create<SettingsStore>((set, get) => ({
  settings: defaultSettings,
  isLoading: false,

  loadSettings: async () => {
    try {
      set({ isLoading: true });

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        console.warn("⚠️ No user found for loadSettings");
        set({ settings: defaultSettings, isLoading: false });
        return;
      }

      console.log("📥 Loading user settings for:", user.id);

      const { data, error } = await supabase
        .from("user_settings")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (error && error.code !== "PGRST116") {
        console.error("❌ Error loading settings:", error);
        set({ settings: defaultSettings, isLoading: false });
        return;
      }

      if (!data) {
        // Create default settings for new user — auto-detect device locale
        console.log("🆕 Creating default settings for new user");
        const detected = detectDeviceLocale();
        const autoSettings: Partial<UserSettings> = {
          language: detected.language,
          currency: detected.currency as UserSettings["currency"],
        };
        console.log("🌍 Auto-detected settings:", autoSettings);
        changeLanguage(detected.language);

        const mergedDefaults = { ...defaultSettings, ...autoSettings };
        const { data: newSettings, error: createError } = await supabase
          .from("user_settings")
          .upsert(
            { user_id: user.id, ...mergedDefaults },
            { onConflict: "user_id" },
          )
          .select()
          .single();

        if (createError) {
          console.error("❌ Error creating settings:", createError);
          set({ settings: defaultSettings, isLoading: false });
          return;
        }

        set({ settings: newSettings || mergedDefaults, isLoading: false });
        return;
      }

      console.log("✅ Settings loaded successfully");
      // Sync global language with loaded settings
      changeLanguage(data.language || "es");
      set({ settings: data, isLoading: false });
    } catch (error: any) {
      console.error("❌ Exception loading settings:", error);
      set({ settings: defaultSettings, isLoading: false });
    }
  },

  updateSettings: async (newSettings: Partial<UserSettings>) => {
    try {
      set({ isLoading: true });

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        console.warn("⚠️ No user found for updateSettings");
        set({ isLoading: false });
        return;
      }

      const currentSettings = get().settings;
      const updatedSettings = { ...currentSettings, ...newSettings };

      console.log("📤 Updating settings:", newSettings);

      const { data, error } = await supabase
        .from("user_settings")
        .update(newSettings)
        .eq("user_id", user.id)
        .select()
        .single();

      if (error) {
        console.error("❌ Error updating settings:", error);
        set({ isLoading: false });
        return;
      }

      console.log("✅ Settings updated successfully");
      set({ settings: data || updatedSettings, isLoading: false });
    } catch (error: any) {
      console.error("❌ Exception updating settings:", error);
      set({ isLoading: false });
    }
  },

  resetSettings: () => {
    set({ settings: defaultSettings, isLoading: false });
  },
}));
