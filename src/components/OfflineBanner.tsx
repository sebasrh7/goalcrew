import { Ionicons } from "@expo/vector-icons";
import NetInfo from "@react-native-community/netinfo";
import React, { useEffect, useState } from "react";
import { Platform, StyleSheet, Text, View } from "react-native";
import { FontSize, Spacing } from "../constants";
import { t } from "../lib/i18n";
import { useColors } from "../lib/useColors";
import { useSettingsStore } from "../store/settingsStore";

export function OfflineBanner() {
  const [isOffline, setIsOffline] = useState(false);
  const C = useColors();
  const { settings } = useSettingsStore();
  const lang = settings.language || "es";

  useEffect(() => {
    if (Platform.OS === "web") return;
    const unsub = NetInfo.addEventListener((state) => {
      setIsOffline(!(state.isConnected && state.isInternetReachable !== false));
    });
    return () => unsub();
  }, []);

  if (!isOffline) return null;

  return (
    <View style={[styles.banner, { backgroundColor: C.red }]}>
      <Ionicons name="cloud-offline-outline" size={14} color="#fff" />
      <Text style={styles.text}>{t("offline", lang)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.xs,
    paddingVertical: 6,
  },
  text: {
    color: "#fff",
    fontSize: FontSize.xs,
    fontWeight: "700",
  },
});
