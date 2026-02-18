import { makeRedirectUri } from "expo-auth-session";
import * as WebBrowser from "expo-web-browser";
import { create } from "zustand";
import { supabase } from "../lib/supabase";
import { AuthState, User } from "../types";

// Required for Google OAuth redirect
WebBrowser.maybeCompleteAuthSession();

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  session: null,
  isLoading: true,
  isAuthenticated: false,

  signIn: async () => {
    set({ isLoading: true });
    try {
      // Use Expo's makeRedirectUri for proper deep linking
      const redirectUrl = makeRedirectUri({
        scheme: "goalcrew",
        path: "auth/callback",
      });

      console.log("Redirect URL:", redirectUrl);

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: redirectUrl,
          skipBrowserRedirect: true, // Changed to true - we handle the redirect
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
        },
      });

      if (error) throw error;

      // Open browser for OAuth flow
      if (data?.url) {
        const result = await WebBrowser.openAuthSessionAsync(
          data.url,
          redirectUrl,
        );

        console.log("OAuth result:", result);

        if (result.type === "success") {
          // Try to extract session from URL
          const url = result.url;

          // Supabase can return tokens in hash (#) or query (?)
          const hashParams = new URLSearchParams(url.split("#")[1] || "");
          const queryParams = new URLSearchParams(url.split("?")[1] || "");

          const accessToken =
            hashParams.get("access_token") || queryParams.get("access_token");
          const refreshToken =
            hashParams.get("refresh_token") || queryParams.get("refresh_token");

          console.log("Tokens found:", {
            accessToken: !!accessToken,
            refreshToken: !!refreshToken,
          });

          if (accessToken && refreshToken) {
            // Set the session
            const { data: sessionData, error: sessionError } =
              await supabase.auth.setSession({
                access_token: accessToken,
                refresh_token: refreshToken,
              });

            if (sessionError) throw sessionError;

            if (sessionData.user) {
              const profile = await fetchProfile(sessionData.user.id);
              set({
                user: profile,
                session: sessionData.session,
                isAuthenticated: true,
              });
              return; // Success!
            }
          }

          // If we didn't get tokens in the URL, check if session exists in Supabase
          console.log("No tokens in URL, checking current session...");
          const {
            data: { session },
            error: sessionError,
          } = await supabase.auth.getSession();

          if (sessionError) throw sessionError;

          if (session?.user) {
            console.log("Found existing session!");
            const profile = await fetchProfile(session.user.id);
            set({ user: profile, session, isAuthenticated: true });
          } else {
            throw new Error(
              "No se pudo obtener la sesión después de autenticar",
            );
          }
        } else if (result.type === "dismiss") {
          // Browser was closed/dismissed - check if session was created anyway
          console.log("Auth session dismissed, checking current session...");
          const {
            data: { session },
            error: sessionError,
          } = await supabase.auth.getSession();

          if (sessionError) throw sessionError;

          if (session?.user) {
            console.log("Found existing session after dismiss!");
            const profile = await fetchProfile(session.user.id);
            set({ user: profile, session, isAuthenticated: true });
          } else {
            throw new Error("Autenticación cancelada");
          }
        } else if (result.type === "cancel") {
          throw new Error("Autenticación cancelada");
        } else {
          throw new Error("Autenticación falló: " + result.type);
        }
      }
    } catch (error: any) {
      console.error("Google Sign In Error:", error);
      throw error;
    } finally {
      set({ isLoading: false });
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
  supabase.auth.getSession().then(async ({ data: { session } }) => {
    if (session?.user) {
      const profile = await fetchProfile(session.user.id);
      useAuthStore.setState({
        user: profile,
        session,
        isAuthenticated: true,
        isLoading: false,
      });
    } else {
      useAuthStore.setState({ isLoading: false });
    }
  });

  supabase.auth.onAuthStateChange(async (event, session) => {
    console.log("Auth state changed:", event);

    if (event === "SIGNED_IN" && session?.user) {
      const profile = await fetchProfile(session.user.id);
      useAuthStore.setState({ user: profile, session, isAuthenticated: true });
    } else if (event === "SIGNED_OUT") {
      useAuthStore.setState({
        user: null,
        session: null,
        isAuthenticated: false,
      });
    }
  });
}

async function fetchProfile(userId: string): Promise<User> {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", userId)
    .single();
  if (error) throw error;
  return data;
}
