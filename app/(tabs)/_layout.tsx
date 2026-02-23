import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Redirect, Tabs } from "expo-router";
import { StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors } from "../../src/constants";
import { useAuthStore } from "../../src/store/authStore";

export default function TabsLayout() {
  const { isAuthenticated } = useAuthStore();
  const insets = useSafeAreaInsets();

  if (!isAuthenticated) return <Redirect href="/(auth)/welcome" />;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          ...styles.tabBar,
          height: 60 + insets.bottom, // Altura dinámica basada en safe area
          paddingBottom: insets.bottom || 8, // Padding dinámico
        },
        tabBarActiveTintColor: Colors.accent2,
        tabBarInactiveTintColor: Colors.text3,
        tabBarLabelStyle: styles.tabLabel,
        tabBarBackground: () => (
          <View style={[StyleSheet.absoluteFill, styles.tabBarBg]} />
        ),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Inicio",
          tabBarIcon: ({ focused, color }) => (
            <Ionicons
              name={focused ? "home" : "home-outline"}
              size={24}
              color={focused ? Colors.accent2 : Colors.text3}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="create"
        options={{
          title: "Crear",
          tabBarIcon: ({ focused }) => (
            <View style={[styles.createBtn, focused && styles.createBtnActive]}>
              <LinearGradient
                colors={
                  focused ? Colors.gradientPrimary : ["#232c42", "#1c2338"]
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
          title: "Perfil",
          tabBarIcon: ({ focused, color }) => (
            <Ionicons
              name={focused ? "person" : "person-outline"}
              size={24}
              color={focused ? Colors.accent2 : Colors.text3}
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
    borderTopColor: Colors.surface3,
    paddingTop: 8,
    elevation: 0,
  },
  tabBarBg: {
    backgroundColor: Colors.surface,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: "700",
  },
  createBtn: {
    width: 52,
    height: 52,
    borderRadius: 26,
    marginBottom: 8,
    overflow: "hidden",
  },
  createBtnActive: {
    shadowColor: Colors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  createBtnGradient: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
