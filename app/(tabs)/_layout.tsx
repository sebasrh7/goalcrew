import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Redirect, Tabs } from "expo-router";
import { Platform, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { t } from "../../src/lib/i18n";
import { useColors } from "../../src/lib/useColors";
import { useAuthStore } from "../../src/store/authStore";
import { useSettingsStore } from "../../src/store/settingsStore";

const isWeb = Platform.OS === "web";

export default function TabsLayout() {
  const { isAuthenticated } = useAuthStore();
  const { settings } = useSettingsStore();
  const lang = settings?.language || "es";
  const insets = useSafeAreaInsets();
  const C = useColors();

  if (!isAuthenticated) return <Redirect href="/(auth)/welcome" />;

  const tabBarHeight = isWeb ? 72 : 60 + insets.bottom;
  const tabBarPaddingBottom = isWeb ? 10 : insets.bottom || 8;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          ...styles.tabBar,
          borderTopColor: C.surface3,
          height: tabBarHeight,
          paddingBottom: tabBarPaddingBottom,
        },
        tabBarActiveTintColor: C.accent2,
        tabBarInactiveTintColor: C.text3,
        tabBarLabelStyle: styles.tabLabel,
        tabBarBackground: () => (
          <View style={[StyleSheet.absoluteFill, { backgroundColor: C.surface }]} />
        ),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t("home", lang),
          tabBarIcon: ({ focused, color }) => (
            <Ionicons
              name={focused ? "home" : "home-outline"}
              size={24}
              color={focused ? C.accent2 : C.text3}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="create"
        options={{
          title: t("create", lang),
          tabBarIcon: ({ focused }) => (
            <View style={[styles.createBtn, focused && styles.createBtnActive]}>
              <LinearGradient
                colors={
                  focused ? C.gradientPrimary : [C.surface3, C.surface2]
                }
                style={styles.createBtnGradient}
              >
                <Ionicons name="add" size={28} color="#fff" />
              </LinearGradient>
            </View>
          ),
          tabBarLabel: () => null,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: t("profile", lang),
          tabBarIcon: ({ focused, color }) => (
            <Ionicons
              name={focused ? "person" : "person-outline"}
              size={24}
              color={focused ? C.accent2 : C.text3}
            />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: "transparent",
    borderTopWidth: 1,
    paddingTop: 8,
    elevation: 0,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: "700",
  },
  createBtn: {
    width: 52,
    height: 52,
    borderRadius: 26,
    marginBottom: isWeb ? 0 : 8,
    overflow: "hidden",
  },
  createBtnActive: {
    ...Platform.select({
      web: {
        boxShadow: `0 4px 8px rgba(108, 99, 255, 0.4)`,
      },
      default: {
        shadowColor: "#6C63FF",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 8,
        elevation: 8,
      },
    }),
  },
  createBtnGradient: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
