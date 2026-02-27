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
  contribution_reminders: boolean;
  achievement_notifications: boolean;
  created_at?: string;
  updated_at?: string;
}

interface SettingsStore {
  settings: UserSettings;
  isLoading: boolean;
  needsCurrencySetup: boolean;

  // Actions
  loadSettings: () => Promise<void>;
  updateSettings: (newSettings: Partial<UserSettings>) => Promise<void>;
  resetSettings: () => void;
  dismissCurrencySetup: () => void;
}

const defaultSettings: UserSettings = {
  language: "es",
  currency: "USD",
  theme: "light",
  push_notifications: true,
  contribution_reminders: true,
  achievement_notifications: true,
};

export const useSettingsStore = create<SettingsStore>((set, get) => ({
  settings: defaultSettings,
  isLoading: false,
  needsCurrencySetup: false,

  loadSettings: async () => {
    try {
      set({ isLoading: true });

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        set({ settings: defaultSettings, isLoading: false });
        return;
      }

      const { data, error } = await supabase
        .from("user_settings")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (error && error.code !== "PGRST116") {
        set({ settings: defaultSettings, isLoading: false });
        return;
      }

      if (!data) {
        // Create default settings for new user — auto-detect device locale
        const detected = detectDeviceLocale();
        console.log(
          "[settings] New user — detected locale:",
          JSON.stringify(detected),
        );
        const autoSettings: Partial<UserSettings> = {
          language: detected.language,
          currency: detected.currency as UserSettings["currency"],
        };
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
          set({ settings: defaultSettings, isLoading: false });
          return;
        }

        set({
          settings: newSettings || mergedDefaults,
          isLoading: false,
          needsCurrencySetup: true,
        });
        return;
      }

      // Sync global language with loaded settings
      changeLanguage(data.language || "es");

      set({ settings: data, isLoading: false });
    } catch (error: unknown) {
      set({ settings: defaultSettings, isLoading: false });
    }
  },

  updateSettings: async (newSettings: Partial<UserSettings>) => {
    // No usar isLoading aquí — eso es para la carga inicial.
    // El componente maneja su propio isSaving.
    const currentSettings = get().settings;
    const updatedSettings = { ...currentSettings, ...newSettings };

    // Optimistic update — UI refleja el cambio de inmediato
    set({ settings: updatedSettings });

    // Sincronizar idioma global de inmediato
    if (newSettings.language) {
      changeLanguage(newSettings.language);
    }

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("user_settings")
        .upsert({ user_id: user.id, ...newSettings }, { onConflict: "user_id" })
        .select()
        .single();

      if (error) {
        // Revertir al estado anterior si falla
        set({ settings: currentSettings });
        throw new Error(error.message || "SETTINGS_UPDATE_FAILED");
      }

      // Sincronizar con lo que devolvió la BD
      set({ settings: data || updatedSettings });
    } catch (error: unknown) {
      // Revertir idioma si falló
      if (newSettings.language) {
        changeLanguage(currentSettings.language);
      }
      set({ settings: currentSettings });
      throw error;
    }
  },

  dismissCurrencySetup: () => {
    set({ needsCurrencySetup: false });
  },

  resetSettings: () => {
    set({
      settings: defaultSettings,
      isLoading: false,
      needsCurrencySetup: false,
    });
  },
}));
