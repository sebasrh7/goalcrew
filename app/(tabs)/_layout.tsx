import { Tabs, Redirect } from 'expo-router';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { BottomTabBarButtonProps } from '@react-navigation/bottom-tabs';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuthStore } from '../../src/store/authStore';
import { Colors, Radius } from '../../src/constants';

export default function TabsLayout() {
  const { isAuthenticated } = useAuthStore();
  if (!isAuthenticated) return <Redirect href="/(auth)/welcome" />;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
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
          title: 'Inicio',
          tabBarIcon: ({ focused }) => (
            <Text style={{ fontSize: 22, opacity: focused ? 1 : 0.5 }}>🏠</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="create"
        options={{
          title: 'Crear',
          tabBarIcon: ({ focused }) => (
            <View style={[styles.createBtn, focused && styles.createBtnActive]}>
              <LinearGradient
                colors={focused ? Colors.gradientPrimary : ['#232c42', '#1c2338']}
                style={styles.createBtnGradient}
              >
                <Text style={{ fontSize: 22 }}>➕</Text>
              </LinearGradient>
            </View>
          ),
          tabBarLabel: () => null,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ focused }) => (
            <Text style={{ fontSize: 22, opacity: focused ? 1 : 0.5 }}>👤</Text>
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: 'transparent',
    borderTopWidth: 1,
    borderTopColor: Colors.surface3,
    height: 80,
    paddingBottom: 20,
    paddingTop: 8,
    elevation: 0,
  },
  tabBarBg: {
    backgroundColor: Colors.surface,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '700',
  },
  createBtn: {
    width: 52,
    height: 52,
    borderRadius: 26,
    marginBottom: 8,
    overflow: 'hidden',
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
    alignItems: 'center',
    justifyContent: 'center',
  },
});
