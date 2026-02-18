import * as Linking from "expo-linking";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { supabase } from "../src/lib/supabase";
import { initAuthListener, useAuthStore } from "../src/store/authStore";

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { isLoading } = useAuthStore();

  useEffect(() => {
    // Initialize Supabase auth listener
    initAuthListener();

    // Handle deep link OAuth callbacks
    const handleUrl = async ({ url }: { url: string }) => {
      console.log("Deep link received:", url);

      // Extract tokens from URL
      const hashParams = new URLSearchParams(url.split("#")[1] || "");
      const queryParams = new URLSearchParams(url.split("?")[1] || "");

      const accessToken =
        hashParams.get("access_token") || queryParams.get("access_token");
      const refreshToken =
        hashParams.get("refresh_token") || queryParams.get("refresh_token");

      if (accessToken && refreshToken) {
        console.log("Setting session from deep link...");
        const { error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });

        if (error) {
          console.error("Error setting session:", error);
        } else {
          console.log("Session set successfully from deep link!");
        }
      }
    };

    // Listen for URL changes
    const subscription = Linking.addEventListener("url", handleUrl);

    // Check initial URL (in case app was opened via deep link)
    Linking.getInitialURL().then((url) => {
      if (url) {
        handleUrl({ url });
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  useEffect(() => {
    if (!isLoading) {
      SplashScreen.hideAsync();
    }
  }, [isLoading]);

  if (isLoading) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar style="light" />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(auth)" options={{ animation: "fade" }} />
          <Stack.Screen name="(tabs)" options={{ animation: "fade" }} />
          <Stack.Screen
            name="group/[id]"
            options={{ animation: "slide_from_right" }}
          />
          <Stack.Screen
            name="group/join"
            options={{ animation: "slide_from_bottom", presentation: "modal" }}
          />
        </Stack>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
