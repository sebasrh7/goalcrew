import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { create } from "zustand";
import { supabase } from "../lib/supabase";
import { AuthState, User } from "../types";
import { useSettingsStore } from "./settingsStore";

// Configure Google Sign-In
const googleWebClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ?? "";
GoogleSignin.configure({
  webClientId: googleWebClientId,
  scopes: ["openid", "profile", "email"],
});

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  session: null,
  isLoading: true,
  isAuthenticated: false,

  signIn: async () => {
    set({ isLoading: true });
    try {
      // Check if Google Play Services are available
      await GoogleSignin.hasPlayServices();

      // Sign in with Google
      const userInfo = await GoogleSignin.signIn();

      // Get ID token
      const tokens = await GoogleSignin.getTokens();
      const idToken = tokens.idToken;

      if (!idToken) {
        throw new Error("No ID token received from Google");
      }

      // Sign in to Supabase with the ID token
      const { data, error } = await supabase.auth.signInWithIdToken({
        provider: "google",
        token: idToken,
      });

      if (error) throw error;

      // Wait for session to be fully established
      let {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        // Retry once after a short delay
        await new Promise((resolve) => setTimeout(resolve, 500));
        const { data: retryData } = await supabase.auth.getSession();
        session = retryData.session;
        if (!session) {
          throw new Error("Session not found after sign in");
        }
      }

      // Fetch profile with confirmed session
      try {
        const profile = await fetchProfile(session.user.id);

        set({
          user: profile,
          session,
          isAuthenticated: true,
          isLoading: false,
        });

        // Load user settings after successful auth
        const { loadSettings } = useSettingsStore.getState();
        await loadSettings();
      } catch (profileError: any) {
        // Profile doesn't exist (deleted account re-signing in) — create it
        const newUser: Omit<User, "created_at"> & { created_at?: string } = {
          id: session.user.id,
          email: session.user.email!,
          name:
            session.user.user_metadata?.full_name ||
            session.user.user_metadata?.name ||
            session.user.email!.split("@")[0],
          avatar_url: session.user.user_metadata?.avatar_url || null,
        };

        const { data: createdProfile, error: insertError } = await supabase
          .from("users")
          .upsert(newUser, { onConflict: "id" })
          .select()
          .single();

        const finalUser: User = createdProfile || {
          ...newUser,
          created_at: new Date().toISOString(),
        };

        if (insertError) {
          // Could not create profile, using fallback
        }

        set({
          user: finalUser,
          session,
          isAuthenticated: true,
          isLoading: false,
        });

        // Load user settings even with fallback user
        const { loadSettings } = useSettingsStore.getState();
        await loadSettings();
      }
    } catch (error: any) {
      set({ isLoading: false });
      throw error;
    }
  },

  signUp: async () => {
    // Google OAuth handles both sign in and sign up
    return get().signIn();
  },

  signOut: async () => {
    // Reset settings to defaults
    const { resetSettings } = useSettingsStore.getState();
    resetSettings();

    // Sign out from Google so account picker shows next time
    try {
      await GoogleSignin.signOut();
    } catch (_e) {
      // Google signOut failed (non-critical)
    }

    await supabase.auth.signOut();
    set({ user: null, session: null, isAuthenticated: false });
  },

  updateProfile: async (data: Partial<User>) => {
    const { user } = get();
    if (!user) return;

    const { data: updated, error } = await supabase
      .from("users")
      .update(data)
      .eq("id", user.id)
      .select()
      .single();
    if (error) throw error;
    set({ user: updated });
  },

  deleteAccount: async () => {
    const { user } = get();
    if (!user) throw new Error("No user found");

    // Call server-side function that bypasses RLS to delete all user data
    const { error: rpcError } = await supabase.rpc("delete_own_account");

    if (rpcError) {
      throw rpcError;
    }

    // Reset local state and sign out
    const { resetSettings } = useSettingsStore.getState();
    resetSettings();
    await supabase.auth.signOut();
    set({ user: null, session: null, isAuthenticated: false });
  },
}));

// ─── Initialize auth listener ─────────────────────────────────────────────────
export function initAuthListener() {
  supabase.auth.getSession().then(async ({ data: { session } }) => {
    if (session?.user) {
      try {
        const profile = await fetchProfile(session.user.id);
        useAuthStore.setState({
          user: profile,
          session,
          isAuthenticated: true,
          isLoading: false,
        });

        // Load user settings after profile is loaded
        const { loadSettings } = useSettingsStore.getState();
        await loadSettings();
      } catch (error: any) {
        // If profile not found (PGRST116 = 0 rows), the account was deleted — sign out
        if (error?.code === "PGRST116") {
          await supabase.auth.signOut();
          useAuthStore.setState({
            user: null,
            session: null,
            isAuthenticated: false,
            isLoading: false,
          });
          return;
        }

        // Fallback: use session data
        const fallbackUser: User = {
          id: session.user.id,
          email: session.user.email!,
          name:
            session.user.user_metadata?.full_name ||
            session.user.user_metadata?.name ||
            session.user.email!.split("@")[0],
          avatar_url: session.user.user_metadata?.avatar_url || null,
          created_at: session.user.created_at,
        };
        useAuthStore.setState({
          user: fallbackUser,
          session,
          isAuthenticated: true,
          isLoading: false,
        });

        // Load user settings even with fallback user
        const { loadSettings } = useSettingsStore.getState();
        await loadSettings();
      }
    } else {
      useAuthStore.setState({ isLoading: false });
    }
  });

  supabase.auth.onAuthStateChange(async (event, session) => {
    if (event === "SIGNED_IN" && session?.user) {
      // Add a delay to ensure session is fully propagated in Supabase client
      await new Promise((resolve) => setTimeout(resolve, 1000));

      try {
        const profile = await fetchProfile(session.user.id);
        useAuthStore.setState({
          user: profile,
          session,
          isAuthenticated: true,
          isLoading: false,
        });

        // Load user settings
        const { loadSettings } = useSettingsStore.getState();
        await loadSettings();
      } catch (error: any) {
        // Profile missing — create it (re-sign-in after account deletion)
        const newUser: Omit<User, "created_at"> & { created_at?: string } = {
          id: session.user.id,
          email: session.user.email!,
          name:
            session.user.user_metadata?.full_name ||
            session.user.user_metadata?.name ||
            session.user.email!.split("@")[0],
          avatar_url: session.user.user_metadata?.avatar_url || null,
        };

        const { data: createdProfile, error: insertError } = await supabase
          .from("users")
          .upsert(newUser, { onConflict: "id" })
          .select()
          .single();

        const finalUser: User = createdProfile || {
          ...newUser,
          created_at: new Date().toISOString(),
        };

        if (insertError) {
          // Could not create profile, using fallback
        }

        useAuthStore.setState({
          user: finalUser,
          session,
          isAuthenticated: true,
          isLoading: false,
        });

        // Load user settings even with fallback user
        const { loadSettings } = useSettingsStore.getState();
        await loadSettings();
      }
    } else if (event === "SIGNED_OUT") {
      // Reset settings to defaults
      const { resetSettings } = useSettingsStore.getState();
      resetSettings();

      useAuthStore.setState({
        user: null,
        session: null,
        isAuthenticated: false,
      });
    }
  });
}

async function fetchProfile(userId: string): Promise<User> {
  try {
    // Ensure we have a valid session before querying
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      throw new Error("No active session - cannot fetch profile");
    }

    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) throw error;
    if (!data) throw new Error("User profile not found");

    return data;
  } catch (error: any) {
    throw error;
  }
}
