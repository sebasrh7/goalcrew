import { create } from "zustand";
import { supabase } from "../lib/supabase";
import { AuthState, User } from "../types";
import { useSettingsStore } from "./settingsStore";

function getAvatarFromMetadata(
  metadata: Record<string, unknown> | undefined,
): string | null {
  const avatar =
    (metadata?.avatar_url as string | undefined) ??
    (metadata?.picture as string | undefined);
  return avatar || null;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  session: null,
  isLoading: true,
  isAuthenticated: false,

  signIn: async () => {
    // Do NOT set isLoading here — on web, signInWithOAuth redirects the browser
    // to Google. Setting isLoading would unmount the entire app (RootLayout
    // returns null when isLoading is true), killing the redirect before it fires.
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: window.location.origin,
        },
      });

      if (error) throw error;
      // The browser will redirect — auth state is handled by initAuthListener
    } catch (error: unknown) {
      throw error;
    }
  },

  signUp: async () => {
    return get().signIn();
  },

  signOut: async () => {
    const { resetSettings } = useSettingsStore.getState();
    resetSettings();

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

    const { error: rpcError } = await supabase.rpc("delete_own_account");
    if (rpcError) throw rpcError;

    const { resetSettings } = useSettingsStore.getState();
    resetSettings();

    await supabase.auth.signOut();
    set({ user: null, session: null, isAuthenticated: false });
  },
}));

// ─── Initialize auth listener ─────────────────────────────────────────────────
export function initAuthListener(): () => void {
  supabase.auth
    .getSession()
    .then(async ({ data: { session } }) => {
      if (session?.user) {
        try {
          const profile = await fetchProfile(session.user.id);
          const metadataAvatar = getAvatarFromMetadata(
            session.user.user_metadata as Record<string, unknown> | undefined,
          );
          let finalProfile = profile;

          if (!profile.avatar_url && metadataAvatar) {
            const { data: updated } = await supabase
              .from("users")
              .update({ avatar_url: metadataAvatar })
              .eq("id", session.user.id)
              .select()
              .single();

            if (updated) {
              finalProfile = updated;
            }
          }

          useAuthStore.setState({
            user: finalProfile,
            session,
            isAuthenticated: true,
            isLoading: false,
          });

          const { loadSettings } = useSettingsStore.getState();
          await loadSettings();
        } catch (error: unknown) {
          if (
            error &&
            typeof error === "object" &&
            "code" in error &&
            (error as { code: string }).code === "PGRST116"
          ) {
            await supabase.auth.signOut();
            useAuthStore.setState({
              user: null,
              session: null,
              isAuthenticated: false,
              isLoading: false,
            });
            return;
          }

          const email = session.user.email ?? "";
          const fallbackUser: User = {
            id: session.user.id,
            email,
            name:
              session.user.user_metadata?.full_name ||
              session.user.user_metadata?.name ||
              email.split("@")[0] ||
              "User",
            avatar_url: getAvatarFromMetadata(
              session.user.user_metadata as Record<string, unknown> | undefined,
            ),
            created_at: session.user.created_at,
          };
          useAuthStore.setState({
            user: fallbackUser,
            session,
            isAuthenticated: true,
            isLoading: false,
          });

          const { loadSettings } = useSettingsStore.getState();
          await loadSettings();
        }
      } else {
        useAuthStore.setState({ isLoading: false });
      }
    })
    .catch(() => {
      // Ensure isLoading is cleared even if getSession rejects (e.g. network error)
      useAuthStore.setState({ isLoading: false });
    });

  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange(async (event, session) => {
    if (event === "SIGNED_IN" && session?.user) {
      await new Promise((resolve) => setTimeout(resolve, 300));

      try {
        const profile = await fetchProfile(session.user.id);
        useAuthStore.setState({
          user: profile,
          session,
          isAuthenticated: true,
          isLoading: false,
        });

        const { loadSettings } = useSettingsStore.getState();
        await loadSettings();
      } catch {
        const email = session.user.email ?? "";
        const newUser: Omit<User, "created_at"> & { created_at?: string } = {
          id: session.user.id,
          email,
          name:
            session.user.user_metadata?.full_name ||
            session.user.user_metadata?.name ||
            email.split("@")[0] ||
            "User",
          avatar_url: getAvatarFromMetadata(
            session.user.user_metadata as Record<string, unknown> | undefined,
          ),
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
          console.warn("Could not create profile, using fallback:", insertError.message);
        }

        useAuthStore.setState({
          user: finalUser,
          session,
          isAuthenticated: true,
          isLoading: false,
        });

        const { loadSettings } = useSettingsStore.getState();
        await loadSettings();
      }
    } else if (event === "SIGNED_OUT") {
      const { resetSettings } = useSettingsStore.getState();
      resetSettings();

      useAuthStore.setState({
        user: null,
        session: null,
        isAuthenticated: false,
      });
    }
  });

  return () => {
    subscription.unsubscribe();
  };
}

async function fetchProfile(userId: string): Promise<User> {
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
}
