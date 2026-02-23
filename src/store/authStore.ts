import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { create } from "zustand";
import { supabase } from "../lib/supabase";
import { AuthState, User } from "../types";

// Configure Google Sign-In
GoogleSignin.configure({
  webClientId:
    "803759521905-es63ftjlvu5ugi4sot4johes0bthdq4b.apps.googleusercontent.com",
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
      console.log("🚀 Starting Google Sign In...");

      // Check if Google Play Services are available
      await GoogleSignin.hasPlayServices();

      // Sign in with Google
      const userInfo = await GoogleSignin.signIn();

      console.log("✅ Google Sign In successful");
      console.log("👤 User:", userInfo.data?.user.email);

      // Get ID token
      const tokens = await GoogleSignin.getTokens();
      const idToken = tokens.idToken;

      if (!idToken) {
        throw new Error("No ID token received from Google");
      }

      console.log("🔑 Got ID token from Google");

      // Sign in to Supabase with the ID token
      const { data, error } = await supabase.auth.signInWithIdToken({
        provider: "google",
        token: idToken,
      });

      if (error) throw error;

      console.log("✅ Signed in to Supabase");

      // Force refresh session to ensure JWT is properly set
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        throw new Error("Session not found after sign in");
      }

      console.log("🔐 Session confirmed:", session.user.id);
      console.log("⏳ Loading profile...");

      // Fetch profile with confirmed session
      try {
        const profile = await fetchProfile(session.user.id);
        set({
          user: profile,
          session,
          isAuthenticated: true,
          isLoading: false,
        });
      } catch (profileError: any) {
        console.warn(
          "⚠️ Could not fetch profile on sign in:",
          profileError.message,
        );
        // Use fallback
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
        set({
          user: fallbackUser,
          session,
          isAuthenticated: true,
          isLoading: false,
        });
      }
    } catch (error: any) {
      console.error("❌ Sign In Error:", error.message);
      set({ isLoading: false });
      throw error;
    }
  },

  signUp: async () => {
    // Google OAuth handles both sign in and sign up
    return get().signIn();
  },

  signOut: async () => {
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
}));

// ─── Initialize auth listener ─────────────────────────────────────────────────
export function initAuthListener() {
  console.log("🎯 Initializing auth listener...");

  supabase.auth.getSession().then(async ({ data: { session } }) => {
    console.log(
      "📋 Initial session check:",
      session ? "Session exists" : "No session",
    );

    if (session?.user) {
      console.log("👤 User found in session:", session.user.id);
      try {
        const profile = await fetchProfile(session.user.id);
        useAuthStore.setState({
          user: profile,
          session,
          isAuthenticated: true,
          isLoading: false,
        });
      } catch (error: any) {
        console.error(
          "⚠️ Could not load profile on init, using session data:",
          error.message,
        );
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
      }
    } else {
      console.log("❌ No user in session");
      useAuthStore.setState({ isLoading: false });
    }
  });

  supabase.auth.onAuthStateChange(async (event, session) => {
    console.log("🔔 Auth state changed:", event);

    if (event === "SIGNED_IN" && session?.user) {
      console.log("✅ User signed in:", session.user.id);

      // Add a delay to ensure session is fully propagated in Supabase client
      await new Promise((resolve) => setTimeout(resolve, 1000));

      try {
        const profile = await fetchProfile(session.user.id);
        console.log("✅ Profile loaded, updating state...");
        useAuthStore.setState({
          user: profile,
          session,
          isAuthenticated: true,
          isLoading: false,
        });
      } catch (error: any) {
        console.error("⚠️ Could not load profile:", error.message);
        // Fallback: use session data to construct a minimal user object
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
      }
    } else if (event === "SIGNED_OUT") {
      console.log("👋 User signed out");
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
    console.log("📥 Fetching profile for:", userId);

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

    if (error) {
      console.error("Error fetching profile:", error);
      throw error;
    }

    if (!data) {
      console.error("No profile found for user:", userId);
      throw new Error("User profile not found");
    }

    console.log("✅ Profile fetched successfully:", data);
    return data;
  } catch (error: any) {
    console.error("❌ fetchProfile error:", error.message);
    throw error;
  }
}
