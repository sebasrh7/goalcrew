import { Stack, useRouter } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect, useRef } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { ErrorBoundary } from "../src/components/ErrorBoundary";
import { changeLanguage } from "../src/lib/i18n";
import {
  addNotificationListeners,
  initializeNotifications,
} from "../src/lib/notifications";
import { initAuthListener, useAuthStore } from "../src/store/authStore";
import { useSettingsStore } from "../src/store/settingsStore";

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { isLoading, isAuthenticated } = useAuthStore();
  const { settings } = useSettingsStore();
  const router = useRouter();
  const notifCleanup = useRef<(() => void) | null>(null);

  useEffect(() => {
    // Initialize Supabase auth listener
    const cleanup = initAuthListener();
    return cleanup;
  }, []);

  useEffect(() => {
    // Apply language settings when they change
    if (settings?.language) {
      changeLanguage(settings.language);
    }
  }, [settings?.language]);

  // Initialize notifications after authentication
  useEffect(() => {
    if (!isAuthenticated || !settings) return;

    initializeNotifications({
      push_notifications: settings.push_notifications,
      contribution_reminders: settings.contribution_reminders,
      language: settings.language,
    }).catch(() => {});

    // Setup notification listeners
    notifCleanup.current = addNotificationListeners(
      undefined, // onReceived — handled by handler
      (response) => {
        // Navigate to the relevant screen when user taps a notification
        const data = response.notification.request.content.data;
        if (data?.groupId) {
          router.push(`/group/${data.groupId}`);
        }
      },
    );

    return () => {
      notifCleanup.current?.();
    };
  }, [
    isAuthenticated,
    settings.push_notifications,
    settings.contribution_reminders,
    settings.language,
  ]);

  useEffect(() => {
    if (!isLoading) {
      SplashScreen.hideAsync();
    }
  }, [isLoading]);

  // Navigate based on auth state changes (e.g. sign out, delete account)
  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) {
      router.replace("/(auth)/welcome");
    }
  }, [isAuthenticated, isLoading]);

  if (isLoading) return null;

  // App always uses dark theme for now
  const statusBarStyle = "light";

  return (
    <ErrorBoundary>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <StatusBar style={statusBarStyle} />
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(auth)" options={{ animation: "fade" }} />
            <Stack.Screen name="(tabs)" options={{ animation: "fade" }} />
            <Stack.Screen
              name="group/[id]"
              options={{ animation: "slide_from_right" }}
            />
            <Stack.Screen
              name="group/join"
              options={{
                animation: "slide_from_bottom",
                presentation: "modal",
              }}
            />
            <Stack.Screen
              name="settings"
              options={{ animation: "slide_from_right" }}
            />
          </Stack>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
}
