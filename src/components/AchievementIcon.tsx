import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, View, ViewStyle } from "react-native";
import { ACHIEVEMENTS } from "../constants";
import { AchievementType } from "../types";

interface AchievementIconProps {
  type: AchievementType;
  size?: number;
  style?: ViewStyle;
}

export function AchievementIcon({
  type,
  size = 24,
  style,
}: AchievementIconProps) {
  const achievement = ACHIEVEMENTS[type];

  if (!achievement) {
    return null;
  }

  return (
    <View style={[styles.container, style]}>
      <Ionicons
        name={achievement.icon as any}
        size={size}
        color={achievement.color}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
});
